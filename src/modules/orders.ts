import { AxiosInstance } from "axios";
import { OrderRequest, OrderResponse, OrderDetail } from "../types";

export class Orders {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    const response = await this.axiosInstance.post<OrderResponse>(
      "/v2/orders",
      orderRequest
    );
    return response.data;
  }

  async modifyOrder(
    orderId: string,
    modifyRequest: Partial<OrderRequest>
  ): Promise<OrderResponse> {
    const response = await this.axiosInstance.put<OrderResponse>(
      `/v2/orders/${orderId}`,
      modifyRequest
    );
    return response.data;
  }

  async cancelOrder(orderId: string): Promise<OrderResponse> {
    const response = await this.axiosInstance.delete<OrderResponse>(
      `/v2/orders/${orderId}`
    );
    return response.data;
  }

  async getOrders(): Promise<OrderDetail[]> {
    const response = await this.axiosInstance.get<OrderDetail[]>("/v2/orders");
    return response.data;
  }

  async getOrderById(orderId: string): Promise<OrderDetail> {
    const response = await this.axiosInstance.get<OrderDetail>(
      `/v2/orders/${orderId}`
    );
    return response.data;
  }

  async getOrderByCorrelationId(correlationId: string): Promise<OrderDetail> {
    const response = await this.axiosInstance.get<OrderDetail>(
      `/v2/orders/external/${correlationId}`
    );
    return response.data;
  }

  async getTrades(): Promise<OrderDetail[]> {
    const response = await this.axiosInstance.get<OrderDetail[]>("/v2/trades");
    return response.data;
  }

  async getTradesByOrderId(orderId: string): Promise<OrderDetail> {
    const response = await this.axiosInstance.get<OrderDetail>(
      `/v2/trades/${orderId}`
    );
    return response.data;
  }

  async placeSliceOrder(orderRequest: OrderRequest): Promise<OrderResponse[]> {
    const response = await this.axiosInstance.post<OrderResponse[]>(
      "/v2/orders/slicing",
      orderRequest
    );
    return response.data;
  }
}
