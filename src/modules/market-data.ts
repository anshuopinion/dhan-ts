import {AxiosInstance} from "axios";
import {MarketFeedRequest, HistoricalDataRequest, IntradayDataRequest, HistoricalDataResponse, TimeInterval, Candle, StockBasicDetailsRequest, StockBasicDetailsResponse, StockFundamentalRequest, StockFundamentalResponse} from "../types";
import {subDays, setHours, setMinutes, isWeekend, isBefore, parseISO, isAfter, getDay, addDays} from "date-fns";
import {toZonedTime, toDate, formatInTimeZone} from "date-fns-tz";
import {FreeMarketData} from "../free/FreeMarketData";

export class MarketData {
	private readonly kolkataTimeZone = "Asia/Kolkata";
	private freeMarketData: FreeMarketData;
	constructor(private readonly axiosInstance: AxiosInstance) {
		this.freeMarketData = new FreeMarketData();
	}

	async getLTP(request: MarketFeedRequest): Promise<any> {
		const response = await this.axiosInstance.post("/v2/marketfeed/ltp", request);
		return response.data;
	}

	async getOHLC(request: MarketFeedRequest): Promise<any> {
		const response = await this.axiosInstance.post("/v2/marketfeed/ohlc", request);
		return response.data;
	}

	async getQuote(request: MarketFeedRequest): Promise<any> {
		const response = await this.axiosInstance.post("/v2/marketfeed/quote", request);
		return response.data;
	}

	async getDailyHistoricalData(request: HistoricalDataRequest): Promise<HistoricalDataResponse> {
		const response = await this.axiosInstance.post<HistoricalDataResponse>("/v2/charts/historical", request);
		return response.data;
	}

	async getIntradayHistoricalData(request: IntradayDataRequest): Promise<HistoricalDataResponse> {
		const response = await this.axiosInstance.post<HistoricalDataResponse>("/v2/charts/intraday", request);
		return response.data;
	}

	async getProcessedCandleData(
		request: Omit<HistoricalDataRequest, "fromDate" | "toDate"> & {
			interval: TimeInterval;
			from?: string;
			to?: string;
			daysAgo?: number;
			symbol?: string;
		}
	): Promise<HistoricalDataResponse> {
		const {interval, from, to, daysAgo, symbol, ...baseRequest} = request;
		let fromDate: Date, toDate: Date;

		// Handle 'to' date first
		if (to) {
			// If 'to' date is provided, use it as the base
			toDate = this.getValidTradingDay(parseISO(to), "backward");
		} else {
			// Otherwise use the latest valid market date
			toDate = this.getLatestValidMarketDate();
		}

		// Handle 'from' date based on different scenarios
		if (from && to) {
			// Scenario 1: Both from and to dates provided
			fromDate = this.getValidTradingDay(parseISO(from), "forward");
		} else if (daysAgo !== undefined) {
			// Count back by trading days, skipping holidays and weekends
			fromDate = this.getPreviousNthTradingDay(toDate, daysAgo);
		} else {
			// Scenario 3: Default behavior based on interval
			if (this.isIntradayInterval(interval)) {
				// For intraday, fetch last 4 trading days + today
				fromDate = this.getLastNthTradingDay(toDate, 4);
			} else {
				// For historical, fetch from inception
				fromDate = new Date("1970-01-01");
			}
		}

		let data: HistoricalDataResponse;
		const intervalInfo = this.getIntervalInfo(interval);

		if (intervalInfo.baseInterval >= 1440) {
			// 1 day or more

			const requestData = {
				...baseRequest,
				toDate: formatInTimeZone(toDate, this.kolkataTimeZone, "yyyy-MM-dd"),
				fromDate: formatInTimeZone(fromDate, this.kolkataTimeZone, "yyyy-MM-dd"),
				...(symbol && {symbol}),
			};

			if (request.isFree) {
				data = await this.freeMarketData.getFreeHistoricalData(requestData);
			} else {
				data = await this.getDailyHistoricalData(requestData);
			}

			return this.combineDailyCandles(data, intervalInfo.multiplier, interval);
		} else {
			const requestData = {
				...baseRequest,
				toDate: formatInTimeZone(toDate, this.kolkataTimeZone, "yyyy-MM-dd"),
				fromDate: formatInTimeZone(fromDate, this.kolkataTimeZone, "yyyy-MM-dd"),
				interval: this.getClosestSupportedIntradayInterval(intervalInfo.baseInterval).toString(),
			};

			if (request.isFree) {
				data = await this.freeMarketData.getFreeIntradayHistoricalData(requestData);
			} else {
				data = await this.getIntradayHistoricalData(requestData);
			}

			return this.combineIntradayCandles(data, intervalInfo);
		}
	}
	private isIntradayInterval(interval: TimeInterval): boolean {
		return interval.endsWith("m");
	}

