import { AxiosInstance } from "axios";
import {
  MarketFeedRequest,
  HistoricalDataRequest,
  IntradayDataRequest,
  HistoricalDataResponse,
  TimeInterval,
  Candle,
} from "../types";
import {
  addDays,
  subDays,
  setHours,
  setMinutes,
  isWeekend,
  isBefore,
  parseISO,
  isAfter,
  getDay,
} from "date-fns";
import { toZonedTime, toDate, formatInTimeZone } from "date-fns-tz";

export class MarketData {
  private readonly kolkataTimeZone = "Asia/Kolkata";
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
    console.log("request", response.data);
    return response.data;
  }

  async getProcessedCandleData(
    request: Omit<HistoricalDataRequest, "fromDate" | "toDate"> & {
      interval: TimeInterval;
      from?: string;
      to?: string;
      daysAgo?: number;
    }
  ): Promise<HistoricalDataResponse> {
    const { interval, from, to, daysAgo, ...baseRequest } = request;
    let fromDate: Date, toDate: Date;

    if (from && to) {
      fromDate = parseISO(from);
      toDate = parseISO(to);
    } else if (daysAgo !== undefined) {
      toDate = this.getLatestValidMarketDate();
      fromDate = subDays(toDate, daysAgo);
    } else {
      // Default to 60 days if neither from/to nor daysAgo is provided
      toDate = this.getLatestValidMarketDate();
      fromDate = subDays(toDate, 60);
    }

    let data: HistoricalDataResponse;
    const intervalInfo = this.getIntervalInfo(interval);

    if (intervalInfo.baseInterval >= 1440) {
      // 1 day or more
      data = await this.getDailyHistoricalData({
        ...baseRequest,
        toDate: formatInTimeZone(toDate, this.kolkataTimeZone, "yyyy-MM-dd"),
        fromDate: formatInTimeZone(
          fromDate,
          this.kolkataTimeZone,
          "yyyy-MM-dd"
        ),
      });

      return this.combineDailyCandles(data, intervalInfo.multiplier, interval);
    } else {
      data = await this.getIntradayHistoricalData({
        ...baseRequest,
        toDate: formatInTimeZone(toDate, this.kolkataTimeZone, "yyyy-MM-dd"),
        fromDate: formatInTimeZone(
          fromDate,
          this.kolkataTimeZone,
          "yyyy-MM-dd"
        ),
        interval: this.getClosestSupportedIntradayInterval(
          intervalInfo.baseInterval
        ).toString(),
      });
      return this.combineIntradayCandles(data, intervalInfo.baseInterval);
    }
  }

  private combineIntradayCandles(
    data: HistoricalDataResponse,
    desiredIntervalMinutes: number
  ): HistoricalDataResponse {
    const result: HistoricalDataResponse = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: [],
      timestamp: [],
    };
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

      result.open.push(slice.open[0]);
      result.high.push(Math.max(...slice.high));
      result.low.push(Math.min(...slice.low));
      result.close.push(slice.close[slice.close.length - 1]);
      result.volume.push(slice.volume.reduce((a, b) => a + b, 0));
      result.timestamp.push(slice.timestamp[0]);
    }

    return result;
  }

  private combineDailyCandles(
    data: HistoricalDataResponse,
    multiplier: number,
    interval: TimeInterval
  ): HistoricalDataResponse {
    const result: HistoricalDataResponse = {
      open: [],
      high: [],
      low: [],
      close: [],
      volume: [],
      timestamp: [],
    };
    let currentCandle: Candle | null = null;
    let candleStartDate: Date | null = null;

    for (let i = 0; i < data.timestamp.length; i++) {
      const timestamp = data.timestamp[i];
      const date = new Date(timestamp * 1000);

      if (!this.isValidTradingDay(date)) {
        continue; // Skip weekends and holidays
      }

      if (
        !currentCandle ||
        !candleStartDate ||
        this.shouldStartNewCandle(date, candleStartDate, interval)
      ) {
        if (currentCandle) {
          result.open.push(currentCandle.open);
          result.high.push(currentCandle.high);
          result.low.push(currentCandle.low);
          result.close.push(currentCandle.close);
          result.volume.push(currentCandle.volume);
          result.timestamp.push(currentCandle.timestamp);
        }
        currentCandle = {
          open: data.open[i],
          high: data.high[i],
          low: data.low[i],
          close: data.close[i],
          volume: data.volume[i],
          timestamp: timestamp,
        };
        candleStartDate = date;
      } else {
        currentCandle.high = Math.max(currentCandle.high, data.high[i]);
        currentCandle.low = Math.min(currentCandle.low, data.low[i]);
        currentCandle.close = data.close[i];
        currentCandle.volume += data.volume[i];
      }
    }

    if (currentCandle) {
      result.open.push(currentCandle.open);
      result.high.push(currentCandle.high);
      result.low.push(currentCandle.low);
      result.close.push(currentCandle.close);
      result.volume.push(currentCandle.volume);
      result.timestamp.push(currentCandle.timestamp);
    }

    return result;
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
        return { baseInterval: 1440, multiplier: 1 };
      case "w":
        return { baseInterval: 1440, multiplier: 7 };
      case "y":
        return { baseInterval: 1440, multiplier: 365 };
      default: // 'M' for month
        return { baseInterval: 1440, multiplier: 30 }; // Approximating a month to 30 days
    }
  }

  private shouldStartNewCandle(
    currentDate: Date,
    startDate: Date,
    interval: TimeInterval
  ): boolean {
    switch (interval) {
      case TimeInterval.DAY_1:
        return (
          currentDate.getDate() !== startDate.getDate() ||
          currentDate.getMonth() !== startDate.getMonth() ||
          currentDate.getFullYear() !== startDate.getFullYear()
        );
      case TimeInterval.WEEK_1:
        return (
          currentDate.getTime() - startDate.getTime() >= 7 * 24 * 60 * 60 * 1000
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
        return false;
    }
  }
  private getClosestSupportedIntradayInterval(interval: number): number {
    const supportedIntervals = [1, 5, 15, 60];
    const intervalMap: { [key: number]: number } = {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 5,
      10: 5,
      15: 15,
      30: 15,
      45: 15,
      60: 60,
      120: 60,
      180: 60,
      240: 60,
    };

    if (interval in intervalMap) {
      return intervalMap[interval];
    }

    return supportedIntervals.reduce((prev, curr) =>
      Math.abs(curr - interval) < Math.abs(prev - interval) ? curr : prev
    );
  }
  private getLatestValidMarketDate(): Date {
    const now = new Date();
    const kolkataTime = toZonedTime(now, this.kolkataTimeZone);
    const marketOpenTime = setMinutes(setHours(kolkataTime, 9), 15);

    let validMarketDate = kolkataTime;

    // If the current date is in the future, move to the last Friday
    if (isAfter(validMarketDate, now)) {
      validMarketDate = this.getLastFriday(now);
    } else {
      // If it's before market open time, move to the previous day
      if (isBefore(kolkataTime, marketOpenTime)) {
        validMarketDate = subDays(validMarketDate, 1);
      }

      // Adjust for weekends
      while (isWeekend(validMarketDate)) {
        validMarketDate = subDays(validMarketDate, 1);
      }
    }

    // Convert back to UTC
    return toDate(validMarketDate, { timeZone: this.kolkataTimeZone });
  }
  private getLastFriday(date: Date): Date {
    let lastFriday = date;
    while (getDay(lastFriday) !== 5) {
      // 5 represents Friday
      lastFriday = subDays(lastFriday, 1);
    }
    return lastFriday;
  }
  private isValidTradingDay(date: Date): boolean {
    const kolkataDate = toZonedTime(date, this.kolkataTimeZone);
    return !isWeekend(kolkataDate);
    // Note: This doesn't account for holidays. You may want to add a holiday calendar check here.
  }

  private getApiInterval(timestamps: number[]): number {
    if (timestamps.length < 2) return 1440; // Assume daily if not enough data
    return (timestamps[1] - timestamps[0]) / 60; // Convert seconds to minutes
  }
}
