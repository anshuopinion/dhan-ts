import { DhanFeed } from "../src/dhan-feed";
import { DhanConfig, DhanEnv, ExchangeSegment, Instrument } from "../src/types";

// Simple example showing how 2000+ stocks are handled
const config: DhanConfig = {
	clientId: "your-client-id",
	accessToken: "your-access-token",
	env: DhanEnv.SANDBOX,
};

async function demonstrate2000StocksHandling() {
	const dhanFeed = new DhanFeed(config);

	// Create 2500 sample stocks
	const stocks: Instrument[] = [];
	for (let i = 1; i <= 2500; i++) {
		stocks.push([ExchangeSegment.NSE_EQ, i.toString()]);
	}

	console.log("=== 2000+ STOCKS HANDLING DEMONSTRATION ===");
	console.log(`📊 Total stocks to subscribe: ${stocks.length}`);
	console.log(`📦 Will be split into: ${Math.ceil(stocks.length / 100)} batches of 100 stocks each`);
	console.log(`🔗 Will use: 1 connection (can handle up to 5000 stocks)`);
	console.log(`⏱️ Estimated subscription time: ~${Math.ceil(stocks.length / 100) * 0.1} seconds`);

	// Set up event listeners to track progress
	let batchesReceived = 0;
	let totalMessages = 0;
	const startTime = Date.now();

	dhanFeed.multiConnectionLiveFeed.on("connect", ({ connectionId }) => {
		console.log(`✅ Connection ${connectionId} established`);
	});

	dhanFeed.multiConnectionLiveFeed.on("message", ({ connectionId, data }) => {
		totalMessages++;
		
		// Log every 100 messages to show it's working
		if (totalMessages % 100 === 0) {
			console.log(`📈 Received ${totalMessages} real-time updates so far...`);
		}
	});

	try {
		console.log("\\n🚀 Starting subscription...");
		
		// This single call will handle all 2500 stocks automatically
		await dhanFeed.multiConnectionLiveFeed.subscribe(stocks, 15); // Ticker data
		
		const subscriptionTime = Date.now() - startTime;
		console.log(`\\n✅ SUCCESS! Subscribed to ${stocks.length} stocks in ${subscriptionTime}ms`);
		
		// Show connection status
		const status = dhanFeed.multiConnectionLiveFeed.getConnectionStatus();
		console.log("\\n📊 Connection Status:");
		status.forEach(conn => {
			console.log(`  Connection ${conn.connectionId}: ${conn.state} (${conn.instrumentCount} instruments)`);
		});

		console.log("\\n🔴 Now receiving REAL-TIME data from all 2500 stocks!");
		console.log("Press Ctrl+C to stop...");

		// Keep running to show real-time data
		process.on("SIGINT", () => {
			console.log(`\\n📊 Final Stats:`);
			console.log(`  - Total messages received: ${totalMessages}`);
			console.log(`  - Runtime: ${Math.floor((Date.now() - startTime) / 1000)} seconds`);
			console.log("\\n🛑 Shutting down...");
			dhanFeed.multiConnectionLiveFeed.close();
			process.exit(0);
		});

	} catch (error) {
		console.error("❌ Error:", error);
	}
}

// Run the demonstration
demonstrate2000StocksHandling().catch(console.error);