	private combineIntradayCandles(data: HistoricalDataResponse, intervalInfo: {baseInterval: number; multiplier: number}): HistoricalDataResponse {
		const result: HistoricalDataResponse = {
			open: [],
			high: [],
			low: [],
			close: [],
			volume: [],
			timestamp: [],
		};

		const {baseInterval, multiplier} = intervalInfo;

		// Hardcode market opening time to 9:15 using the date from first timestamp
		const date = new Date(data.timestamp[0] * 1000);
		date.setHours(9, 15, 0, 0);
		const marketOpenTime = Math.floor(date.getTime() / 1000);

		let currentGroup = {
			open: 0,
			high: -Infinity,
			low: Infinity,
			close: 0,
			volume: 0,
			timestamp: marketOpenTime, // Start with market open time
			count: 0,
		};

		for (let i = 0; i < data.timestamp.length; i++) {
			const currentTimestamp = data.timestamp[i];
			// Calculate bucket aligned to 9:15 AM
			const minutesSinceMarketOpen = Math.floor((currentTimestamp - marketOpenTime) / 60);
			const bucketIndex = Math.floor(minutesSinceMarketOpen / baseInterval);
			const bucketTimestamp = marketOpenTime + bucketIndex * baseInterval * 60;

			if (currentGroup.count === 0) {
				// First candle in the group
				currentGroup.open = data.open[i];
				currentGroup.high = data.high[i];
				currentGroup.low = data.low[i];
				currentGroup.close = data.close[i];
				currentGroup.volume = data.volume[i];
				currentGroup.count = 1;
			} else if (currentGroup.timestamp !== bucketTimestamp) {
				// Push completed group
				result.open.push(currentGroup.open);
				result.high.push(currentGroup.high);
				result.low.push(currentGroup.low);
				result.close.push(currentGroup.close);
				result.volume.push(currentGroup.volume);
				result.timestamp.push(currentGroup.timestamp);

				// Start new group
				currentGroup = {
					open: data.open[i],
					high: data.high[i],
					low: data.low[i],
					close: data.close[i],
					volume: data.volume[i],
					timestamp: bucketTimestamp,
					count: 1,
				};
			} else {
				// Update current group
				currentGroup.high = Math.max(currentGroup.high, data.high[i]);
				currentGroup.low = Math.min(currentGroup.low, data.low[i]);
				currentGroup.close = data.close[i];
				currentGroup.volume += data.volume[i];
				currentGroup.count++;
			}
		}

		// Push the last group
		if (currentGroup.count > 0) {
			result.open.push(currentGroup.open);
			result.high.push(currentGroup.high);
			result.low.push(currentGroup.low);
			result.close.push(currentGroup.close);
			result.volume.push(currentGroup.volume);
			result.timestamp.push(currentGroup.timestamp);
		}

		return result;
	}
	private combineDailyCandles(data: HistoricalDataResponse, multiplier: number, interval: TimeInterval): HistoricalDataResponse {
		const result: HistoricalDataResponse = {
			open: [],
			high: [],
			low: [],
			close: [],
			volume: [],
			timestamp: [],
		};
		let currentCandle: Candle | null = null;
		let candleStartDate: Date | null = null;

		for (let i = 0; i < data.timestamp.length; i++) {
			const timestamp = data.timestamp[i];
			const date = new Date(timestamp * 1000);

			if (!this.isValidTradingDay(date)) {
				continue; // Skip weekends and holidays
			}

			if (!currentCandle || !candleStartDate || this.shouldStartNewCandle(date, candleStartDate, interval)) {
				if (currentCandle) {
					result.open.push(currentCandle.open);
					result.high.push(currentCandle.high);
					result.low.push(currentCandle.low);
					result.close.push(currentCandle.close);
					result.volume.push(currentCandle.volume);
					result.timestamp.push(currentCandle.timestamp);
				}
				currentCandle = {
					open: data.open[i],
					high: data.high[i],
					low: data.low[i],
					close: data.close[i],
					volume: data.volume[i],
					timestamp: timestamp,
				};
				candleStartDate = date;
			} else {
				currentCandle.high = Math.max(currentCandle.high, data.high[i]);
				currentCandle.low = Math.min(currentCandle.low, data.low[i]);
				currentCandle.close = data.close[i];
				currentCandle.volume += data.volume[i];
			}
		}

		if (currentCandle) {
			result.open.push(currentCandle.open);
			result.high.push(currentCandle.high);
			result.low.push(currentCandle.low);
			result.close.push(currentCandle.close);
			result.volume.push(currentCandle.volume);
			result.timestamp.push(currentCandle.timestamp);
		}

		return result;
	}
	private getIntervalInfo(interval: TimeInterval): {
		baseInterval: number;
		multiplier: number;
	} {
		const value = parseInt(interval.slice(0, -1));
		const unit = interval.slice(-1);

		if (unit === "m") {
			const supportedIntervals = [1, 5, 15, 25, 60];

			// Find the largest supported multiplier that divides evenly into our base interval
			const multiplier = supportedIntervals.reduce((max, curr) => {
				if (value % curr === 0 && curr > max) {
					return curr;
				}
				return max;
			}, 1);

			return {
				baseInterval: value, // e.g., 10 for 10min
				multiplier: multiplier, // Should be 5 for base 10
			};
		}

		// For other intervals (d, w, M, y), keep the existing logic
		switch (unit) {
			case "d":
				return {baseInterval: 1440, multiplier: 1};
			case "w":
				return {baseInterval: 1440, multiplier: 7};
			case "y":
				return {baseInterval: 1440, multiplier: 365};
			default: // 'M' for month
				return {baseInterval: 1440, multiplier: 30};
		}
	}
	private shouldStartNewCandle(currentDate: Date, startDate: Date, interval: TimeInterval): boolean {
		switch (interval) {
			case TimeInterval.DAY_1:
				return (
					currentDate.getDate() !== startDate.getDate() ||
					currentDate.getMonth() !== startDate.getMonth() ||
					currentDate.getFullYear() !== startDate.getFullYear()
				);
			case TimeInterval.WEEK_1:
				return currentDate.getTime() - startDate.getTime() >= 7 * 24 * 60 * 60 * 1000;
			case TimeInterval.MONTH_1:
			case TimeInterval.MONTH_2:
			case TimeInterval.MONTH_3:
			case TimeInterval.MONTH_6:
				return currentDate.getMonth() !== startDate.getMonth() || currentDate.getFullYear() !== startDate.getFullYear();
			case TimeInterval.YEAR_1:
				return currentDate.getFullYear() !== startDate.getFullYear();
			default:
				return false;
		}
	}
	private getClosestSupportedIntradayInterval(interval: number): number {
		const supportedIntervals = [1, 5, 15, 60];
		const intervalMap: {[key: number]: number} = {
			1: 1,
			2: 1,
			3: 1,
			4: 1,
			5: 5,
			10: 5,
			15: 15,
			30: 15,
			45: 15,
			60: 60,
			120: 60,
			180: 60,
			240: 60,
		};

		if (interval in intervalMap) {
			return intervalMap[interval];
		}

		return supportedIntervals.reduce((prev, curr) => (Math.abs(curr - interval) < Math.abs(prev - interval) ? curr : prev));
	}
	private getLatestValidMarketDate(): Date {
		const now = new Date();
		const kolkataTime = toZonedTime(now, this.kolkataTimeZone);
		const marketOpenTime = setMinutes(setHours(kolkataTime, 9), 15);

		let validMarketDate = kolkataTime;

		// If the current date is in the future, move to the last Friday
		if (isAfter(validMarketDate, now)) {
			validMarketDate = this.getLastFriday(now);
		} else {
			// If it's before market open time, move to the previous day
			if (isBefore(kolkataTime, marketOpenTime)) {
				validMarketDate = subDays(validMarketDate, 1);
			}

			// Adjust for weekends
			while (isWeekend(validMarketDate)) {
				validMarketDate = subDays(validMarketDate, 1);
			}
		}

		// Convert back to UTC
		return toDate(validMarketDate, {timeZone: this.kolkataTimeZone});
	}
	private getLastFriday(date: Date): Date {
		let lastFriday = date;
		while (getDay(lastFriday) !== 5) {
			// 5 represents Friday
			lastFriday = subDays(lastFriday, 1);
		}
		return lastFriday;
	}

