import { DhanFeed } from "../src/dhan-feed";
import { DhanConfig, DhanEnv, ExchangeSegment, Instrument } from "../src/types";

// Scanner App Example - Handling 2000+ Stocks
const config: DhanConfig = {
	clientId: "your-client-id",
	accessToken: "your-access-token",
	env: DhanEnv.PROD, // Use DhanEnv.SANDBOX for testing
};

interface ScannerResult {
	symbol: string;
	securityId: string;
	ltp: number;
	volume: number;
	change: number;
	changePercent: number;
	high: number;
	low: number;
	timestamp: number;
}

class StockScanner {
	private dhanFeed: DhanFeed;
	private scannerResults: Map<string, ScannerResult> = new Map();
	private previousPrices: Map<string, number> = new Map();
	
	// Scanner criteria
	private volumeThreshold = 100000; // Min volume
	private priceChangeThreshold = 2; // Min 2% change
	private highVolumeThreshold = 1000000; // High volume alert

	constructor(config: DhanConfig) {
		this.dhanFeed = new DhanFeed(config);
		this.setupEventListeners();
	}

	/**
	 * Start scanning with 2000+ stocks
	 */
	async startScanning(stocks: Instrument[]) {
		console.log(`🚀 Starting scanner for ${stocks.length} stocks...`);
		
		try {
			// Subscribe to all stocks at once - automatically batched
			await this.dhanFeed.multiConnectionLiveFeed.subscribe(stocks, 4); // Quote data
			
			console.log(`✅ Successfully subscribed to ${stocks.length} stocks!`);
			console.log("📊 Scanner is now running...");
			
			// Show connection status
			const status = this.dhanFeed.multiConnectionLiveFeed.getConnectionStatus();
			console.log("Connection Status:", status);
			
		} catch (error) {
			console.error("❌ Error starting scanner:", error);
		}
	}

	private setupEventListeners() {
		// Handle real-time market data
		this.dhanFeed.multiConnectionLiveFeed.on("message", ({ connectionId, data }) => {
			if (data.type === "quote") {
				this.processQuoteData(data);
			}
		});

		// Handle connection events
		this.dhanFeed.multiConnectionLiveFeed.on("connect", ({ connectionId }) => {
			console.log(`🔗 Scanner connection ${connectionId} established`);
		});

		this.dhanFeed.multiConnectionLiveFeed.on("error", ({ connectionId, error }) => {
			console.error(`❌ Scanner connection ${connectionId} error:`, error);
		});
	}

	private processQuoteData(data: any) {
		const symbol = `${data.exchangeSegment}_${data.securityId}`;
		const currentPrice = data.lastTradedPrice;
		const volume = data.volumeTraded;
		
		// Get previous price for change calculation
		const previousPrice = this.previousPrices.get(symbol) || currentPrice;
		const change = currentPrice - previousPrice;
		const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

		// Update scanner results
		const result: ScannerResult = {
			symbol,
			securityId: data.securityId.toString(),
			ltp: currentPrice,
			volume,
			change,
			changePercent,
			high: data.highPrice,
			low: data.lowPrice,
			timestamp: Date.now(),
		};

		this.scannerResults.set(symbol, result);
		this.previousPrices.set(symbol, currentPrice);

		// Apply scanner filters
		this.checkScannerCriteria(result);
	}

