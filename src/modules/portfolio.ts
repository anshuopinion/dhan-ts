import { AxiosInstance } from "axios";
import {
  HoldingsResponse,
  PositionResponse,
  ConvertPositionRequest,
  OrderResponse,
} from "../types";

export class Portfolio {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async getHoldings(): Promise<HoldingsResponse[]> {
    const response = await this.axiosInstance.get<HoldingsResponse[]>(
      "/v2/holdings"
    );
    return response.data;
  }

  async getPositions(): Promise<PositionResponse[]> {
    const response = await this.axiosInstance.get<PositionResponse[]>(
      "/v2/positions"
    );
    return response.data;
  }

  async convertPosition(
    request: ConvertPositionRequest
  ): Promise<OrderResponse> {
    const response = await this.axiosInstance.post<OrderResponse>(
      "/v2/positions/convert",
      request
    );
    return response.data;
  }
}
