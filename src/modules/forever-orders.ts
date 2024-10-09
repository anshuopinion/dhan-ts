import { AxiosInstance } from "axios";
import {
  ForeverOrderRequest,
  ForeverOrderResponse,
  ForeverOrderDetail,
  ModifyForeverOrderRequest,
} from "../types";

export class ForeverOrders {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async createForeverOrder(
    orderRequest: ForeverOrderRequest
  ): Promise<ForeverOrderResponse> {
    const response = await this.axiosInstance.post<ForeverOrderResponse>(
      "/v2/forever/orders",
      orderRequest
    );
    return response.data;
  }

  async modifyForeverOrder(
    orderId: string,
    modifyRequest: ModifyForeverOrderRequest
  ): Promise<ForeverOrderResponse> {
    const response = await this.axiosInstance.put<ForeverOrderResponse>(
      `/v2/forever/orders/${orderId}`,
      modifyRequest
    );
    return response.data;
  }

  async cancelForeverOrder(orderId: string): Promise<ForeverOrderResponse> {
    const response = await this.axiosInstance.delete<ForeverOrderResponse>(
      `/v2/forever/orders/${orderId}`
    );
    return response.data;
  }

  async getAllForeverOrders(): Promise<ForeverOrderDetail[]> {
    const response = await this.axiosInstance.get<ForeverOrderDetail[]>(
      "/v2/forever/all"
    );
    return response.data;
  }
}
