import { AxiosInstance } from "axios";
import { LedgerEntry, TradeHistoryEntry } from "../types";

export class Statements {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async getLedgerReport(
    fromDate: string,
    toDate: string
  ): Promise<LedgerEntry[]> {
    const response = await this.axiosInstance.get<LedgerEntry[]>(`/v2/ledger`, {
      params: { from_date: fromDate, to_date: toDate },
    });
    return response.data;
  }

  async getTradeHistory(
    fromDate: string,
    toDate: string,
    page: number = 0
  ): Promise<TradeHistoryEntry[]> {
    const response = await this.axiosInstance.get<TradeHistoryEntry[]>(
      `/v2/tradeHistory/${fromDate}/${toDate}/${page}`
    );
    return response.data;
  }
}
