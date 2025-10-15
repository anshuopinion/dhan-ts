import {DhanFeed} from "dhan-ts";
import {DhanConfig, DhanEnv, ExchangeSegment, FeedRequestCode, Instrument, LiveFeedResponse} from "dhan-ts";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();
// hello 
// Configuration
const config: DhanConfig = {
	accessToken: process.env.ACCESS_TOKEN || "dummy_token_for_mock",
	clientId: process.env.DHAN_CLIENT_ID || "dummy_client_id",
	env: DhanEnv.PROD,
};

// Interface for scanner instrument data
interface ScannerInstrument {
	_id: {
		$oid: string;
	};
	secId: string;
	symbol: string;
	custom: string;
	nameOfCompany: string;
	__v: number;
	createdAt: {
		$date: string;
	};
	updatedAt: {
		$date: string;
	};
}

class MultiConnectionDemo {
	private dhanFeed: DhanFeed;
	private instruments: Instrument[] = [];
	private useMockFeed: boolean;
	private maxInstruments: number;
	private statsInterval: NodeJS.Timeout | null = null;
	private messageStats = {
		ticker: 0,
		quote: 0,
		full: 0,
		errors: 0,
		total: 0,
		startTime: Date.now(),
	};

	private tickerHistory: Map<
		string,
		{
			symbol: string;
			lastPrice: number;
			lastTime: number;
			priceChange: number;
			updateCount: number;
		}
	> = new Map();

	constructor(useMockFeed: boolean = false, maxInstruments: number = 500) {
		this.dhanFeed = new DhanFeed(config);
		this.useMockFeed = false;
		this.maxInstruments = maxInstruments;
	}

	/**
	 * Load instruments from scanner.instruments.json
	 */
	private loadInstrumentsFromFile(): ScannerInstrument[] {
		try {
			const filePath = path.join(__dirname, "scanner.instruments.json");
			const fileContent = fs.readFileSync(filePath, "utf8");
			const scannerData: ScannerInstrument[] = JSON.parse(fileContent);

			console.log(`📁 Loaded ${scannerData.length} instruments from scanner.instruments.json`);
			return scannerData;
		} catch (error) {
			console.error("❌ Error loading scanner instruments:", error);
			return [];
		}
	}

	/**
	 * Convert scanner instruments to Dhan Instrument format
	 */
	private convertToInstruments(scannerData: ScannerInstrument[]): Instrument[] {
		const instruments: Instrument[] = [];

		// Take only the first maxInstruments to avoid overwhelming the system
		const limitedData = scannerData.slice(0, this.maxInstruments);

		for (const item of limitedData) {
			try {
				// Convert secId to string and create instrument tuple
				// Using NSE_EQ (1) as the default exchange segment for equity instruments
				const instrument: Instrument = [ExchangeSegment.NSE_EQ, item.secId];
				instruments.push(instrument);
			} catch (error) {
				console.warn(`⚠️  Failed to convert instrument ${item.symbol} (secId: ${item.secId}):`, error);
			}
		}

		console.log(`🔄 Converted ${instruments.length} instruments for live feed`);
		return instruments;
	}

	/**
	 * Setup event listeners for the live feed
	 */
	private setupEventListeners() {
		const feed = this.useMockFeed ? this.dhanFeed.mockMultiConnectionLiveFeed : this.dhanFeed.multiConnectionLiveFeed;

		// Connection events
		feed.on("connect", data => {
			console.log(`🔗 Connection established:`, data);
		});

		feed.on("disconnect", data => {
			console.log(`🔌 Connection disconnected:`, data);
		});

		feed.on("error", data => {
			console.error(`❌ Connection error:`, data);
			this.messageStats.errors++;
		});

		// Market data events
		feed.on("message", data => {
			this.handleMarketData(data.connectionId, data.data);
		});

		// Disconnection events
		feed.on("disconnection", data => {
			console.warn(`⚠️  Feed disconnection:`, data);
		});
	}

