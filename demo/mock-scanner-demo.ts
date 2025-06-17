import { DhanFeed } from "../src/dhan-feed";
import { DhanConfig, DhanEnv, ExchangeSegment, Instrument } from "../src/types";

// Mock Scanner App Example - Perfect for testing when market is closed
const config: DhanConfig = {
	clientId: "test-client-id",
	accessToken: "test-access-token",
	env: DhanEnv.SANDBOX,
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

class MockStockScanner {
	private dhanFeed: DhanFeed;
	private scannerResults: Map<string, ScannerResult> = new Map();
	private previousPrices: Map<string, number> = new Map();
	
	// Scanner criteria
	private volumeThreshold = 50000;
	private priceChangeThreshold = 1.5; // 1.5% change
	private highVolumeThreshold = 200000;

	constructor(config: DhanConfig) {
		this.dhanFeed = new DhanFeed(config);
		this.setupEventListeners();
	}

	/**
	 * Start mock scanning with 2000+ stocks
	 */
	async startMockScanning(stocks: Instrument[]) {
		console.log(`🎭 Starting MOCK scanner for ${stocks.length} stocks...`);
		console.log("📊 Generating realistic market data for testing");
		
		try {
			// Use mock multi-connection live feed
			await this.dhanFeed.mockMultiConnectionLiveFeed.subscribe(stocks, 4); // Quote data
			
			console.log(`✅ Successfully subscribed to ${stocks.length} mock stocks!`);
			console.log("🎭 Mock scanner is now running with realistic data...");
			
			// Show connection status
			const status = this.dhanFeed.mockMultiConnectionLiveFeed.getConnectionStatus();
			console.log("Mock Connection Status:", status);
			
			// Simulate some market events for testing
			setTimeout(() => {
				console.log("🚀 Simulating high volume event...");
				this.dhanFeed.mockMultiConnectionLiveFeed.simulateMarketEvent("high_volume");
			}, 5000);

			setTimeout(() => {
				console.log("📈 Simulating price spike event...");
				this.dhanFeed.mockMultiConnectionLiveFeed.simulateMarketEvent("price_spike");
			}, 10000);

			setTimeout(() => {
				console.log("📉 Simulating market crash event...");
				this.dhanFeed.mockMultiConnectionLiveFeed.simulateMarketEvent("crash");
			}, 15000);
			
		} catch (error) {
			console.error("❌ Error starting mock scanner:", error);
		}
	}

	private setupEventListeners() {
		// Handle real-time mock market data
		this.dhanFeed.mockMultiConnectionLiveFeed.on("message", ({ connectionId, data }) => {
			if (data.type === "quote") {
				this.processQuoteData(data);
			}
		});

		// Handle connection events
		this.dhanFeed.mockMultiConnectionLiveFeed.on("connect", ({ connectionId }) => {
			console.log(`🔗 Mock scanner connection ${connectionId} established`);
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
			console.log(`🔥 MOCK HIGH VOLUME: ${result.symbol} - Volume: ${result.volume.toLocaleString()}, LTP: ₹${result.ltp.toFixed(2)}`);
		}

		// Price Movement Scanner
		if (Math.abs(result.changePercent) >= this.priceChangeThreshold) {
			const direction = result.changePercent > 0 ? "📈 UP" : "📉 DOWN";
			console.log(`${direction} MOCK MOVE: ${result.symbol} - ${result.changePercent.toFixed(2)}% (₹${result.ltp.toFixed(2)})`);
		}

		// Breakout Scanner
		const nearHigh = (result.ltp / result.high) > 0.98;
		const nearLow = (result.ltp / result.low) < 1.02;

		if (nearHigh && result.volume >= this.volumeThreshold) {
			console.log(`⚡ MOCK BREAKOUT HIGH: ${result.symbol} - LTP: ₹${result.ltp.toFixed(2)} (Day High: ₹${result.high.toFixed(2)})`);
		}

		if (nearLow && result.volume >= this.volumeThreshold) {
			console.log(`⚡ MOCK BREAKDOWN LOW: ${result.symbol} - LTP: ₹${result.ltp.toFixed(2)} (Day Low: ₹${result.low.toFixed(2)})`);
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
	 * Print mock scanner summary
	 */
	printMockScannerSummary() {
		console.log("\\n🎭 === MOCK SCANNER SUMMARY ===");
		console.log(`Total Mock Stocks Tracked: ${this.scannerResults.size}`);
		
		const topVolume = this.getTopVolumeMovers(5);
		console.log("\\n🔥 Top Mock Volume Movers:");
		topVolume.forEach((stock, i) => {
			console.log(`${i + 1}. ${stock.symbol} - Vol: ${stock.volume.toLocaleString()}, LTP: ₹${stock.ltp.toFixed(2)}`);
		});

		const { gainers, losers } = this.getTopMovers(5);
		console.log("\\n📈 Top Mock Gainers:");
		gainers.forEach((stock, i) => {
			console.log(`${i + 1}. ${stock.symbol} - ${stock.changePercent.toFixed(2)}% (₹${stock.ltp.toFixed(2)})`);
		});

		console.log("\\n📉 Top Mock Losers:");
		losers.forEach((stock, i) => {
			console.log(`${i + 1}. ${stock.symbol} - ${stock.changePercent.toFixed(2)}% (₹${stock.ltp.toFixed(2)})`);
		});
	}

	/**
	 * Stop mock scanner
	 */
	stop() {
		console.log("🛑 Stopping mock scanner...");
		this.dhanFeed.mockMultiConnectionLiveFeed.close();
	}
}

// Example usage
async function main() {
	const mockScanner = new MockStockScanner(config);

	// Create 2000+ test stocks
	const generateMockStockList = (count: number): Instrument[] => {
		const stocks: Instrument[] = [];
		for (let i = 1; i <= count; i++) {
			stocks.push([ExchangeSegment.NSE_EQ, i.toString()]);
		}
		return stocks;
	};

	// Generate 2000 mock stocks for testing
	const mockStocksToTrack = generateMockStockList(2000);

	try {
		console.log("🎭 ===============================");
		console.log("🎭 MOCK SCANNER FOR OFFLINE TESTING");
		console.log("🎭 ===============================");
		console.log("📊 Market is closed? No problem!");
		console.log("🎯 Testing your scanner with realistic mock data");
		console.log("");
		
		// Start mock scanning
		await mockScanner.startMockScanning(mockStocksToTrack);

		// Print summary every 15 seconds
		const summaryInterval = setInterval(() => {
			mockScanner.printMockScannerSummary();
		}, 15000);

		// Keep running
		console.log("\\n🔍 Mock scanner is running... Press Ctrl+C to stop");
		console.log("🎭 Watch for realistic market events and scanner alerts!");
		
		// Graceful shutdown
		process.on("SIGINT", () => {
			console.log("\\n🛑 Shutting down mock scanner...");
			clearInterval(summaryInterval);
			mockScanner.stop();
			console.log("🎭 Mock scanner stopped. Ready for real market!");
			process.exit(0);
		});

	} catch (error) {
		console.error("❌ Mock scanner error:", error);
	}
}

// Run the mock scanner
main().catch(console.error);
