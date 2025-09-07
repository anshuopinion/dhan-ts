import {DhanFeed} from "../src";
import {
	ExchangeSegment,
	FeedRequestCode,
	Instrument,
} from "../src/types";

export async function demoLiveFeed(dhanFeed: DhanFeed) {
	console.log("\nDemonstrating Live Feed:");

	try {
		await dhanFeed.liveFeed.connect();
		console.log("WebSocket connection established");

		const instruments: Instrument[] = [
			[ExchangeSegment.NSE_EQ, "14043"],
			// [ExchangeSegment.NSE_EQ, "11536"],
			// [ExchangeSegment.NSE_EQ, "9931"],
		];

		dhanFeed.liveFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_QUOTE);
		console.log("Subscribed to live feed");

		dhanFeed.liveFeed.on("data", data => {
			console.log("Received live feed data:", data);
			// marekt depth
			// console.table(data?.type);
			// if ("marketDepth" in data) {
			//   console.table(data?.marketDepth.buy);
			//   console.table(data?.marketDepth.sell);
			// }
		});

		dhanFeed.liveFeed.on("error", error => {
			console.error("LiveFeed error:", error);
		});

		// The connection will now stay alive as long as the server responds
		// No need for artificial timeouts

		// If you want to close the connection:
		// await new Promise((resolve) => setTimeout(resolve, yourTimeout));
		// liveFeed.close();
	} catch (error) {
		console.error("Error in live feed demo:", error);
	}
}

export async function demoLiveFeedMock(dhanFeed: DhanFeed) {
	console.log("\nDemonstrating Mock Live Feed:");

	try {
		// Configure price ranges for all securities we'll subscribe to
		dhanFeed.mockLiveFeed.setSecurityConfigs({
			"7508": {
				// Reliance
				minPrice: 2300,
				maxPrice: 2450,
				volatility: 0.3,
			},
			"993": {
				// State Bank of India
				minPrice: 560,
				maxPrice: 620,
				volatility: 0.4,
			},
			"9931": {
				// Example security
				minPrice: 800,
				maxPrice: 900,
				volatility: 0.3,
			},
		});

		// Connect to mock feed
		await dhanFeed.mockLiveFeed.connect();
		console.log("WebSocket connection established for mock live feed");

		// Optional: Set custom market hours if needed
		dhanFeed.mockLiveFeed.setMarketHours({
			start: "00:00", // For testing: Allow all hours
			end: "23:59",
			days: [0, 1, 2, 3, 4, 5, 6], // Allow all days for testing
		});

		const instruments: Instrument[] = [
			[ExchangeSegment.NSE_EQ, "7508"],
			[ExchangeSegment.NSE_EQ, "993"],
			[ExchangeSegment.NSE_EQ, "9931"],
		];

		dhanFeed.mockLiveFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_TICKER);
		console.log("Subscribed to mock live feed");

		// Add timestamp to log output
		dhanFeed.mockLiveFeed.on("data", data => {
			const timestamp = new Date().toLocaleTimeString();
			console.log(`[${timestamp}] Received mock live feed data:`, data);
		});

		dhanFeed.mockLiveFeed.on("error", error => {
			console.error("Mock live feed error:", error);
		});

		// Add a graceful shutdown handler
		process.on("SIGINT", () => {
			console.log("\nGracefully shutting down mock feed...");
			dhanFeed.mockLiveFeed.close();
			process.exit(0);
		});
	} catch (error) {
		console.error("Error in mock live feed demo:", error);
	}
}

