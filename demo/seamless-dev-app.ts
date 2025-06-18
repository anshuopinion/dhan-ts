import {DhanFeed} from "../src/dhan-feed";
import {DhanConfig, DhanEnv, ExchangeSegment, Instrument} from "../src/types";
import dotenv from "dotenv";

dotenv.config();
// Scanner App Example - Handling 2000+ Stocks
const config: DhanConfig = {
	clientId: process.env.DHAN_CLIENT_ID!,
	accessToken: process.env.ACCESS_TOKEN!,
	env: DhanEnv.PROD, // Use DhanEnv.SANDBOX for testing
};

// Sample instruments (Top 10 NSE stocks)
const instruments: Instrument[] = [
	[ExchangeSegment.NSE_EQ, "1333"], // HDFC Bank
	[ExchangeSegment.NSE_EQ, "11536"], // TCS
	[ExchangeSegment.NSE_EQ, "3456"], // Reliance
	[ExchangeSegment.NSE_EQ, "25"], // Infosys
	[ExchangeSegment.NSE_EQ, "4963"], // ICICI Bank
	[ExchangeSegment.NSE_EQ, "1922"], // Asian Paints
	[ExchangeSegment.NSE_EQ, "14299"], // ITC
	[ExchangeSegment.NSE_EQ, "2475"], // Kotak Mahindra Bank
	[ExchangeSegment.NSE_EQ, "1594"], // L&T
	[ExchangeSegment.NSE_EQ, "1270"], // HUL
];

class MarketDataApp {
	private dhanFeed: DhanFeed;
	private isMarketOpen: boolean;

	constructor(config: DhanConfig) {
		this.dhanFeed = new DhanFeed(config);
		this.isMarketOpen = this.checkMarketHours();
	}

	/**
	 * Check if market is currently open (simplified)
	 */
	private checkMarketHours(): boolean {
		const now = new Date();
		const currentTime = now.getHours() * 60 + now.getMinutes();
		const marketOpen = 9 * 60 + 15; // 9:15 AM
		const marketClose = 15 * 60 + 30; // 3:30 PM

		// Check if it's a weekday and within market hours
		const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
		const isWithinHours = currentTime >= marketOpen && currentTime <= marketClose;

		return isWeekday && isWithinHours;
	}

	/**
	 * Start receiving market data with automatic real/mock switching
	 */
	async startMarketDataFeed(): Promise<void> {
		console.log("🚀 Starting Market Data Application");
		console.log(`📊 Market Status: ${this.isMarketOpen ? "OPEN" : "CLOSED"}`);
		console.log(`🔄 Using: ${this.isMarketOpen ? "REAL" : "MOCK"} feed`);
		console.log("=".repeat(50));

		// Choose the appropriate feed based on market status
		const feed = this.isMarketOpen ? this.dhanFeed.multiConnectionLiveFeed : this.dhanFeed.mockMultiConnectionLiveFeed;

		// Set up event listeners (same for both real and mock!)
		this.setupEventListeners(feed);

		try {
			// Subscribe to different types of data
			console.log("📈 Subscribing to Ticker data for first 5 stocks...");
			await feed.subscribe(instruments.slice(0, 5), 15); // Ticker data

			console.log("📊 Subscribing to Quote data for next 3 stocks...");
			await feed.subscribe(instruments.slice(5, 8), 4); // Quote data

			console.log("🎯 Subscribing to Full data for last 2 stocks...");
			await feed.subscribe(instruments.slice(8, 10), 8); // Full market data

			console.log("✅ Successfully subscribed to all instruments");
			console.log("💡 Market data is now streaming...");

			// If using mock, demonstrate some market events
			if (!this.isMarketOpen) {
				this.simulateMarketEvents();
			}
		} catch (error) {
			console.error("❌ Error starting market data feed:", error);
		}
	}

