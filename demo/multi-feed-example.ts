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

async function main() {
	// Create multiple instances for different strategies/purposes
	const dhanFeed1 = new DhanFeed(config); // For Strategy 1
	const dhanFeed2 = new DhanFeed(config); // For Strategy 2
	const dhanFeed3 = new DhanFeed(config); // For Strategy 3
	const dhanFeed4 = new DhanFeed(config); // For Strategy 4

	// Create sample instruments (2000 stocks example)
	const createSampleInstruments = (start: number, count: number): Instrument[] => {
		const instruments: Instrument[] = [];
		for (let i = start; i < start + count; i++) {
			instruments.push([ExchangeSegment.NSE_EQ, i.toString()]);
		}
		return instruments;
	};

	try {
		// Strategy 1: Subscribe to 500 stocks for intraday trading
		const intradayStocks = createSampleInstruments(1, 500);
		console.log("Strategy 1: Subscribing to 500 intraday stocks...");

		await dhanFeed1.multiConnectionLiveFeed.subscribe(intradayStocks, 15); // Ticker data
		console.log("Strategy 1: Successfully subscribed!");

		// Strategy 2: Subscribe to 800 stocks for swing trading
		const swingStocks = createSampleInstruments(501, 800);
		console.log("Strategy 2: Subscribing to 800 swing trading stocks...");

		await dhanFeed2.multiConnectionLiveFeed.subscribe(swingStocks, 4); // Quote data
		console.log("Strategy 2: Successfully subscribed!");

		// Strategy 3: Subscribe to 400 stocks for momentum tracking
		const momentumStocks = createSampleInstruments(1301, 400);
		console.log("Strategy 3: Subscribing to 400 momentum stocks...");

		await dhanFeed3.multiConnectionLiveFeed.subscribe(momentumStocks, 8); // Full market data
		console.log("Strategy 3: Successfully subscribed!");

		// Strategy 4: Subscribe to 300 stocks for arbitrage
		const arbitrageStocks = createSampleInstruments(1701, 300);
		console.log("Strategy 4: Subscribing to 300 arbitrage stocks...");

		await dhanFeed4.multiConnectionLiveFeed.subscribe(arbitrageStocks, 15); // Ticker data
		console.log("Strategy 4: Successfully subscribed!");

		// Set up event listeners for each strategy
		setupEventListeners(dhanFeed1, "Strategy 1");
		setupEventListeners(dhanFeed2, "Strategy 2");
		setupEventListeners(dhanFeed3, "Strategy 3");
		setupEventListeners(dhanFeed4, "Strategy 4");

		// Show connection status for all strategies
		console.log("\\n=== Connection Status ===");
		console.log("Strategy 1 connections:", dhanFeed1.multiConnectionLiveFeed.getConnectionStatus());
		console.log("Strategy 2 connections:", dhanFeed2.multiConnectionLiveFeed.getConnectionStatus());
		console.log("Strategy 3 connections:", dhanFeed3.multiConnectionLiveFeed.getConnectionStatus());
		console.log("Strategy 4 connections:", dhanFeed4.multiConnectionLiveFeed.getConnectionStatus());

		// Keep the process running
		console.log("\\nAll strategies are now receiving live market data...");
		console.log("Press Ctrl+C to exit");

		// Graceful shutdown
		process.on("SIGINT", () => {
			console.log("\\nShutting down all connections...");
			dhanFeed1.multiConnectionLiveFeed.close();
			dhanFeed2.multiConnectionLiveFeed.close();
			dhanFeed3.multiConnectionLiveFeed.close();
			dhanFeed4.multiConnectionLiveFeed.close();
			process.exit(0);
		});
	} catch (error) {
		console.error("Error in main:", error);
	}
}

function setupEventListeners(dhanFeed: DhanFeed, strategyName: string) {
	// Listen for market data
	dhanFeed.multiConnectionLiveFeed.on("message", ({connectionId, data}) => {
		console.log(`${strategyName} [Conn ${connectionId}]:`, data.type, data);
	});

	// Listen for connection events
	dhanFeed.multiConnectionLiveFeed.on("connect", ({connectionId}) => {
		console.log(`${strategyName}: Connection ${connectionId} established`);
	});

	dhanFeed.multiConnectionLiveFeed.on("close", ({connectionId, code, reason}) => {
		console.log(`${strategyName}: Connection ${connectionId} closed [${code}]: ${reason}`);
	});

	dhanFeed.multiConnectionLiveFeed.on("error", ({connectionId, error}) => {
		console.error(`${strategyName}: Connection ${connectionId} error:`, error);
	});

	dhanFeed.multiConnectionLiveFeed.on("maxReconnectAttemptsReached", ({connectionId}) => {
		console.error(`${strategyName}: Connection ${connectionId} failed to reconnect after max attempts`);
	});
}

// Run the example
main().catch(console.error);
