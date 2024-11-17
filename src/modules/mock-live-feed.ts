import EventEmitter from "events";
import {
  Instrument,
  ExchangeSegment,
  TickerResponse,
  QuoteResponse,
  OiDataResponse,
  PrevCloseResponse,
  FullMarketDataResponse,
  MarketDepthResponse,
  DhanConfig,
  FeedRequestCode,
} from "../types";

interface SecurityConfig {
  minPrice: number;
  maxPrice: number;
  volatility?: number; // Percentage of price range for random movements
  lastPrice?: number; // Track last generated price for continuity
}

interface MarketHours {
  start: string; // Format: "HH:mm" in 24hr
  end: string; // Format: "HH:mm" in 24hr
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export class MockLiveFeed extends EventEmitter {
  private isConnected: boolean = false;
  private subscribedInstruments: Map<FeedRequestCode, Instrument[]> = new Map();
  private mockDataInterval: NodeJS.Timeout | null = null;
  private readonly config: DhanConfig;
  private securityConfigs: Map<string, SecurityConfig> = new Map();
  private marketHours: MarketHours;

  constructor(config: DhanConfig) {
    super();
    this.config = config;

    this.marketHours = {
      start: "00:00", // For testing: Allow all hours
      end: "23:59",
      days: [0, 1, 2, 3, 4, 5, 6], // Allow all days for testing
    };
  }

  // Method to set market hours
  setMarketHours(hours: MarketHours) {
    this.marketHours = hours;
  }

  // Method to configure security-specific price ranges
  setSecurityConfig(securityId: string, config: SecurityConfig) {
    if (!config.volatility) {
      config.volatility = 0.2; // Default 0.2% volatility
    }
    this.securityConfigs.set(securityId, config);
  }

  // Method to set configs for multiple securities at once
  setSecurityConfigs(configs: { [securityId: string]: SecurityConfig }) {
    Object.entries(configs).forEach(([securityId, config]) => {
      this.setSecurityConfig(securityId, config);
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.emit("connected");
        resolve();
      }, 1000);
    });
  }

  subscribe(instruments: Instrument[], requestCode: FeedRequestCode): void {
    if (!this.isConnected) {
      throw new Error("WebSocket is not connected");
    }

    // Validate that we have configs for all instruments
    instruments.forEach(([_, securityId]) => {
      if (!this.securityConfigs.has(securityId)) {
        console.warn(
          `No price configuration found for security ${securityId}. Using default values.`
        );
        this.setSecurityConfig(securityId, {
          minPrice: 900,
          maxPrice: 1100,
          volatility: 0.2,
        });
      }
    });

    this.subscribedInstruments.set(requestCode, instruments);
    this.startMockDataStream(requestCode);
  }

  private isWithinMarketHours(): boolean {
    const now = new Date();
    const currentDay = now.getDay();

    // Check if current day is a trading day
    if (!this.marketHours.days.includes(currentDay)) {
      return false;
    }

    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    return (
      currentTime >= this.marketHours.start &&
      currentTime <= this.marketHours.end
    );
  }

  private generateTimestamp(): string {
    // If outside market hours, generate a timestamp within market hours
    if (!this.isWithinMarketHours()) {
      const now = new Date();
      const [hours, minutes] = this.marketHours.start.split(":");
      now.setHours(
        parseInt(hours, 10),
        parseInt(minutes, 10) + Math.floor(Math.random() * 30)
      );
      return now.toISOString();
    }
    return new Date().toISOString();
  }

  private generatePrice(securityId: string): number {
    const config = this.securityConfigs.get(securityId)!;
    const priceRange = config.maxPrice - config.minPrice;

    if (!config.lastPrice) {
      // First price generation
      config.lastPrice = config.minPrice + priceRange * Math.random();
    } else {
      // Generate new price based on previous price and volatility
      const maxMove = config.lastPrice * (config.volatility! / 100);
      const priceChange = (Math.random() - 0.5) * 2 * maxMove;
      const newPrice = config.lastPrice + priceChange;

      // Ensure price stays within bounds
      if (newPrice >= config.minPrice && newPrice <= config.maxPrice) {
        config.lastPrice = newPrice;
      }
    }

    return Number(config.lastPrice.toFixed(2));
  }

  private generateTickerResponse(
    exchangeSegment: ExchangeSegment,
    securityId: string
  ): TickerResponse {
    const price = this.generatePrice(securityId);
    return {
      type: "ticker",
      exchangeSegment,
      securityId: parseInt(securityId),
      lastTradedPrice: price,
      lastTradedTime: this.generateTimestamp(),
    };
  }

  private generateQuoteResponse(
    exchangeSegment: ExchangeSegment,
    securityId: string
  ): QuoteResponse {
    const price = this.generatePrice(securityId);
    const config = this.securityConfigs.get(securityId)!;

    return {
      type: "quote",
      exchangeSegment,
      securityId: parseInt(securityId),
      lastTradedPrice: price,
      lastTradedQuantity: Math.floor(Math.random() * 100) + 1,
      lastTradedTime: this.generateTimestamp(),
      averageTradePrice: price * (1 + (Math.random() - 0.5) * 0.001),
      volumeTraded: Math.floor(Math.random() * 10000),
      totalBuyQuantity: Math.floor(Math.random() * 5000),
      totalSellQuantity: Math.floor(Math.random() * 5000),
      openPrice: config.minPrice + (config.maxPrice - config.minPrice) * 0.4,
      highPrice: Math.min(price * 1.01, config.maxPrice),
      lowPrice: Math.max(price * 0.99, config.minPrice),
      closePrice: price * 0.995,
    };
  }

  private generateOiDataResponse(
    exchangeSegment: ExchangeSegment,
    securityId: number
  ): OiDataResponse {
    return {
      type: "oi_data",
      exchangeSegment,
      securityId,
      openInterest: Math.floor(Math.random() * 100000),
    };
  }

  private generatePrevCloseResponse(
    exchangeSegment: ExchangeSegment,
    securityId: number,
    price: number
  ): PrevCloseResponse {
    return {
      type: "prev_close",
      exchangeSegment,
      securityId,
      previousClosePrice: price * 0.995,
      previousOpenInterest: Math.floor(Math.random() * 90000),
    };
  }

  private generateFullResponse(
    exchangeSegment: ExchangeSegment,
    securityId: number,
    price: number
  ): FullMarketDataResponse {
    return {
      type: "full",
      exchangeSegment,
      securityId,
      lastTradedPrice: price,
      lastTradedQuantity: Math.floor(Math.random() * 100) + 1,
      lastTradedTime: new Date().toISOString(),
      averageTradePrice: price * (1 + (Math.random() - 0.5) * 0.01),
      volumeTraded: Math.floor(Math.random() * 10000),
      totalBuyQuantity: Math.floor(Math.random() * 5000),
      totalSellQuantity: Math.floor(Math.random() * 5000),
      openInterest: Math.floor(Math.random() * 100000),
      openInterestDayHigh: Math.floor(Math.random() * 120000),
      openInterestDayLow: Math.floor(Math.random() * 80000),
      openPrice: price * 0.99,
      closePrice: price * 0.995,
      highPrice: price * 1.02,
      lowPrice: price * 0.98,
      marketDepth: this.generateMarketDepth(price),
    };
  }

  private generateMarketDepth(basePrice: number): MarketDepthResponse {
    const depth: MarketDepthResponse = {
      buy: [],
      sell: [],
    };

    // Generate 5 price levels for buy and sell
    for (let i = 0; i < 5; i++) {
      const buyPrice = basePrice * (1 - (i + 1) * 0.001);
      const sellPrice = basePrice * (1 + (i + 1) * 0.001);

      depth.buy.push({
        quantity: Math.floor(Math.random() * 1000),
        price: buyPrice,
        orders: Math.floor(Math.random() * 20),
      });

      depth.sell.push({
        quantity: Math.floor(Math.random() * 1000),
        price: sellPrice,
        orders: Math.floor(Math.random() * 20),
      });
    }

    return depth;
  }
  private startMockDataStream(requestCode: FeedRequestCode): void {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
    }

    this.mockDataInterval = setInterval(() => {
      if (this.isWithinMarketHours()) {
        this.subscribedInstruments.forEach((instruments) => {
          instruments.forEach(([exchangeSegment, securityId]) => {
            // Generate primarily ticker responses for better performance

            switch (requestCode) {
              case FeedRequestCode.SUBSCRIBE_TICKER:
                this.emit(
                  "data",
                  this.generateTickerResponse(exchangeSegment, securityId)
                );
                break;
              case FeedRequestCode.SUBSCRIBE_QUOTE:
                this.emit(
                  "data",
                  this.generateQuoteResponse(exchangeSegment, securityId)
                );
                break;

              case FeedRequestCode.SUBSCRIBE_FULL:
                this.emit(
                  "data",
                  this.generateFullResponse(
                    exchangeSegment,
                    Number(securityId),
                    this.generatePrice(securityId)
                  )
                );
                break;
              default:
                console.warn(
                  `Unknown request code ${requestCode}. Skipping data generation.`
                );
            }
          });
        });
      }
    }, 1000); // Generate data every second
  }

  unsubscribe(instruments: Instrument[]): void {
    if (!this.isConnected) {
      throw new Error("WebSocket is not connected");
    }

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

  close(): void {
    this.isConnected = false;
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
    }
    this.emit("close", { code: 1000, reason: "Normal closure" });
  }
}

// Usage Example:
/*
const mockFeed = new MockLiveFeed(config);

// Configure security-specific price ranges
mockFeed.setSecurityConfigs({
  '1333': { // HDFC Bank
    minPrice: 1550,
    maxPrice: 1650,
    volatility: 0.5 // 0.5% volatility
  },
  '7508': { // Reliance
    minPrice: 2300,
    maxPrice: 2450,
    volatility: 0.3
  }
});

// Optionally set custom market hours
mockFeed.setMarketHours({
  start: "09:15",
  end: "15:30",
  days: [1, 2, 3, 4, 5] // Monday to Friday
});

mockFeed.connect().then(() => {
  const instruments: Instrument[] = [
    [ExchangeSegment.NSE_EQ, '1333'],
    [ExchangeSegment.NSE_EQ, '7508']
  ];
  
  mockFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_FULL);
});

mockFeed.on('data', (data) => {
  console.log('Received mock data:', data);
});
*/
