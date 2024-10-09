import { AxiosInstance } from "axios";
import { KillSwitchStatus, KillSwitchResponse } from "../types";

export class TradersControl {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async setKillSwitch(status: KillSwitchStatus): Promise<KillSwitchResponse> {
    const response = await this.axiosInstance.post<KillSwitchResponse>(
      `/v2/killSwitch?killSwitchStatus=${status}`,
      {}
    );
    return response.data;
  }
}
