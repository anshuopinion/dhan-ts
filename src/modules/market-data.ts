import { AxiosInstance } from "axios";
import {
  MarketFeedRequest,
  HistoricalDataRequest,
  IntradayDataRequest,
  HistoricalDataResponse,
  TimeInterval,
} from "../types";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export class MarketData {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async getLTP(request: MarketFeedRequest): Promise<any> {
    const response = await this.axiosInstance.post(
      "/v2/marketfeed/ltp",
      request
    );
    return response.data;
  }

  async getOHLC(request: MarketFeedRequest): Promise<any> {
    const response = await this.axiosInstance.post(
      "/v2/marketfeed/ohlc",
      request
    );
    return response.data;
  }

  async getQuote(request: MarketFeedRequest): Promise<any> {
    const response = await this.axiosInstance.post(
      "/v2/marketfeed/quote",
      request
    );
    return response.data;
  }

  async getDailyHistoricalData(
    request: HistoricalDataRequest
  ): Promise<HistoricalDataResponse> {
    const response = await this.axiosInstance.post<HistoricalDataResponse>(
      "/v2/charts/historical",
      request
    );
    return response.data;
  }

  async getIntradayHistoricalData(
    request: IntradayDataRequest
  ): Promise<HistoricalDataResponse> {
    const response = await this.axiosInstance.post<HistoricalDataResponse>(
      "/v2/charts/intraday",
      request
    );
    return response.data;
  }

  async getProcessedCandleData(
    request: Omit<HistoricalDataRequest, "fromDate" | "toDate"> & {
      interval: TimeInterval;
      daysAgo?: number;
    }
  ): Promise<Candle[]> {
    const { interval, daysAgo = 60, ...baseRequest } = request;
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    let data: HistoricalDataResponse;
    const intervalInfo = this.getIntervalInfo(interval);

    if (intervalInfo.baseInterval >= 1440) {
      // 1 day or more
      data = await this.getDailyHistoricalData({
        ...baseRequest,
        toDate: toDate.toISOString().split("T")[0],
        fromDate: fromDate.toISOString().split("T")[0],
      });
      return this.combineDailyCandles(data, intervalInfo.multiplier, interval);
    } else {
      data = await this.getIntradayHistoricalData({
        ...baseRequest,
        toDate: toDate.toISOString().split("T")[0],
        fromDate: fromDate.toISOString().split("T")[0],
        interval: this.getClosestSupportedIntradayInterval(
          intervalInfo.baseInterval
        ).toString(),
      });
      return this.combineIntradayCandles(data, intervalInfo.baseInterval);
    }
  }

  private getIntervalInfo(interval: TimeInterval): {
    baseInterval: number;
    multiplier: number;
  } {
    const value = parseInt(interval.slice(0, -1));
    const unit = interval.slice(-1);
    switch (unit) {
      case "m":
        return { baseInterval: value, multiplier: 1 };
      case "d":
        return { baseInterval: 1440, multiplier: value };
      case "w":
        return { baseInterval: 1440, multiplier: 7 };
      case "y":
        return { baseInterval: 1440, multiplier: 365 };
      default: // 'M' for month
        return { baseInterval: 1440, multiplier: 30 }; // Approximating a month to 30 days
    }
  }

  private getClosestSupportedIntradayInterval(interval: number): number {
    const supportedIntervals = [1, 5, 15, 25, 60];
    return supportedIntervals.reduce((prev, curr) =>
      Math.abs(curr - interval) < Math.abs(prev - interval) ? curr : prev
    );
  }

  private combineIntradayCandles(
    data: HistoricalDataResponse,
    desiredIntervalMinutes: number
  ): Candle[] {
    const candles: Candle[] = [];
    const apiInterval = this.getApiInterval(data.timestamp);
    const multiplier = Math.max(
      1,
      Math.floor(desiredIntervalMinutes / apiInterval)
    );

    for (let i = 0; i < data.timestamp.length; i += multiplier) {
      const slice = {
        open: data.open.slice(i, i + multiplier),
        high: data.high.slice(i, i + multiplier),
        low: data.low.slice(i, i + multiplier),
        close: data.close.slice(i, i + multiplier),
        volume: data.volume.slice(i, i + multiplier),
        timestamp: data.timestamp.slice(i, i + multiplier),
      };

      candles.push({
        open: slice.open[0],
        high: Math.max(...slice.high),
        low: Math.min(...slice.low),
        close: slice.close[slice.close.length - 1],
        volume: slice.volume.reduce((a, b) => a + b, 0),
        timestamp: slice.timestamp[0],
      });
    }

    return candles;
  }

  private combineDailyCandles(
    data: HistoricalDataResponse,
    multiplier: number,
    interval: TimeInterval
  ): Candle[] {
    const candles: Candle[] = [];
    let currentCandle: Candle | null = null;
    let candleStartTimestamp = 0;

    for (let i = 0; i < data.timestamp.length; i++) {
      const timestamp = data.timestamp[i];
      const date = new Date(timestamp * 1000);

      if (!this.isValidTradingDay(date)) {
        continue; // Skip weekends and holidays
      }

      if (
        currentCandle === null ||
        this.shouldStartNewCandle(timestamp, candleStartTimestamp, interval)
      ) {
        if (currentCandle !== null) {
          candles.push(currentCandle);
        }
        currentCandle = {
          open: data.open[i],
          high: data.high[i],
          low: data.low[i],
          close: data.close[i],
          volume: data.volume[i],
          timestamp: timestamp,
        };
        candleStartTimestamp = timestamp;
      } else {
        currentCandle.high = Math.max(currentCandle.high, data.high[i]);
        currentCandle.low = Math.min(currentCandle.low, data.low[i]);
        currentCandle.close = data.close[i];
        currentCandle.volume += data.volume[i];
      }
    }

    if (currentCandle !== null) {
      candles.push(currentCandle);
    }

    return candles;
  }

  private isValidTradingDay(date: Date): boolean {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
    // Note: This doesn't account for holidays. You may want to add a holiday calendar check here.
  }

  private shouldStartNewCandle(
    currentTimestamp: number,
    startTimestamp: number,
    interval: TimeInterval
  ): boolean {
    const msPerDay = 24 * 60 * 60 * 1000;
    const currentDate = new Date(currentTimestamp * 1000);
    const startDate = new Date(startTimestamp * 1000);

    switch (interval) {
      case TimeInterval.WEEK_1:
        return (
          currentDate.getDay() < startDate.getDay() ||
          currentDate.getTime() - startDate.getTime() >= 7 * msPerDay
        );
      case TimeInterval.MONTH_1:
      case TimeInterval.MONTH_2:
      case TimeInterval.MONTH_3:
      case TimeInterval.MONTH_6:
        return (
          currentDate.getMonth() !== startDate.getMonth() ||
          currentDate.getFullYear() !== startDate.getFullYear()
        );
      case TimeInterval.YEAR_1:
        return currentDate.getFullYear() !== startDate.getFullYear();
      default:
        return false; // For daily candles, we don't need to start a new candle manually
    }
  }

  private getApiInterval(timestamps: number[]): number {
    if (timestamps.length < 2) return 1440; // Assume daily if not enough data
    return (timestamps[1] - timestamps[0]) / 60; // Convert seconds to minutes
  }
}