	/**
	 * Handle incoming market data
	 */
	private handleMarketData(connectionId: number, data: LiveFeedResponse) {
		this.messageStats.total++;

		// Track ticker prices for continuous updates
		this.trackTickerPrice(data);

		// Type guards to handle different response types
		if ("type" in data && data.type === "ticker") {
			this.messageStats.ticker++;
			// Show ticker updates more frequently - every 10 messages instead of 100
			if (this.messageStats.ticker % 10 === 0) {
				const timestamp = new Date().toLocaleTimeString();
				console.log(
					`📈 [${timestamp}] Ticker #${this.messageStats.ticker}: ${data.exchangeSegment}:${data.securityId} @ ₹${data.lastTradedPrice} (Time: ${data.lastTradedTime})`
				);
			}
		} else if ("type" in data && data.type === "quote") {
			this.messageStats.quote++;
			// Show quote updates more frequently - every 25 messages instead of 50
			if (this.messageStats.quote % 25 === 0) {
				const timestamp = new Date().toLocaleTimeString();
				console.log(
					`📊 [${timestamp}] Quote #${this.messageStats.quote}: ${data.exchangeSegment}:${data.securityId} | Price: ₹${data.lastTradedPrice} | Volume: ${data.volumeTraded}`
				);
			}
		} else if ("type" in data && data.type === "full") {
			this.messageStats.full++;
			// Show full market data more frequently - every 10 messages instead of 25
			if (this.messageStats.full % 10 === 0) {
				const timestamp = new Date().toLocaleTimeString();
				console.log(
					`📋 [${timestamp}] Full #${this.messageStats.full}: ${data.exchangeSegment}:${data.securityId} | OHLC: ${data.openPrice}/${data.highPrice}/${data.lowPrice}/${data.closePrice}`
				);
			}
		} else if ("type" in data && data.type === "error") {
			this.messageStats.errors++;
			console.error(`❌ Feed Error [${data.errorCode}]: ${data.errorMessage}`);
		} else if ("type" in data && data.type === "disconnection") {
			console.warn(`⚠️  Feed Disconnection [${data.errorCode}]: ${data.reason}`);
		} else if ("type" in data && data.type === "market_status") {
			console.log(`📊 Market Status: ${data.status}`);
		} else if ("type" in data && data.type === "oi_data") {
			console.log(`📊 OI Data: ${data.exchangeSegment}:${data.securityId} | OI: ${data.openInterest}`);
		} else if ("type" in data && data.type === "prev_close") {
			console.log(`📊 Prev Close: ${data.exchangeSegment}:${data.securityId} | Close: ₹${data.previousClosePrice}`);
		} else {
			// Handle cases where 'type' might not exist (MarketDepthResponse)
			console.log(`📨 Other message:`, JSON.stringify(data).substring(0, 100) + "...");
		}
	}

	/**
	 * Track ticker price changes and show continuous updates
	 */
	private trackTickerPrice(data: LiveFeedResponse) {
		if ("type" in data && data.type === "ticker") {
			const instrumentKey = `${data.exchangeSegment}:${data.securityId}`;
			const currentPrice = data.lastTradedPrice;
			const currentTime = data.lastTradedTime;

			if (this.tickerHistory.has(instrumentKey)) {
				const prev = this.tickerHistory.get(instrumentKey)!;
				const priceChange = currentPrice - prev.lastPrice;
				const changePercent = ((priceChange / prev.lastPrice) * 100).toFixed(2);

				// Update the record
				this.tickerHistory.set(instrumentKey, {
					symbol: instrumentKey,
					lastPrice: currentPrice,
					lastTime: currentTime,
					priceChange: priceChange,
					updateCount: prev.updateCount + 1,
				});

				// Show price movement if there's a significant change or every 5 updates
				if (Math.abs(priceChange) > 0.01 || prev.updateCount % 5 === 0) {
					const changeIcon = priceChange > 0 ? "🔼" : priceChange < 0 ? "🔽" : "➡️";
					const timestamp = new Date().toLocaleTimeString();
					console.log(`${changeIcon} [${timestamp}] ${instrumentKey} ₹${currentPrice} (${priceChange >= 0 ? "+" : ""}${changePercent}%)`);
				}
			} else {
				// First time seeing this instrument
				this.tickerHistory.set(instrumentKey, {
					symbol: instrumentKey,
					lastPrice: currentPrice,
					lastTime: currentTime,
					priceChange: 0,
					updateCount: 1,
				});
				const timestamp = new Date().toLocaleTimeString();
				console.log(`🆕 [${timestamp}] ${instrumentKey} ₹${currentPrice} (NEW)`);
			}
		}
	}

	/**
	 * Start statistics reporting
	 */
	private startStatsReporting() {
		this.statsInterval = setInterval(() => {
			const elapsed = (Date.now() - this.messageStats.startTime) / 1000;
			const rate = this.messageStats.total / elapsed;

			console.log(`\n📊 === LIVE FEED STATISTICS ===`);
			console.log(`🕐 Runtime: ${elapsed.toFixed(1)}s`);
			console.log(`📈 Ticker Messages: ${this.messageStats.ticker}`);
			console.log(`📊 Quote Messages: ${this.messageStats.quote}`);
			console.log(`📋 Full Messages: ${this.messageStats.full}`);
			console.log(`❌ Error Messages: ${this.messageStats.errors}`);
			console.log(`📦 Total Messages: ${this.messageStats.total}`);
			console.log(`⚡ Message Rate: ${rate.toFixed(2)} msg/sec`);
			console.log(`🔗 Connections: ${this.getConnectionInfo()}`);
			console.log(`=============================\n`);
		}, 10000); // Every 10 seconds
	}

	/**
	 * Get connection information
	 */
	private getConnectionInfo(): string {
		const feed = this.useMockFeed ? this.dhanFeed.mockMultiConnectionLiveFeed : this.dhanFeed.multiConnectionLiveFeed;

		const connections = feed.getConnectionStatus();
		return connections.map(conn => `${conn.connectionId}(${conn.state}:${conn.instrumentCount})`).join(", ");
	}