export async function demoLiveOrderUpdate(dhanFeed: DhanFeed) {
	console.log("\nDemonstrating Live Order Update:");

	// // Keep track of the connection state
	// let isConnected = false;

	// // Handle process termination gracefully
	// process.on("SIGINT", async () => {
	//   console.log("\nGracefully shutting down...");
	//   if (isConnected) {
	//     dhanFeed.liveOrderUpdate.disconnect();
	//   }
	//   process.exit(0);
	// });

	// try {
	//   // Set up event handlers before connecting
	//   dhanFeed.liveOrderUpdate.on("orderUpdate", (update) => {
	//     console.log("Received order update:", update);
	//   });

	//   dhanFeed.liveOrderUpdate.on("authenticated", () => {
	//     console.log("Successfully authenticated with the order update service");
	//     isConnected = true;
	//   });

	//   dhanFeed.liveOrderUpdate.on("authError", (error) => {
	//     console.error("Authentication failed:", error.message);
	//   });

	//   dhanFeed.liveOrderUpdate.on("disconnected", ({ code, reason }) => {
	//     console.log(`Disconnected: ${code} - ${reason}`);
	//     isConnected = false;
	//   });

	//   dhanFeed.liveOrderUpdate.on("error", (error) => {
	//     console.error("Live order update error:", error);
	//   });

	//   // Connect to the WebSocket
	//   await dhanFeed.liveOrderUpdate.connect();
	//   console.log("WebSocket connection established for live order updates");
	//   console.log("Listening for order updates...");

	//   // Keep the process alive without using setTimeout
	//   // This prevents the Node.js event loop from exiting
	//   const keepAlive = new Promise((resolve) => {
	//     const interval = setInterval(() => {
	//       if (!isConnected) {
	//         clearInterval(interval);
	//         resolve(null);
	//       }
	//     }, 1000);
	//   });

	//   await keepAlive;
	// } catch (error) {
	//   console.error("Error in live order update demo:", error);
	// }
}

