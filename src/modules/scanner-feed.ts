import axios from "axios";
import {ScannerRequest, ScannerResponse} from "../types/scanner";

/**
 * Scanner class for stock screening using Dhan's public scanner API
 * This is a simple wrapper that passes requests directly to the API
 * All scanner logic and filtering is handled by the API endpoint
 */
export class Scanner {
	constructor() {
		// No authentication needed for the public scanner endpoint
	}

	/**
	 * Execute a scanner/screener query
	 * @param request Scanner request configuration - pass any data the API expects
	 * @returns Scanner response with matching stocks
	 */
	async scan(request: ScannerRequest): Promise<ScannerResponse> {
		const response = await axios.post("https://ow-scanx-analytics.dhan.co/customscan/fetchdt", request, {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json, text/plain, */*",
				Origin: "https://scanx.trade",
				"User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
			},
		});
		return response.data;
	}
}
