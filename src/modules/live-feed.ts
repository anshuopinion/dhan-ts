import WebSocket from "ws";
import {
  DhanConfig,
  LiveFeedResponse,
  DisconnectionResponse,
  Instrument,
  ExchangeSegment,
  TickerResponse,
  QuoteResponse,
  OiDataResponse,
  PrevCloseResponse,
  MarketStatusResponse,
  FullMarketDataResponse,
  MarketDepthResponse,
  DepthLevel,
} from "../types";

export class LiveFeed {
  private ws: WebSocket | null = null;
  private readonly config: DhanConfig;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 5000; // 5 seconds
  private isReconnecting: boolean = false;
  private subscribeQueue: { instruments: Instrument[]; requestCode: number }[] =
    [];
  private activeSubscriptions: Map<
    string,
    { instruments: Instrument[]; requestCode: number }
  > = new Map();
  private pingTimeout: NodeJS.Timeout | null = null;
  private readonly pingInterval: number = 10000; // 10 seconds
  private readonly pingTimeoutDuration: number = 40000; // 40 seconds

  constructor(config: DhanConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig() {
    if (!this.config.accessToken || !this.config.clientId) {
      throw new Error(
        "Invalid configuration: accessToken and clientId are required"
      );
    }
  }

  private getConnectionUrl(): string {
    return `wss://api-feed.dhan.co?version=2&token=${this.config.accessToken}&clientId=${this.config.clientId}&authType=2`;
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already connected");
      return;
    }

    if (this.isReconnecting) {
      console.log("Reconnection in progress");
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const url = this.getConnectionUrl();
        this.ws = new WebSocket(url);

        this.ws.on("open", () => {
          console.log("WebSocket connection established");
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.setupPingPong();
          this.resubscribeAll();
          resolve();
        });

        this.ws.on("error", (error) => {
          console.error("WebSocket error:", error);
          this.handleError(error);
          if (!this.isReconnecting) {
            reject(error);
          }
        });

        this.ws.on("close", (code, reason) => {
          console.log(`WebSocket connection closed: ${code} - ${reason}`);
          this.cleanupConnection();
          this.handleReconnection();
        });

        this.ws.on("message", (data: Buffer) => {
          try {
            this.handleMessage(data);
          } catch (error) {
            console.error("Error handling message:", error);
            this.emit("error", { type: "message_handling_error", error });
          }
        });
      } catch (error) {
        console.error("Connection error:", error);
        reject(error);
      }
    });
  }

  private setupPingPong() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }

    this.pingTimeout = setTimeout(() => {
      console.log("Ping timeout - closing connection");
      this.cleanupConnection();
      this.handleReconnection();
    }, this.pingTimeoutDuration);

    // Handle incoming pings from server
    if (this.ws) {
      this.ws.on("ping", () => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.pong();
          this.resetPingTimeout();
        }
      });
    }
  }

  private resetPingTimeout() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }
    this.setupPingPong();
  }

  private cleanupConnection() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws = null;
    }
  }

  private async handleReconnection() {
    if (
      this.isReconnecting ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(
      `Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, this.reconnectDelay));
      await this.connect();
    } catch (error) {
      console.error("Reconnection failed:", error);
      this.emit("error", { type: "reconnection_error", error });
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnection();
      } else {
        this.emit("error", {
          type: "max_reconnection_attempts_reached",
          message: "Failed to reconnect after maximum attempts",
        });
      }
    }
  }
  private validateInstruments(instruments: Instrument[]) {
    if (!Array.isArray(instruments) || instruments.length === 0) {
      throw new Error("Invalid instruments array");
    }

    if (instruments.length > 100) {
      throw new Error(
        "Maximum 100 instruments allowed per subscription request"
      );
    }

    const totalSubscriptions =
      this.getTotalSubscriptionCount() + instruments.length;
    if (totalSubscriptions > 5000) {
      throw new Error("Maximum subscription limit (5000) exceeded");
    }
  }

  private getTotalSubscriptionCount(): number {
    return Array.from(this.activeSubscriptions.values()).reduce(
      (total, sub) => total + sub.instruments.length,
      0
    );
  }

  private getSubscriptionKey(instrument: Instrument): string {
    return `${instrument[0]}_${instrument[1]}`;
  }

  subscribe(instruments: Instrument[], requestCode: number) {
    try {
      this.validateInstruments(instruments);

      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.subscribeQueue.push({ instruments, requestCode });
        this.connect().catch((error) => {
          console.error("Failed to connect for subscription:", error);
          throw error;
        });
        return;
      }

      const packet = this.createSubscriptionPacket(instruments, requestCode);
      this.ws.send(JSON.stringify(packet));

      // Store active subscriptions
      instruments.forEach((instrument) => {
        const key = this.getSubscriptionKey(instrument);
        this.activeSubscriptions.set(key, {
          instruments: [instrument],
          requestCode,
        });
      });
    } catch (error) {
      console.error("Subscription error:", error);
      this.emit("error", { type: "subscription_error", error });
      throw error;
    }
  }

  private async resubscribeAll() {
    // First handle queued subscriptions
    while (this.subscribeQueue.length > 0) {
      const subscription = this.subscribeQueue.shift();
      if (subscription) {
        try {
          await this.subscribe(
            subscription.instruments,
            subscription.requestCode
          );
        } catch (error) {
          console.error("Failed to process queued subscription:", error);
        }
      }
    }

    // Then resubscribe active subscriptions
    for (const [, subscription] of this.activeSubscriptions) {
      try {
        await this.subscribe(
          subscription.instruments,
          subscription.requestCode
        );
      } catch (error) {
        console.error("Failed to resubscribe:", error);
      }
    }
  }

  unsubscribe(instruments: Instrument[]) {
    try {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected");
      }

      const packet = this.createSubscriptionPacket(instruments, 16); // Using unsubscribe request code
      this.ws.send(JSON.stringify(packet));

      // Remove from active subscriptions
      instruments.forEach((instrument) => {
        const key = this.getSubscriptionKey(instrument);
        this.activeSubscriptions.delete(key);
      });
    } catch (error) {
      console.error("Unsubscribe error:", error);
      this.emit("error", { type: "unsubscribe_error", error });
      throw error;
    }
  }

  private handleError(error: Error) {
    this.emit("error", { type: "websocket_error", error });
  }

  private handleMessage(data: Buffer) {
    const responseCode = data.readUInt8(0);
    let parsedData: LiveFeedResponse | null = null;

    switch (responseCode) {
      case 2:
        parsedData = this.parseTickerPacket(data);
        break;
      case 4:
        parsedData = this.parseQuotePacket(data);
        break;
      case 5:
        parsedData = this.parseOIDataPacket(data);
        break;
      case 6:
        parsedData = this.parsePrevClosePacket(data);
        break;
      case 7:
        parsedData = this.parseMarketStatusPacket(data);
        break;
      case 8:
        parsedData = this.parseFullPacket(data);
        break;
      case 50:
        this.handleDisconnection(data);
        return;
      default:
        console.warn(`Unknown response code: ${responseCode}`);
        return;
    }

    if (parsedData) {
      this.emit("data", parsedData);
    }
  }

  private parseTickerPacket(data: Buffer): TickerResponse {
    return {
      type: "ticker",
      exchangeSegment: data.readUInt8(1),
      securityId: data.readUInt32LE(4),
      lastTradedPrice: data.readFloatLE(8),
      lastTradedTime: new Date(data.readUInt32LE(12) * 1000).toISOString(),
    };
  }

  private parseQuotePacket(data: Buffer): QuoteResponse {
    return {
      type: "quote",
      exchangeSegment: data.readUInt8(1),
      securityId: data.readUInt32LE(4),
      lastTradedPrice: data.readFloatLE(8),
      lastTradedQuantity: data.readUInt16LE(12),
      lastTradedTime: new Date(data.readUInt32LE(14) * 1000).toISOString(),
      averageTradePrice: data.readFloatLE(18),
      volumeTraded: data.readUInt32LE(22),
      totalBuyQuantity: data.readUInt32LE(26),
      totalSellQuantity: data.readUInt32LE(30),
      openPrice: data.readFloatLE(34),
      highPrice: data.readFloatLE(38),
      lowPrice: data.readFloatLE(42),
      closePrice: data.readFloatLE(46),
    };
  }

  private parseOIDataPacket(data: Buffer): OiDataResponse {
    return {
      type: "oi_data",
      exchangeSegment: data.readUInt8(1),
      securityId: data.readUInt32LE(4),
      openInterest: data.readUInt32LE(8),
    };
  }

  private parsePrevClosePacket(data: Buffer): PrevCloseResponse {
    return {
      type: "prev_close",
      exchangeSegment: data.readUInt8(1),
      securityId: data.readUInt32LE(4),
      previousClosePrice: data.readFloatLE(8),
      previousOpenInterest: data.readUInt32LE(12),
    };
  }

  private parseMarketStatusPacket(data: Buffer): MarketStatusResponse {
    return {
      type: "market_status",
      status: data.readUInt8(0) === 7 ? "open" : "closed",
    };
  }

  private parseFullPacket(data: Buffer): FullMarketDataResponse {
    const packet: FullMarketDataResponse = {
      type: "full",
      exchangeSegment: data.readUInt8(1),
      securityId: data.readUInt32LE(4),
      lastTradedPrice: data.readFloatLE(8),
      lastTradedQuantity: data.readUInt16LE(12),
      lastTradedTime: new Date(data.readUInt32LE(14) * 1000).toISOString(),
      averageTradePrice: data.readFloatLE(18),
      volumeTraded: data.readUInt32LE(22),
      totalBuyQuantity: data.readUInt32LE(26),
      totalSellQuantity: data.readUInt32LE(30),
      openInterest: data.readUInt32LE(34),
      openInterestDayHigh: data.readUInt32LE(38),
      openInterestDayLow: data.readUInt32LE(42),
      openPrice: data.readFloatLE(46),
      closePrice: data.readFloatLE(50),
      highPrice: data.readFloatLE(54),
      lowPrice: data.readFloatLE(58),
      marketDepth: this.parseMarketDepth(data.slice(58)),
    };

    return packet;
  }

  private parseMarketDepth(data: Buffer): MarketDepthResponse {
    const depth: MarketDepthResponse = {
      buy: [],
      sell: [],
    };

    for (let i = 0; i < 5; i++) {
      const offset = i * 20;
      const buyLevel: DepthLevel = {
        quantity: data.readInt32LE(offset),
        price: data.readFloatLE(offset + 12),
        orders: data.readInt16LE(offset + 8),
      };
      const sellLevel: DepthLevel = {
        quantity: data.readInt32LE(offset + 4),
        price: data.readFloatLE(offset + 16),
        orders: data.readInt16LE(offset + 10),
      };
      depth.buy.push(buyLevel);
      depth.sell.push(sellLevel);
    }

    return depth;
  }

  private handleDisconnection(data: Buffer) {
    const errorCode = data.readUInt16LE(8);
    let reason: string;

    switch (errorCode) {
      case 805:
        reason = "Connection limit exceeded";
        break;
      case 806:
        reason = "Data APIs not subscribed";
        break;
      case 807:
        reason = "Access token expired";
        break;
      case 808:
        reason = "Authentication failed";
        break;
      case 809:
        reason = "Invalid access token";
        break;
      default:
        reason = "Unknown reason";
    }

    const disconnectionData: DisconnectionResponse = { errorCode, reason };
    console.log(`WebSocket disconnected: ${reason}`);
    this.emit("disconnected", disconnectionData);
  }

  private createSubscriptionPacket(
    instruments: Instrument[],
    requestCode: number
  ): object {
    return {
      RequestCode: requestCode,
      InstrumentCount: instruments.length,
      InstrumentList: instruments.map(([exchangeSegment, securityId]) => ({
        ExchangeSegment: ExchangeSegment[exchangeSegment],
        SecurityId: securityId,
      })),
    };
  }
  close() {
    this.subscribeQueue = [];
    this.activeSubscriptions.clear();
    this.cleanupConnection();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (error) {
        console.error("Error closing WebSocket:", error);
      }
    }
  }
  // Event emitter functionality
  private listeners: {
    [event: string]: ((
      data: LiveFeedResponse | DisconnectionResponse | any
    ) => void)[];
  } = {};

  on(event: "data", listener: (data: LiveFeedResponse) => void): void;
  on(
    event: "disconnected",
    listener: (data: DisconnectionResponse) => void
  ): void;
  on(event: "error", listener: (error: any) => void): void;
  on(event: string, listener: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}
