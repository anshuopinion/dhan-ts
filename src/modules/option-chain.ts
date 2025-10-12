import { AxiosInstance } from "axios";
import {
  OptionChainRequest,
  OptionChainResponse,
  ExpiryListRequest,
  ExpiryListResponse,
} from "../types";

export class OptionChain {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async getOptionChain(
    request: OptionChainRequest
  ): Promise<OptionChainResponse> {
    const response = await this.axiosInstance.post<OptionChainResponse>(
      "/v2/optionchain",
      request
    );
    return response.data;
  }

  async getExpiryList(
    request: ExpiryListRequest
  ): Promise<ExpiryListResponse> {
    const response = await this.axiosInstance.post<ExpiryListResponse>(
      "/v2/optionchain/expirylist",
      request
    );
    return response.data;
  }
}
