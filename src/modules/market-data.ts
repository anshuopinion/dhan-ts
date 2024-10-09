import { AxiosInstance } from "axios";
import {
  MarketFeedRequest,
  HistoricalDataRequest,
  IntradayDataRequest,
  HistoricalDataResponse,
} from "../types";

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
}
