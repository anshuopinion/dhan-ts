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

  constructor(config: DhanConfig) {
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `wss://api-feed.dhan.co?version=2&token=${this.config.accessToken}&clientId=${this.config.clientId}&authType=2`;
      this.ws = new WebSocket(url);

      this.ws.on("open", () => {
        console.log("WebSocket connection established");
        resolve();
      });

      this.ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      });

      this.ws.on("close", () => {
        console.log("WebSocket connection closed");
      });

      this.ws.on("message", (data: Buffer) => {
        this.handleMessage(data);
      });
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

  subscribe(instruments: Instrument[], requestCode: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    const packet = this.createSubscriptionPacket(instruments, requestCode);
    this.ws.send(JSON.stringify(packet));
  }

  unsubscribe(instruments: Instrument[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    const packet = this.createSubscriptionPacket(instruments, 15);
    this.ws.send(JSON.stringify(packet));
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Event emitter functionality
  private listeners: {
    [event: string]: ((
      data: LiveFeedResponse | DisconnectionResponse
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

  private emit(
    event: string,
    data: LiveFeedResponse | DisconnectionResponse
  ): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }
}