export async function demoMultiConnectionLiveFeed(dhanFeed: DhanFeed) {
	console.log("\nDemonstrating Multi-Connection Live Feed:");

	try {
		// Define multiple sets of instruments to test connection management
		const instrumentSet1: Instrument[] = [
			[ExchangeSegment.NSE_EQ, "14043"], // Reliance
			[ExchangeSegment.NSE_EQ, "11536"], // HDFC Bank
			[ExchangeSegment.NSE_EQ, "9931"], // ICICI Bank
		];

		// const instrumentSet2: Instrument[] = [
		// 	[ExchangeSegment.NSE_EQ, "7508"], // SBI
		// 	[ExchangeSegment.NSE_EQ, "993"], // ITC
		// 	[ExchangeSegment.NSE_EQ, "1333"], // TCS
		// ];

		// const instrumentSet3: Instrument[] = [
		// 	[ExchangeSegment.NSE_EQ, "1041"], // Infosys
		// 	[ExchangeSegment.NSE_EQ, "19813"], // L&T
		// 	[ExchangeSegment.NSE_EQ, "1235"], // Wipro
		// ];

		// Set up event handlers - use "message" event for connection info
		dhanFeed.multiConnectionLiveFeed.on("message", ({connectionId, data}) => {
			const timestamp = new Date().toLocaleTimeString();

			console.log(`\n[${timestamp}] Connection ${connectionId} - Received ${data.type.toUpperCase()} data:`);
			console.log("=".repeat(60));

			// Common fields for all packet types
			console.log(`Exchange Segment: ${data.exchangeSegment}`);
			console.log(`Security ID: ${data.securityId}`);
			console.log(`Packet Type: ${data.type}`);

			// Type-specific detailed logging
			switch (data.type) {
				case "ticker":
					console.log(`Last Traded Price: ₹${data.lastTradedPrice}`);
					console.log(`Last Traded Time: ${data.lastTradedTime ? new Date(data.lastTradedTime * 1000).toLocaleTimeString() : "N/A"}`);
					break;

				case "quote":
					console.log(`Last Traded Price: ₹${data.lastTradedPrice}`);
					console.log(`Last Traded Quantity: ${data.lastTradedQuantity}`);
					console.log(`Last Traded Time: ${data.lastTradedTime ? new Date(data.lastTradedTime * 1000).toLocaleTimeString() : "N/A"}`);
					console.log(`Average Trade Price: ₹${data.averageTradePrice}`);
					console.log(`Volume Traded: ${data.volumeTraded}`);
					console.log(`Total Sell Quantity: ${data.totalSellQuantity}`);
					console.log(`Total Buy Quantity: ${data.totalBuyQuantity}`);
					console.log(`Open Price: ₹${data.openPrice}`);
					console.log(`Close Price: ₹${data.closePrice}`);
					console.log(`High Price: ₹${data.highPrice}`);
					console.log(`Low Price: ₹${data.lowPrice}`);
					break;

				case "full":
					console.log(`Last Traded Price: ₹${data.lastTradedPrice}`);
					console.log(`Last Traded Quantity: ${data.lastTradedQuantity}`);
					console.log(`Last Traded Time: ${data.lastTradedTime ? new Date(data.lastTradedTime * 1000).toLocaleTimeString() : "N/A"}`);
					console.log(`Average Trade Price: ₹${data.averageTradePrice}`);
					console.log(`Volume Traded: ${data.volumeTraded}`);
					console.log(`Total Sell Quantity: ${data.totalSellQuantity}`);
					console.log(`Total Buy Quantity: ${data.totalBuyQuantity}`);
					console.log(`Open Interest: ${data.openInterest}`);
					console.log(`OI Day High: ${data.openInterestDayHigh}`);
					console.log(`OI Day Low: ${data.openInterestDayLow}`);
					console.log(`Open Price: ₹${data.openPrice}`);
					console.log(`Close Price: ₹${data.closePrice}`);
					console.log(`High Price: ₹${data.highPrice}`);
					console.log(`Low Price: ₹${data.lowPrice}`);

					if (data.marketDepth) {
						console.log("\n📊 Market Depth:");
						console.log("BUY SIDE:");
						data.marketDepth.buy.forEach((level: any, index: number) => {
							console.log(`  Level ${index + 1}: Price ₹${level.price}, Qty ${level.quantity}, Orders ${level.orders}`);
						});
						console.log("SELL SIDE:");
						data.marketDepth.sell.forEach((level: any, index: number) => {
							console.log(`  Level ${index + 1}: Price ₹${level.price}, Qty ${level.quantity}, Orders ${level.orders}`);
						});
					}
					break;

				case "prev_close":
					console.log(`Previous Close Price: ₹${data.previousClosePrice}`);
					console.log(`Previous Open Interest: ${data.previousOpenInterest}`);
					break;

				case "oi_data":
					console.log(`Open Interest: ${data.openInterest}`);
					break;

				case "market_status":
					console.log(`Market Status: ${data.status}`);
					break;

				default:
					console.log("Raw Data:", JSON.stringify(data, null, 2));
			}

			console.log("=".repeat(60));
		});

		// Also listen to the compatibility "data" event (without connection info) - simplified
		dhanFeed.multiConnectionLiveFeed.on("data", data => {
			const timestamp = new Date().toLocaleTimeString();
			console.log(`[${timestamp}] 📡 Data Event: ${data.type} for Security ${data.securityId}`);
		});

		dhanFeed.multiConnectionLiveFeed.on("error", error => {
			console.error(`Connection ${error.connectionId} error:`, error.error.message);
		});

		dhanFeed.multiConnectionLiveFeed.on("close", event => {
			console.log(`Connection ${event.connectionId} closed: ${event.code} - ${event.reason}`);
		});

		// Subscribe to different instrument sets with different feed types
		// console.log("📈 Subscribing to first set of instruments (TICKER)...");
		// await dhanFeed.multiConnectionLiveFeed.subscribe(instrumentSet1, FeedRequestCode.SUBSCRIBE_TICKER);

		console.log("📊 Subscribing to same instruments for QUOTE data...");
		await dhanFeed.multiConnectionLiveFeed.subscribe(instrumentSet1, FeedRequestCode.SUBSCRIBE_QUOTE);

		// console.log("📋 Subscribing to same instruments for FULL market data...");
		// await dhanFeed.multiConnectionLiveFeed.subscribe(instrumentSet1, FeedRequestCode.SUBSCRIBE_FULL);

		// console.log("📊 Subscribing to second set of instruments (QUOTE)...");
		// await dhanFeed.multiConnectionLiveFeed.subscribe(instrumentSet2, FeedRequestCode.SUBSCRIBE_QUOTE);

		// console.log("📋 Subscribing to third set of instruments (FULL)...");
		// await dhanFeed.multiConnectionLiveFeed.subscribe(instrumentSet3, FeedRequestCode.SUBSCRIBE_FULL);

		// Show connection status
		const connectionStatus = dhanFeed.multiConnectionLiveFeed.getConnectionStatus();
		console.log("\n🔗 Connection Status:");
		connectionStatus.forEach(conn => {
			console.log(`  Connection ${conn.connectionId}: ${conn.state} (${conn.instrumentCount} instruments)`);
		});

		console.log("\n✅ Multi-connection live feed demo is running!");
		console.log("💡 This feed can handle multiple connections automatically");
		console.log("💡 Each connection can handle up to 5000 instruments");
		console.log("💡 Data will be distributed across connections as needed");

		// Add graceful shutdown handler
		process.on("SIGINT", () => {
			console.log("\n🛑 Gracefully shutting down multi-connection feed...");
			dhanFeed.multiConnectionLiveFeed.close();
			process.exit(0);
		});
	} catch (error) {
		console.error("Error in multi-connection live feed demo:", error);
	}
}

