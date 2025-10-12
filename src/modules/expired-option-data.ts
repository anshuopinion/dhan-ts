import { AxiosInstance } from "axios";
import {
  ExpiredOptionDataRequest,
  ExpiredOptionDataResponse,
} from "../types";

export class ExpiredOptionData {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async getRollingOptionData(
    request: ExpiredOptionDataRequest
  ): Promise<ExpiredOptionDataResponse> {
    const response = await this.axiosInstance.post<ExpiredOptionDataResponse>(
      "/v2/charts/rollingoption",
      request
    );
    return response.data;
  }
}
