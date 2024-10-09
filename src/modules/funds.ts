import { AxiosInstance } from "axios";
import {
  FundLimitResponse,
  MarginCalculatorRequest,
  MarginCalculatorResponse,
} from "../types";

export class Funds {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async getFundLimit(): Promise<FundLimitResponse> {
    const response = await this.axiosInstance.get<FundLimitResponse>(
      "/v2/fundlimit"
    );
    return response.data;
  }

  async calculateMargin(
    request: MarginCalculatorRequest
  ): Promise<MarginCalculatorResponse> {
    const response = await this.axiosInstance.post<MarginCalculatorResponse>(
      "/v2/margincalculator",
      request
    );
    return response.data;
  }
}