	private checkScannerCriteria(result: ScannerResult) {
		// Volume Scanner
		if (result.volume >= this.highVolumeThreshold) {
			console.log(`🔥 HIGH VOLUME ALERT: ${result.symbol} - Volume: ${result.volume.toLocaleString()}, LTP: ₹${result.ltp.toFixed(2)}`);
		}

		// Price Movement Scanner
		if (Math.abs(result.changePercent) >= this.priceChangeThreshold) {
			const direction = result.changePercent > 0 ? "📈 UP" : "📉 DOWN";
			console.log(`${direction} MOVE: ${result.symbol} - ${result.changePercent.toFixed(2)}% (₹${result.ltp.toFixed(2)})`);
		}

		// Breakout Scanner - Near day high/low
		const nearHigh = (result.ltp / result.high) > 0.98;
		const nearLow = (result.ltp / result.low) < 1.02;

		if (nearHigh && result.volume >= this.volumeThreshold) {
			console.log(`⚡ BREAKOUT HIGH: ${result.symbol} - LTP: ₹${result.ltp.toFixed(2)} (Day High: ₹${result.high.toFixed(2)})`);
		}

		if (nearLow && result.volume >= this.volumeThreshold) {
			console.log(`⚡ BREAKDOWN LOW: ${result.symbol} - LTP: ₹${result.ltp.toFixed(2)} (Day Low: ₹${result.low.toFixed(2)})`);
		}
	}

	/**
	 * Get top movers by volume
	 */
	getTopVolumeMovers(limit = 10): ScannerResult[] {
		return Array.from(this.scannerResults.values())
			.sort((a, b) => b.volume - a.volume)
			.slice(0, limit);
	}

	/**
	 * Get top gainers/losers
	 */
	getTopMovers(limit = 10): { gainers: ScannerResult[], losers: ScannerResult[] } {
		const results = Array.from(this.scannerResults.values());
		
		const gainers = results
			.filter(r => r.changePercent > 0)
			.sort((a, b) => b.changePercent - a.changePercent)
			.slice(0, limit);

		const losers = results
			.filter(r => r.changePercent < 0)
			.sort((a, b) => a.changePercent - b.changePercent)
			.slice(0, limit);

		return { gainers, losers };
	}

	/**
	 * Print scanner summary
	 */
	printScannerSummary() {
		console.log("\\n📊 === SCANNER SUMMARY ===");
		console.log(`Total Stocks Tracked: ${this.scannerResults.size}`);
		
		const topVolume = this.getTopVolumeMovers(5);
		console.log("\\n🔥 Top Volume Movers:");
		topVolume.forEach((stock, i) => {
			console.log(`${i + 1}. ${stock.symbol} - Vol: ${stock.volume.toLocaleString()}, LTP: ₹${stock.ltp.toFixed(2)}`);
		});

		const { gainers, losers } = this.getTopMovers(5);
		console.log("\\n📈 Top Gainers:");
		gainers.forEach((stock, i) => {
			console.log(`${i + 1}. ${stock.symbol} - ${stock.changePercent.toFixed(2)}% (₹${stock.ltp.toFixed(2)})`);
		});

		console.log("\\n📉 Top Losers:");
		losers.forEach((stock, i) => {
			console.log(`${i + 1}. ${stock.symbol} - ${stock.changePercent.toFixed(2)}% (₹${stock.ltp.toFixed(2)})`);
		});
	}

	/**
	 * Stop the scanner
	 */
	stop() {
		console.log("🛑 Stopping scanner...");
		this.dhanFeed.multiConnectionLiveFeed.close();
	}
}

// Example usage
async function main() {
	const scanner = new StockScanner(config);

	// Create sample 2000+ stocks (NSE top stocks)
	const generateStockList = (count: number): Instrument[] => {
		const stocks: Instrument[] = [];
		for (let i = 1; i <= count; i++) {
			stocks.push([ExchangeSegment.NSE_EQ, i.toString()]);
		}
		return stocks;
	};

	// Generate 2500 stocks for testing
	const stocksToTrack = generateStockList(2500);

	try {
		// Start scanning
		await scanner.startScanning(stocksToTrack);

		// Print summary every 30 seconds
		const summaryInterval = setInterval(() => {
			scanner.printScannerSummary();
		}, 30000);

		// Keep running
		console.log("\\n🔍 Scanner is running... Press Ctrl+C to stop");
		
		// Graceful shutdown
		process.on("SIGINT", () => {
			console.log("\\n🛑 Shutting down scanner...");
			clearInterval(summaryInterval);
			scanner.stop();
			process.exit(0);
		});

	} catch (error) {
		console.error("❌ Scanner error:", error);
	}
}

// Run the scanner
main().catch(console.error);