	private getValidTradingDay(date: Date, direction: "forward" | "backward"): Date {
		const maxIterations = 10; // Prevent infinite loops
		let currentDate = toZonedTime(date, this.kolkataTimeZone);
		let iterations = 0;

		while (!this.isValidTradingDay(currentDate) && iterations < maxIterations) {
			if (direction === "forward") {
				currentDate = addDays(currentDate, 1);
			} else {
				currentDate = subDays(currentDate, 1);
			}
			iterations++;
		}

		return toDate(currentDate, {timeZone: this.kolkataTimeZone});
	}

	private isHoliday(date: Date): boolean {
		const holidays: string[] = [
			"2025-02-26", // Mahashivratri
			"2025-03-14", // Holi
			"2025-03-31", // Id-Ul-Fitr (Ramadan Eid)
			"2025-04-10", // Shri Mahavir Jayanti
			"2025-04-14", // Dr. Baba Saheb Ambedkar Jayanti
			"2025-04-18", // Good Friday
			"2025-05-01", // Maharashtra Day
			"2025-08-15", // Independence Day
			"2025-08-27", // Ganesh Chaturthi
			"2025-10-02", // Mahatma Gandhi Jayanti/Dussehra
			"2025-10-21", // Diwali Laxmi Pujan
			"2025-10-22", // Balipratipada
			"2025-11-05", // Prakash Gurpurb Sri Guru Nanak Dev
			"2025-12-25", // Christmas
		];

		const dateStr = formatInTimeZone(date, this.kolkataTimeZone, "yyyy-MM-dd");
		return holidays.includes(dateStr);
	}
	private isValidTradingDay(date: Date): boolean {
		const kolkataDate = toZonedTime(date, this.kolkataTimeZone);

		// Check for weekends
		if (isWeekend(kolkataDate)) {
			return false;
		}

		// Check for holidays (implement your holiday calendar logic here)
		if (this.isHoliday(kolkataDate)) {
			return false;
		}

		return true;
	}
	private getPreviousNthTradingDay(fromDate: Date, n: number): Date {
		let currentDate = toZonedTime(fromDate, this.kolkataTimeZone);
		let tradingDaysFound = 0;

		while (tradingDaysFound < n) {
			// Move back one calendar day
			currentDate = subDays(currentDate, 1);
			// Only increment counter if it's a valid trading day
			if (this.isValidTradingDay(currentDate)) {
				tradingDaysFound++;
			}
		}

		return toDate(currentDate, {timeZone: this.kolkataTimeZone});
	}

	private getLastNthTradingDay(fromDate: Date, n: number): Date {
		let currentDate = toZonedTime(fromDate, this.kolkataTimeZone);
		let tradingDaysFound = 0;

		while (tradingDaysFound < n) {
			currentDate = subDays(currentDate, 1);
			if (this.isValidTradingDay(currentDate)) {
				tradingDaysFound++;
			}
		}

		return toDate(currentDate, {timeZone: this.kolkataTimeZone});
	}

	async getStockBasicDetails(request: StockBasicDetailsRequest): Promise<StockBasicDetailsResponse> {
		return this.freeMarketData.getStockBasicDetails(request);
	}

	async getStockFundamentals(request: StockFundamentalRequest): Promise<StockFundamentalResponse> {
		return this.freeMarketData.getStockFundamentals(request);
	}
}
