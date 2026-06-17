import { AxiosInstance } from "axios";
import {
  ConditionalTriggerRequest,
  ConditionalTriggerResponse,
  ConditionalTriggerDetail,
} from "../types";

/**
 * Conditional Triggers (Alerts) module for Dhan API
 * Place price/technical-indicator based triggers that auto-place orders when met.
 * Note: currently supported only for Equities and Indices.
 */
export class ConditionalTriggers {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async placeTrigger(
    request: ConditionalTriggerRequest
  ): Promise<ConditionalTriggerResponse> {
    const response = await this.axiosInstance.post<ConditionalTriggerResponse>(
      "/v2/alerts/orders",
      request
    );
    return response.data;
  }

  async modifyTrigger(
    alertId: string,
    request: ConditionalTriggerRequest
  ): Promise<ConditionalTriggerResponse> {
    const response = await this.axiosInstance.put<ConditionalTriggerResponse>(
      `/v2/alerts/orders/${alertId}`,
      request
    );
    return response.data;
  }

  async deleteTrigger(alertId: string): Promise<ConditionalTriggerResponse> {
    const response = await this.axiosInstance.delete<ConditionalTriggerResponse>(
      `/v2/alerts/orders/${alertId}`
    );
    return response.data;
  }

  async getTriggerById(alertId: string): Promise<ConditionalTriggerDetail> {
    const response = await this.axiosInstance.get<ConditionalTriggerDetail>(
      `/v2/alerts/orders/${alertId}`
    );
    return response.data;
  }

  async getAllTriggers(): Promise<ConditionalTriggerDetail[]> {
    const response = await this.axiosInstance.get<ConditionalTriggerDetail[]>(
      "/v2/alerts/orders"
    );
    return response.data;
  }
}
