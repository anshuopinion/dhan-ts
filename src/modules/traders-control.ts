import { AxiosInstance } from "axios";
import {
  KillSwitchStatus,
  KillSwitchResponse,
  KillSwitchStatusResponse,
  PnlExitRequest,
  PnlExitResponse,
  PnlExitConfig,
} from "../types";

export class TradersControl {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async setKillSwitch(status: KillSwitchStatus): Promise<KillSwitchResponse> {
    const response = await this.axiosInstance.post<KillSwitchResponse>(
      `/v2/killSwitch?killSwitchStatus=${status}`,
      {}
    );
    return response.data;
  }

  async getKillSwitchStatus(): Promise<KillSwitchStatusResponse> {
    const response = await this.axiosInstance.get<KillSwitchStatusResponse>(
      "/v2/killswitch"
    );
    return response.data;
  }

  async configurePnlExit(request: PnlExitRequest): Promise<PnlExitResponse> {
    const response = await this.axiosInstance.post<PnlExitResponse>(
      "/v2/pnlExit",
      request
    );
    return response.data;
  }

  async getPnlExit(): Promise<PnlExitConfig> {
    const response = await this.axiosInstance.get<PnlExitConfig>("/v2/pnlExit");
    return response.data;
  }

  async stopPnlExit(): Promise<PnlExitResponse> {
    const response = await this.axiosInstance.delete<PnlExitResponse>(
      "/v2/pnlExit"
    );
    return response.data;
  }
}
