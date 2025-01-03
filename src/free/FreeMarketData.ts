import axios from "axios";
import {IntradayDataRequest, HistoricalDataRequest, HistoricalDataResponse, DhanApiResponse} from "../types";
import {searchBySecId} from "../constant/dhan";

interface DhanHistoricalDataRequest {
	EXCH: string;
	SYM?: string;
	SEG: string;
	INST: string;
	START: number;
	SEC_ID?: number;
	END: number;
	INTERVAL?: string;
}

export class FreeMarketData {
	private readonly DHAN_API_URL = "https://ticks.dhan.co";

	// Function for intraday data (1-minute data)
	async getFreeIntradayHistoricalData(request: IntradayDataRequest): Promise<HistoricalDataResponse> {
		try {
			const dhanRequest: DhanHistoricalDataRequest = {
				EXCH: "NSE",
				SEG: "E",
				INST: "EQUITY",
				SEC_ID: Number(request.securityId),
				START: this.dateToTimestamp(request.fromDate),
				END: this.dateToTimestamp(request.toDate, true),
				INTERVAL: request.interval,
			};

			const response = await axios.post<DhanApiResponse>(`${this.DHAN_API_URL}/getData`, dhanRequest, {
				headers: this.getApiHeaders(),
			});

			if (!response.data.success) {
				throw new Error("Failed to fetch intraday data from Dhan API");
			}

			const transformedData: HistoricalDataResponse = {
				timestamp: response.data.data.t || [],
				open: response.data.data.o || [],
				high: response.data.data.h || [],
				low: response.data.data.l || [],
				close: response.data.data.c || [],
				volume: response.data.data.v || [],
			};

			return transformedData;
		} catch (error: any) {
			console.error("Error fetching intraday data:", error);
			throw new Error(`Failed to fetch intraday data: ${error.message}`);
		}
	}

	// Function for historical data (Daily/Weekly/Monthly)
	async getFreeHistoricalData(request: HistoricalDataRequest & {interval?: "D" | "W" | "M"}): Promise<HistoricalDataResponse> {
		const searchSymbol = searchBySecId(request.securityId);

		if (!searchSymbol) {
			throw new Error("Symbol not found");
		}

		try {
			const dhanRequest: DhanHistoricalDataRequest = {
				EXCH: "NSE",
				SYM: searchSymbol.symbol,
				SEG: "E",
				INST: "EQUITY",
				START: this.dateToTimestamp(request.fromDate),
				END: this.dateToTimestamp(request.toDate, true),
				INTERVAL: request.interval || "D", // Default to daily if not specified
			};

			const response = await axios.post<DhanApiResponse>(`${this.DHAN_API_URL}/getDataH`, dhanRequest, {
				headers: this.getApiHeaders(),
			});

			if (!response.data.success) {
				throw new Error(`Failed to fetch ${this.getIntervalName(request.interval)} data from Dhan API`);
			}

			// Transform the response
			const transformedData: HistoricalDataResponse = {
				timestamp: response.data.data.t || [],
				open: response.data.data.o || [],
				high: response.data.data.h || [],
				low: response.data.data.l || [],
				close: response.data.data.c || [],
				volume: response.data.data.v || [],
			};

			return transformedData;
		} catch (error: any) {
			console.error(`Error fetching ${this.getIntervalName(request.interval)} data:`, error);
			throw new Error(`Failed to fetch ${this.getIntervalName(request.interval)} data: ${error.message}`);
		}
	}

	// Utility function to convert date to timestamp
	private dateToTimestamp(date: string | Date, isEnd: boolean = false): number {
		// Create date object and convert to IST
		const dateObj = typeof date === "string" ? new Date(date) : date;
		const istDate = new Date(dateObj.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

		// Set market hours (IST)
		const marketOpen = new Date(istDate);
		marketOpen.setHours(9, 14, 0, 0);

		const marketClose = new Date(istDate);
		marketClose.setHours(15, 30, 0, 0);

		// Get current time in IST
		const currentTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

		// Check if the date is today
		const isToday = istDate.toDateString() === currentTime.toDateString();

		// For start timestamps, always return market open time (9:15)
		if (!isEnd) {
			return Math.floor(marketOpen.getTime() / 1000);
		}

		// For end timestamps on current date, use current time
		if (isToday) {
			return Math.floor(currentTime.getTime() / 1000);
		}

		// For all other end timestamps, return market close time (15:30)
		return Math.floor(marketClose.getTime() / 1000);
	}

	// Utility function to get API headers
	private getApiHeaders() {
		return {
			Accept: "*/*",
			"Content-Type": "application/json",
			Origin: "https://tv.dhan.co",
			Referer: "https://tv.dhan.co/",
			"Sec-Fetch-Site": "same-site",
			Src: "T",
		};
	}

	// Utility function to get interval name for error messages
	private getIntervalName(interval?: string): string {
		switch (interval) {
			case "W":
				return "weekly";
			case "M":
				return "monthly";
			default:
				return "daily";
		}
	}
}
