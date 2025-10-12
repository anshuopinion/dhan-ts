import { AxiosInstance } from "axios";
import {
  SuperOrderRequest,
  SuperOrderResponse,
  ModifySuperOrderRequest,
  SuperOrderDetail,
  LegName,
} from "../types";

export class SuperOrders {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async placeSuperOrder(
    orderRequest: SuperOrderRequest
  ): Promise<SuperOrderResponse> {
    const response = await this.axiosInstance.post<SuperOrderResponse>(
      "/v2/super/orders",
      orderRequest
    );
    return response.data;
  }

  async modifySuperOrder(
    orderId: string,
    modifyRequest: ModifySuperOrderRequest
  ): Promise<SuperOrderResponse> {
    const response = await this.axiosInstance.put<SuperOrderResponse>(
      `/v2/super/orders/${orderId}`,
      modifyRequest
    );
    return response.data;
  }

  async cancelSuperOrder(
    orderId: string,
    legName: LegName
  ): Promise<SuperOrderResponse> {
    const response = await this.axiosInstance.delete<SuperOrderResponse>(
      `/v2/super/orders/${orderId}/${legName}`
    );
    return response.data;
  }

  async getSuperOrders(): Promise<SuperOrderDetail[]> {
    const response =
      await this.axiosInstance.get<SuperOrderDetail[]>("/v2/super/orders");
    return response.data;
  }
}
