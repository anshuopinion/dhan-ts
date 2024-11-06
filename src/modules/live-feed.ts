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
  private maxReconnectAttempts: number = 10;
  private baseReconnectDelay: number = 2000; // Start with 2 seconds
  private maxReconnectDelay: number = 60000; // Max 1 minute
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isIntentionalClose: boolean = false;
  private subscribedInstruments: Map<number, Instrument[]> = new Map();
  private connectionState:
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting" = "disconnected";

  constructor(config: DhanConfig) {
    this.config = config;
  }

  private getReconnectDelay(): number {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );
    // Add random jitter ±25%
    const jitter = exponentialDelay * (0.75 + Math.random() * 0.5);
    return Math.floor(jitter);
  }

  private setupPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.ping();
        } catch (error: any) {
          console.error("Ping failed:", error);
          this.handleConnectionError(error);
        }
      }
    }, 30000);
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      try {
        this.ws.terminate(); // Force close the connection
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
      this.ws = null;
    }
  }

  private async attemptReconnect() {
    if (this.isIntentionalClose) {
      console.log(
        "Connection was intentionally closed, not attempting reconnect"
      );
      return;
    }

    if (
      this.connectionState === "connecting" ||
      this.connectionState === "reconnecting"
    ) {
      console.log("Already attempting to reconnect");
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      this.emit(
        "error",
        new Error("Failed to reconnect after maximum attempts")
      );
      this.cleanup();
      return;
    }

    this.connectionState = "reconnecting";
    this.reconnectAttempts++;
    const delay = this.getReconnectDelay();

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    // Clear any existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        this.cleanup(); // Clean up before attempting new connection
        await this.connect();

        // Only resubscribe if connection was successful
        if (this.ws?.readyState === WebSocket.OPEN) {
          await this.resubscribeAll();
          this.reconnectAttempts = 0; // Reset counter on successful reconnection
          console.log("Successfully reconnected and resubscribed");
        }
      } catch (error: any) {
        console.error("Reconnection attempt failed:", error);
        this.handleConnectionError(error);
      }
    }, delay);
  }

  private async resubscribeAll() {
    const subscriptions = Array.from(this.subscribedInstruments.entries());

    for (const [requestCode, instruments] of subscriptions) {
      try {
        await new Promise<void>((resolve, reject) => {
          if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            reject(new Error("WebSocket not connected during resubscribe"));
            return;
          }

          const packet = this.createSubscriptionPacket(
            instruments,
            requestCode
          );
          this.ws.send(JSON.stringify(packet), (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });

        // Add small delay between resubscriptions to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log(
          `Resubscribed to ${instruments.length} instruments with request code ${requestCode}`
        );
      } catch (error) {
        console.error(
          `Failed to resubscribe to instruments with request code ${requestCode}:`,
          error
        );
        throw error; // Propagate error to trigger reconnection
      }
    }
  }

  private handleConnectionError(error: Error) {
    console.error("Connection error:", error);
    this.emit("error", error);

    if (!this.isIntentionalClose) {
      this.attemptReconnect();
    }
  }

  async connect(): Promise<void> {
    if (
      this.connectionState === "connecting" ||
      this.connectionState === "connected"
    ) {
      console.log("Already connected or connecting");
      return;
    }

    this.connectionState = "connecting";

    return new Promise((resolve, reject) => {
      try {
        const url = `wss://api-feed.dhan.co?version=2&token=${this.config.accessToken}&clientId=${this.config.clientId}&authType=2`;
        this.cleanup(); // Ensure clean slate before creating new connection
        this.ws = new WebSocket(url, {
          handshakeTimeout: 10000, // 10 second timeout for initial connection
          headers: {
            "User-Agent": "Mozilla/5.0", // Some servers require a user agent
          },
        });

        // Set timeout for connection attempt
        const connectionTimeout = setTimeout(() => {
          if (this.connectionState !== "connected") {
            const error = new Error("Connection timeout");
            this.handleConnectionError(error);
            reject(error);
          }
        }, 10000);

        this.ws.on("open", () => {
          clearTimeout(connectionTimeout);
          console.log("WebSocket connection established");
          this.connectionState = "connected";
          this.setupPingInterval();
          resolve();
        });

        this.ws.on("error", (error) => {
          clearTimeout(connectionTimeout);
          this.handleConnectionError(error);
          reject(error);
        });

        this.ws.on("close", (code, reason) => {
          clearTimeout(connectionTimeout);
          this.connectionState = "disconnected";
          console.log(
            `WebSocket closed with code ${code} and reason: ${reason}`
          );
          this.emit("close", { code, reason: reason.toString() });

          if (!this.isIntentionalClose) {
            this.attemptReconnect();
          }
        });

        this.ws.on("message", (data: Buffer) => {
          try {
            this.handleMessage(data);
          } catch (error) {
            console.error("Error handling message:", error);
          }
        });

        this.ws.on("pong", () => {
          // Reset connection timeout on pong response
          if (this.ws) {
            this.ws.removeAllListeners("timeout");
            this.ws.once("timeout", () =>
              this.handleConnectionError(new Error("Connection timeout"))
            );
          }
        });
      } catch (error) {
        this.connectionState = "disconnected";
        this.handleConnectionError(error as Error);
        reject(error);
      }
    });
  }

  subscribe(instruments: Instrument[], requestCode: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    // Store subscription for reconnection
    this.subscribedInstruments.set(requestCode, instruments);

    const packet = this.createSubscriptionPacket(instruments, requestCode);
    this.ws.send(JSON.stringify(packet), (error) => {
      if (error) {
        console.error("Error sending subscription:", error);
        this.handleConnectionError(error);
      }
    });
  }

  unsubscribe(instruments: Instrument[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    const packet = this.createSubscriptionPacket(instruments, 15);
    this.ws.send(JSON.stringify(packet), (error) => {
      if (error) {
        console.error("Error sending unsubscribe:", error);
        this.handleConnectionError(error);
      }
    });

    // Remove from stored subscriptions
    this.subscribedInstruments.forEach((storedInstruments, requestCode) => {
      const remainingInstruments = storedInstruments.filter(
        (inst) =>
          !instruments.some(
            (unsubInst) => inst[0] === unsubInst[0] && inst[1] === unsubInst[1]
          )
      );

      if (remainingInstruments.length === 0) {
        this.subscribedInstruments.delete(requestCode);
      } else {
        this.subscribedInstruments.set(requestCode, remainingInstruments);
      }
    });
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
    this.isIntentionalClose = true;
    this.connectionState = "disconnected";
    this.cleanup();
    this.subscribedInstruments.clear();
  }
  // Event emitter functionality
  private listeners: {
    [event: string]: ((
      data:
        | LiveFeedResponse
        | DisconnectionResponse
        | Error
        | { code: number; reason: string }
    ) => void)[];
  } = {};

  on(event: "data", listener: (data: LiveFeedResponse) => void): void;
  on(
    event: "disconnected",
    listener: (data: DisconnectionResponse) => void
  ): void;
  on(event: "error", listener: (error: Error) => void): void;
  on(
    event: "close",
    listener: (data: { code: number; reason: string }) => void
  ): void;
  on(event: string, listener: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  private emit(event: "data", data: LiveFeedResponse): void;
  private emit(event: "disconnected", data: DisconnectionResponse): void;
  private emit(event: "error", data: Error): void;
  private emit(event: "close", data: { code: number; reason: string }): void;
  private emit(
    event: string,
    data:
      | LiveFeedResponse
      | DisconnectionResponse
      | Error
      | { code: number; reason: string }
  ): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }
}