	/**
	 * Test different subscription types
	 */
	private async testSubscriptionTypes() {
		const feed = this.useMockFeed ? this.dhanFeed.mockMultiConnectionLiveFeed : this.dhanFeed.multiConnectionLiveFeed;

		// Split instruments into batches for different subscription types
		const batchSize = Math.ceil(this.instruments.length / 3);
		const tickerBatch = this.instruments.slice(0, batchSize);
		const quoteBatch = this.instruments.slice(batchSize, batchSize * 2);
		const fullBatch = this.instruments.slice(batchSize * 2);

		console.log(`\n🎯 Testing different subscription types:`);
		console.log(`📈 Ticker batch: ${tickerBatch.length} instruments`);
		console.log(`📊 Quote batch: ${quoteBatch.length} instruments`);
		console.log(`📋 Full batch: ${fullBatch.length} instruments\n`);

		try {
			// Subscribe to ticker data
			if (tickerBatch.length > 0) {
				console.log(`🔔 Subscribing to TICKER data for ${tickerBatch.length} instruments...`);
				await feed.subscribe(tickerBatch, FeedRequestCode.SUBSCRIBE_TICKER);
				await this.delay(2000);
			}

			// Subscribe to quote data
			if (quoteBatch.length > 0) {
				console.log(`🔔 Subscribing to QUOTE data for ${quoteBatch.length} instruments...`);
				await feed.subscribe(quoteBatch, FeedRequestCode.SUBSCRIBE_QUOTE);
				await this.delay(2000);
			}

			// Subscribe to full market data
			if (fullBatch.length > 0) {
				console.log(`🔔 Subscribing to FULL data for ${fullBatch.length} instruments...`);
				await feed.subscribe(fullBatch, FeedRequestCode.SUBSCRIBE_FULL);
				await this.delay(2000);
			}

			console.log(`✅ All subscriptions completed successfully!`);
		} catch (error) {
			console.error(`❌ Error during subscription:`, error);
			throw error;
		}
	}

	/**
	 * Utility method to add delay
	 */
	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Simulate market events (only for mock feed)
	 */
	private simulateMarketEvents() {
		if (!this.useMockFeed) return;

		const mockFeed = this.dhanFeed.mockMultiConnectionLiveFeed;
		const events = ["high_volume", "price_spike", "crash"] as const;

		// Simulate random market events every 30 seconds
		setInterval(() => {
			const randomEvent = events[Math.floor(Math.random() * events.length)];
			console.log(`🎭 Simulating ${randomEvent} event...`);
			mockFeed.simulateMarketEvent(randomEvent);
		}, 30000);
	}

	/**
	 * Main demo execution
	 */
	async run() {
		console.log(`\n🚀 Starting Multi-Connection Live Feed Demo`);
		console.log(`📊 Mode: ${this.useMockFeed ? "MOCK" : "LIVE"} Feed`);
		console.log(`🎯 Max Instruments: ${this.maxInstruments}`);
		console.log(`⚙️  Config: ${config.env} environment\n`);

		try {
			// Load instruments from file
			const scannerData = this.loadInstrumentsFromFile();
			if (scannerData.length === 0) {
				throw new Error("No instruments loaded from scanner file");
			}

			// Convert to Dhan instrument format
			this.instruments = this.convertToInstruments(scannerData);
			if (this.instruments.length === 0) {
				throw new Error("No valid instruments converted");
			}

			// Setup event listeners
			this.setupEventListeners();

			// Start statistics reporting
			this.startStatsReporting();

			// Test subscriptions
			await this.testSubscriptionTypes();

			// Start market event simulation for mock feed
			if (this.useMockFeed) {
				this.simulateMarketEvents();
			}

			console.log(`\n🎉 Demo is now running! Press Ctrl+C to stop.\n`);

			// Keep the demo running
			process.on("SIGINT", () => {
				console.log(`\n🛑 Shutting down demo...`);
				this.cleanup();
				process.exit(0);
			});
		} catch (error) {
			console.error(`❌ Demo failed to start:`, error);
			this.cleanup();
			process.exit(1);
		}
	}

	/**
	 * Cleanup resources
	 */
	private cleanup() {
		console.log(`🧹 Cleaning up resources...`);

		if (this.statsInterval) {
			clearInterval(this.statsInterval);
		}

		const feed = this.useMockFeed ? this.dhanFeed.mockMultiConnectionLiveFeed : this.dhanFeed.multiConnectionLiveFeed;

		feed.close();
		console.log(`✅ Cleanup completed`);
	}
}

// Usage examples
async function runDemo() {
	const args = process.argv.slice(2);
	const useMock = !args.includes("--live");
	const maxInstruments = parseInt(args.find(arg => arg.startsWith("--max="))?.split("=")[1] || "500");

	console.log(`\n🎯 Demo Configuration:`);
	console.log(`   Mode: ${useMock ? "Mock" : "Live"} Feed`);
	console.log(`   Max Instruments: ${maxInstruments}`);
	console.log(`   Usage: npm run demo:multiple [--live] [--max=1000]`);

	const demo = new MultiConnectionDemo(useMock, maxInstruments);
	await demo.run();
}

// Run the demo
if (require.main === module) {
	runDemo().catch(console.error);
}

export {MultiConnectionDemo};