	/**
	 * Set up event listeners (identical for both real and mock feeds)
	 */
	private setupEventListeners(feed: any): void {
		// Connection events
		feed.on("connect", ({connectionId}: any) => {
			console.log(`🔗 Connection ${connectionId} established`);
		});

		feed.on("close", ({connectionId, code, reason}: any) => {
			console.log(`🔌 Connection ${connectionId} closed [${code}]: ${reason}`);
		});

		feed.on("error", ({connectionId, error}: any) => {
			console.error(`⚠️  Connection ${connectionId} error:`, error);
		});

		// Market data events
		feed.on("message", ({connectionId, data}: any) => {
			this.handleMarketData(connectionId, data);
		});

		feed.on("disconnection", ({connectionId, errorCode, reason}: any) => {
			console.warn(`🚨 Feed disconnection on connection ${connectionId} [${errorCode}]: ${reason}`);
		});
	}

	/**
	 * Handle incoming market data (same structure for real and mock)
	 */
	private handleMarketData(connectionId: number, data: any): void {
		// Handle different data types
		if ("type" in data) {
			switch (data.type) {
				case "ticker":
					console.log(`📈 [${connectionId}] TICKER: ${data.securityId} @ ₹${data.lastTradedPrice}`);
					break;

				case "quote":
					console.log(
						`📊 [${connectionId}] QUOTE: ${data.securityId} @ ₹${data.lastTradedPrice} | Vol: ${data.volumeTraded} | H:₹${data.highPrice} L:₹${data.lowPrice}`
					);
					break;

				case "full":
					console.log(
						`🎯 [${connectionId}] FULL: ${data.securityId} @ ₹${data.lastTradedPrice} | OI: ${data.openInterest} | Depth: ${data.marketDepth.buy.length}/${data.marketDepth.sell.length}`
					);
					break;

				case "market_status":
					console.log(`🏪 [${connectionId}] MARKET: ${data.status.toUpperCase()}`);
					break;

				case "error":
					console.error(`❌ [${connectionId}] ERROR: [${data.errorCode}] ${data.errorMessage}`);
					break;

				case "disconnection":
					console.warn(`🚨 [${connectionId}] DISCONNECTION: [${data.errorCode}] ${data.reason}`);
					break;

				default:
					console.log(`❓ [${connectionId}] UNKNOWN:`, data);
			}
		}
	}

	/**
	 * Simulate market events (only for mock feed)
	 */
	private simulateMarketEvents(): void {
		console.log("\\n🎭 Simulating market events (mock only):");

		// Simulate high volume event after 5 seconds
		setTimeout(() => {
			console.log("🌊 Simulating HIGH VOLUME event...");
			(this.dhanFeed.mockMultiConnectionLiveFeed as any).simulateMarketEvent("high_volume");
		}, 5000);

		// Simulate price spike after 10 seconds
		setTimeout(() => {
			console.log("🚀 Simulating PRICE SPIKE event...");
			(this.dhanFeed.mockMultiConnectionLiveFeed as any).simulateMarketEvent("price_spike");
		}, 10000);

		// Simulate crash after 15 seconds
		setTimeout(() => {
			console.log("📉 Simulating MARKET CRASH event...");
			(this.dhanFeed.mockMultiConnectionLiveFeed as any).simulateMarketEvent("crash");
		}, 15000);
	}

	/**
	 * Get connection status
	 */
	getConnectionStatus(): void {
		const feed = this.isMarketOpen ? this.dhanFeed.multiConnectionLiveFeed : this.dhanFeed.mockMultiConnectionLiveFeed;

		const status = feed.getConnectionStatus();
		console.log("\\n📊 Connection Status:", status);
	}

	/**
	 * Stop the market data feed
	 */
	stop(): void {
		console.log("\\n🛑 Stopping market data feed...");
		this.dhanFeed.multiConnectionLiveFeed.close();
		this.dhanFeed.mockMultiConnectionLiveFeed.close();
	}
}

// Example usage
async function main() {
	const app = new MarketDataApp(config);

	try {
		await app.startMarketDataFeed();

		// Show connection status after 3 seconds
		setTimeout(() => {
			app.getConnectionStatus();
		}, 3000);

		// Keep running for 20 seconds, then stop
		setTimeout(() => {
			app.stop();
			process.exit(0);
		}, 20000);
	} catch (error) {
		console.error("Application error:", error);
		process.exit(1);
	}
}

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.log("\\n👋 Shutting down gracefully...");
	process.exit(0);
});

// Run the application
main().catch(console.error);
