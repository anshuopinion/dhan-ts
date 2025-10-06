import axios, { AxiosInstance } from "axios";
import {
	GenerateConsentAppRequest,
	GenerateConsentAppResponse,
	ConsumeConsentAppRequest,
	ConsumeConsentAppResponse,
	GenerateConsentPartnerResponse,
	ConsumeConsentPartnerRequest,
	ConsumeConsentPartnerResponse,
	SetIPRequest,
	ModifyIPRequest,
	IPResponse,
	GetIPResponse,
	UserProfileResponse,
} from "../types";

/**
 * Authentication module for Dhan API
 * Handles app-based authentication, partner authentication, IP management, and user profile
 */
export class Authentication {
	constructor(private readonly axiosInstance: AxiosInstance) {}

	/**
	 * Generate consent for app-based (individual) authentication
	 * @param apiKey - API Key generated from Dhan
	 * @param apiSecret - API Secret generated from Dhan
	 * @param dhanClientId - Dhan Client ID
	 * @returns Promise containing consent app ID and status
	 */
	async generateConsentApp(
		apiKey: string,
		apiSecret: string,
		dhanClientId: string
	): Promise<GenerateConsentAppResponse> {
		const response = await axios.post<GenerateConsentAppResponse>(
			`https://auth.dhan.co/app/generate-consent?client_id=${dhanClientId}`,
			{},
			{
				headers: {
					app_id: apiKey,
					app_secret: apiSecret,
				},
			}
		);
		return response.data;
	}

	/**
	 * Consume consent to generate access token for app-based authentication
	 * @param apiKey - API Key generated from Dhan
	 * @param apiSecret - API Secret generated from Dhan
	 * @param tokenId - Token ID obtained from browser login redirect
	 * @returns Promise containing access token and user details
	 */
	async consumeConsentApp(
		apiKey: string,
		apiSecret: string,
		tokenId: string
	): Promise<ConsumeConsentAppResponse> {
		const response = await axios.get<ConsumeConsentAppResponse>(
			`https://auth.dhan.co/app/consumeApp-consent?tokenId=${tokenId}`,
			{
				headers: {
					app_id: apiKey,
					app_secret: apiSecret,
				},
			}
		);
		return response.data;
	}

	/**
	 * Generate consent for partner authentication
	 * @param partnerId - Partner ID provided by Dhan
	 * @param partnerSecret - Partner Secret provided by Dhan
	 * @returns Promise containing consent ID and status
	 */
	async generateConsentPartner(
		partnerId: string,
		partnerSecret: string
	): Promise<GenerateConsentPartnerResponse> {
		const response = await axios.post<GenerateConsentPartnerResponse>(
			"https://auth.dhan.co/partner/generate-consent",
			{},
			{
				headers: {
					partner_id: partnerId,
					partner_secret: partnerSecret,
				},
			}
		);
		return response.data;
	}

	/**
	 * Consume consent to generate access token for partner authentication
	 * @param partnerId - Partner ID provided by Dhan
	 * @param partnerSecret - Partner Secret provided by Dhan
	 * @param tokenId - Token ID obtained from browser login redirect
	 * @returns Promise containing access token and user details
	 */
	async consumeConsentPartner(
		partnerId: string,
		partnerSecret: string,
		tokenId: string
	): Promise<ConsumeConsentPartnerResponse> {
		const response = await axios.get<ConsumeConsentPartnerResponse>(
			`https://auth.dhan.co/partner/consume-consent?tokenId=${tokenId}`,
			{
				headers: {
					partner_id: partnerId,
					partner_secret: partnerSecret,
				},
			}
		);
		return response.data;
	}

	/**
	 * Set static IP for the account (Primary or Secondary)
	 * Once set, cannot be modified for 7 days
	 * @param request - Request containing dhanClientId, IP address, and IP flag
	 * @returns Promise containing success message and status
	 */
	async setIP(request: SetIPRequest): Promise<IPResponse> {
		const response = await this.axiosInstance.post<IPResponse>(
			"/v2/ip/setIP",
			request
		);
		return response.data;
	}

	/**
	 * Modify static IP for the account
	 * Can only be used when modification period is allowed (after 7 days)
	 * @param request - Request containing dhanClientId, IP address, and IP flag
	 * @returns Promise containing success message and status
	 */
	async modifyIP(request: ModifyIPRequest): Promise<IPResponse> {
		const response = await this.axiosInstance.put<IPResponse>(
			"/v2/ip/modifyIP",
			request
		);
		return response.data;
	}

	/**
	 * Get currently set static IPs (Primary and Secondary)
	 * @returns Promise containing current IPs and their modification dates
	 */
	async getIP(): Promise<GetIPResponse> {
		const response = await this.axiosInstance.get<GetIPResponse>("/v2/ip/getIP");
		return response.data;
	}

	/**
	 * Get user profile information
	 * Useful for checking access token validity and account setup
	 * @returns Promise containing user profile details
	 */
	async getUserProfile(): Promise<UserProfileResponse> {
		const response = await this.axiosInstance.get<UserProfileResponse>(
			"/v2/profile"
		);
		return response.data;
	}
}
