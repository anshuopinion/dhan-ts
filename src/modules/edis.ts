import { AxiosInstance } from "axios";
import {
  EdisFormRequest,
  EdisFormResponse,
  EdisInquiryResponse,
} from "../types";

export class EDIS {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  async generateTpin(): Promise<void> {
    await this.axiosInstance.get("/v2/edis/tpin");
  }

  async generateEdisForm(request: EdisFormRequest): Promise<EdisFormResponse> {
    const response = await this.axiosInstance.post<EdisFormResponse>(
      "/v2/edis/form",
      request
    );
    return response.data;
  }

  async inquireEdisStatus(isin: string): Promise<EdisInquiryResponse> {
    const response = await this.axiosInstance.get<EdisInquiryResponse>(
      `/v2/edis/inquire/${isin}`
    );
    return response.data;
  }
}