export async function demoMockMultiConnectionLiveFeed(dhanFeed: DhanFeed) {
	console.log("\nDemonstrating Mock Multi-Connection Live Feed:");

	try {
		// Define instrument sets for testing
		const instrumentSet1: Instrument[] = [
			[ExchangeSegment.NSE_EQ, "14043"], // Reliance
			[ExchangeSegment.NSE_EQ, "11536"], // HDFC Bank
			[ExchangeSegment.NSE_EQ, "9931"], // ICICI Bank
		];

		const instrumentSet2: Instrument[] = [
			[ExchangeSegment.NSE_EQ, "7508"], // SBI
			[ExchangeSegment.NSE_EQ, "993"], // ITC
			[ExchangeSegment.NSE_EQ, "1333"], // TCS
		];

		// Set up event handlers
		dhanFeed.mockMultiConnectionLiveFeed.on("data", data => {
			const timestamp = new Date().toLocaleTimeString();
			console.log(`[${timestamp}] 🎭 Mock Connection ${data.connectionId} - Received data:`, {
				type: data.type,
				securityId: data.securityId,
				lastTradedPrice: data.lastTradedPrice || "N/A",
			});
		});

		dhanFeed.mockMultiConnectionLiveFeed.on("error", error => {
			console.error(`🎭 Mock Connection ${error.connectionId} error:`, error.error?.message || error);
		});

		dhanFeed.mockMultiConnectionLiveFeed.on("close", event => {
			console.log(`🎭 Mock Connection ${event.connectionId} closed: ${event.code} - ${event.reason}`);
		});

		// Subscribe to different instrument sets
		console.log("🎭 Subscribing to first set of mock instruments (TICKER)...");
		await dhanFeed.mockMultiConnectionLiveFeed.subscribe(instrumentSet1, FeedRequestCode.SUBSCRIBE_TICKER);

		console.log("🎭 Subscribing to second set of mock instruments (QUOTE)...");
		await dhanFeed.mockMultiConnectionLiveFeed.subscribe(instrumentSet2, FeedRequestCode.SUBSCRIBE_QUOTE);

		// Show connection status
		const connectionStatus = dhanFeed.mockMultiConnectionLiveFeed.getConnectionStatus();
		console.log("\n🎭 Mock Connection Status:");
		connectionStatus.forEach(conn => {
			console.log(`  Connection ${conn.connectionId}: ${conn.state} (${conn.instrumentCount} instruments)`);
		});

		console.log("\n✅ Mock multi-connection live feed demo is running!");
		console.log("🎭 This is a simulated feed that generates realistic market data");
		console.log("💡 Perfect for testing multi-connection logic without real market data");
		console.log("💡 Simulates the same connection management as the real feed");

		// Add graceful shutdown handler
		process.on("SIGINT", () => {
			console.log("\n🛑 Gracefully shutting down mock multi-connection feed...");
			dhanFeed.mockMultiConnectionLiveFeed.close();
			process.exit(0);
		});
	} catch (error) {
		console.error("Error in mock multi-connection live feed demo:", error);
	}
}