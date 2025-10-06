import {DhanFeed} from "../src";
import {ExchangeSegment, Instrument, DepthLevel} from "../src/types";

/**
 * Demo: 20 Level Market Depth Feed
 *
 * Demonstrates how to subscribe to 20 level market depth data via WebSocket.
 * - Supports up to 50 instruments per connection
 * - Shows complete bid/ask depth data with 20 levels
 * - Real-time market microstructure data
 */
export async function demo20LevelDepthFeed(dhanFeed: DhanFeed) {
	console.log("\n📊 Demonstrating 20 Level Market Depth Feed:");

	try {
		// Define instruments to subscribe (20 level allows up to 50 instruments per connection)
		const instruments: Instrument[] = [
			[ExchangeSegment.NSE_EQ, "1333"], // HDFC Bank
			[ExchangeSegment.NSE_EQ, "11536"], // TCS
			[ExchangeSegment.NSE_EQ, "25"], // Reliance
		];

		// Set up event handlers - use "message" event for connection info
		dhanFeed.marketDepthFeed20.on("message", ({connectionId, data}) => {
			const timestamp = new Date().toLocaleTimeString();

			if (data.type === "depth_bid" || data.type === "depth_ask") {
				console.log(`\n[${timestamp}] Connection ${connectionId} - ${data.type.toUpperCase()}`);
				console.log("=".repeat(80));
				console.log(`Exchange Segment: ${data.exchangeSegment}`);
				console.log(`Security ID: ${data.securityId}`);
				console.log(`Depth Type: ${data.depthType} levels`);
				console.log(`Total Levels Received: ${data.levels.length}`);

				// Display top 10 levels
				console.log(`\n📈 Top 10 ${data.type === "depth_bid" ? "BID" : "ASK"} Levels:`);
				data.levels.slice(0, 10).forEach((level: DepthLevel, index: number) => {
					const priceSymbol = data.type === "depth_bid" ? "🟢" : "🔴";
					console.log(
						`  ${priceSymbol} Level ${(index + 1).toString().padStart(2, " ")}: ` +
							`Price ₹${level.price.toFixed(2).padStart(10, " ")}, ` +
							`Qty ${level.quantity.toString().padStart(8, " ")}, ` +
							`Orders ${level.orders.toString().padStart(5, " ")}`
					);
				});

				// Calculate and display summary statistics
				const totalQuantity = data.levels.reduce((sum: number, level: DepthLevel) => sum + level.quantity, 0);
				const totalOrders = data.levels.reduce((sum: number, level: DepthLevel) => sum + level.orders, 0);
				const avgPrice =
					data.levels.reduce((sum: number, level: DepthLevel) => sum + level.price * level.quantity, 0) / (totalQuantity || 1);

				console.log(`\n📊 Summary:`);
				console.log(`  Total Quantity: ${totalQuantity.toLocaleString()}`);
				console.log(`  Total Orders: ${totalOrders.toLocaleString()}`);
				console.log(`  Weighted Avg Price: ₹${avgPrice.toFixed(2)}`);
				console.log("=".repeat(80));
			} else if (data.type === "error") {
				console.error(`\n❌ Error on connection ${connectionId}:`, data.errorMessage);
			} else if (data.type === "disconnection") {
				console.warn(`\n⚠️  Connection ${connectionId} disconnected: [${data.errorCode}] ${data.reason}`);
			}
		});

		// Also listen to the compatibility "data" event (without connection info) - simplified
		dhanFeed.marketDepthFeed20.on("data", data => {
			if (data.type === "depth_bid" || data.type === "depth_ask") {
				const timestamp = new Date().toLocaleTimeString();
				console.log(`[${timestamp}] 📡 Data Event: ${data.type} for Security ${data.securityId} (${data.levels.length} levels)`);
			}
		});

		dhanFeed.marketDepthFeed20.on("error", error => {
			console.error(`❌ Connection ${error.connectionId} error:`, error.error);
		});

		dhanFeed.marketDepthFeed20.on("close", event => {
			console.log(`🔌 Connection ${event.connectionId} closed: ${event.code} - ${event.reason}`);
		});

		dhanFeed.marketDepthFeed20.on("connect", ({connectionId}) => {
			console.log(`✅ Connection ${connectionId} established for 20 level depth`);
		});

		dhanFeed.marketDepthFeed20.on("disconnection", ({connectionId, errorCode, reason}) => {
			console.warn(`⚠️  Connection ${connectionId} feed disconnection: [${errorCode}] ${reason}`);
		});

		// Subscribe to instruments
		console.log(`\n🔗 Subscribing to ${instruments.length} instruments for 20 level depth...`);
		await dhanFeed.marketDepthFeed20.subscribe(instruments);

		// Show connection status
		const connectionStatus = dhanFeed.marketDepthFeed20.getConnectionStatus();
		console.log("\n🔗 Connection Status:");
		connectionStatus.forEach(conn => {
			console.log(`  Connection ${conn.connectionId}: ${conn.state} (${conn.instrumentCount} instruments) - Depth: ${conn.depthType} levels`);
		});

		console.log("\n✅ 20 Level Market Depth feed is running!");
		console.log("💡 Each connection can handle up to 50 instruments");
		console.log("💡 You'll receive separate BID and ASK depth packets");
		console.log("💡 Each packet contains 20 levels of market depth");
		console.log("💡 Press Ctrl+C to exit");

		// Add graceful shutdown handler
		process.on("SIGINT", () => {
			console.log("\n🛑 Gracefully shutting down 20 level depth feed...");
			dhanFeed.marketDepthFeed20.close();
			process.exit(0);
		});
	} catch (error) {
		console.error("Error in 20 level market depth feed demo:", error);
	}
}

/**
 * Demo: 200 Level Market Depth Feed
 *
 * Demonstrates how to subscribe to 200 level market depth data via WebSocket.
 * - Only 1 instrument per connection (Dhan API limitation)
 * - Shows ultra-deep market depth with 200 levels
 * - Ideal for analyzing complete demand-supply zones
 */
export async function demo200LevelDepthFeed(dhanFeed: DhanFeed) {
	console.log("\n📊 Demonstrating 200 Level Market Depth Feed:");

	try {
		// Define instruments to subscribe (200 level allows only 1 instrument per connection)
		// For multiple instruments, multiple connections will be created automatically
		const instruments: Instrument[] = [
			[ExchangeSegment.NSE_EQ, "1333"], // HDFC Bank
			// Note: Each additional instrument will create a new connection (max 5 connections)
		];

		// Set up event handlers
		dhanFeed.marketDepthFeed200.on("message", ({connectionId, data}) => {
			const timestamp = new Date().toLocaleTimeString();

			if (data.type === "depth_bid" || data.type === "depth_ask") {
				console.log(`\n[${timestamp}] Connection ${connectionId} - ${data.type.toUpperCase()}`);
				console.log("=".repeat(80));
				console.log(`Exchange Segment: ${data.exchangeSegment}`);
				console.log(`Security ID: ${data.securityId}`);
				console.log(`Depth Type: ${data.depthType} levels`);
				console.log(`Total Levels Received: ${data.levels.length}`);

				// Display top 20 levels for 200 level depth
				console.log(`\n📈 Top 20 ${data.type === "depth_bid" ? "BID" : "ASK"} Levels:`);
				data.levels.slice(0, 20).forEach((level: DepthLevel, index: number) => {
					const priceSymbol = data.type === "depth_bid" ? "🟢" : "🔴";
					console.log(
						`  ${priceSymbol} Level ${(index + 1).toString().padStart(3, " ")}: ` +
							`Price ₹${level.price.toFixed(2).padStart(10, " ")}, ` +
							`Qty ${level.quantity.toString().padStart(8, " ")}, ` +
							`Orders ${level.orders.toString().padStart(5, " ")}`
					);
				});

				// Calculate and display summary statistics
				const totalQuantity = data.levels.reduce((sum: number, level: DepthLevel) => sum + level.quantity, 0);
				const totalOrders = data.levels.reduce((sum: number, level: DepthLevel) => sum + level.orders, 0);
				const avgPrice =
					data.levels.reduce((sum: number, level: DepthLevel) => sum + level.price * level.quantity, 0) / (totalQuantity || 1);

				// Analyze depth distribution
				const firstQuarter = data.levels.slice(0, 50);
				const secondQuarter = data.levels.slice(50, 100);
				const thirdQuarter = data.levels.slice(100, 150);
				const fourthQuarter = data.levels.slice(150, 200);

				const quarterQuantities = [
					firstQuarter.reduce((sum: number, l: DepthLevel) => sum + l.quantity, 0),
					secondQuarter.reduce((sum: number, l: DepthLevel) => sum + l.quantity, 0),
					thirdQuarter.reduce((sum: number, l: DepthLevel) => sum + l.quantity, 0),
					fourthQuarter.reduce((sum: number, l: DepthLevel) => sum + l.quantity, 0),
				];

				console.log(`\n📊 Summary (All ${data.levels.length} levels):`);
				console.log(`  Total Quantity: ${totalQuantity.toLocaleString()}`);
				console.log(`  Total Orders: ${totalOrders.toLocaleString()}`);
				console.log(`  Weighted Avg Price: ₹${avgPrice.toFixed(2)}`);

				console.log(`\n📈 Depth Distribution (by quartile):`);
				console.log(`  Levels 1-50:   ${quarterQuantities[0].toLocaleString()} (${((quarterQuantities[0] / totalQuantity) * 100).toFixed(1)}%)`);
				console.log(`  Levels 51-100: ${quarterQuantities[1].toLocaleString()} (${((quarterQuantities[1] / totalQuantity) * 100).toFixed(1)}%)`);
				console.log(`  Levels 101-150: ${quarterQuantities[2].toLocaleString()} (${((quarterQuantities[2] / totalQuantity) * 100).toFixed(1)}%)`);
				console.log(`  Levels 151-200: ${quarterQuantities[3].toLocaleString()} (${((quarterQuantities[3] / totalQuantity) * 100).toFixed(1)}%)`);
				console.log("=".repeat(80));
			} else if (data.type === "error") {
				console.error(`\n❌ Error on connection ${connectionId}:`, data.errorMessage);
			} else if (data.type === "disconnection") {
				console.warn(`\n⚠️  Connection ${connectionId} disconnected: [${data.errorCode}] ${data.reason}`);
			}
		});

		// Also listen to the compatibility "data" event (without connection info) - simplified
		dhanFeed.marketDepthFeed200.on("data", data => {
			if (data.type === "depth_bid" || data.type === "depth_ask") {
				const timestamp = new Date().toLocaleTimeString();
				console.log(`[${timestamp}] 📡 Data Event: ${data.type} for Security ${data.securityId} (${data.levels.length} levels)`);
			}
		});

		dhanFeed.marketDepthFeed200.on("error", error => {
			console.error(`❌ Connection ${error.connectionId} error:`, error.error);
		});

		dhanFeed.marketDepthFeed200.on("close", event => {
			console.log(`🔌 Connection ${event.connectionId} closed: ${event.code} - ${event.reason}`);
		});

		dhanFeed.marketDepthFeed200.on("connect", ({connectionId}) => {
			console.log(`✅ Connection ${connectionId} established for 200 level depth`);
		});

		dhanFeed.marketDepthFeed200.on("disconnection", ({connectionId, errorCode, reason}) => {
			console.warn(`⚠️  Connection ${connectionId} feed disconnection: [${errorCode}] ${reason}`);
		});

		// Subscribe to instruments
		console.log(`\n🔗 Subscribing to ${instruments.length} instrument(s) for 200 level depth...`);
		await dhanFeed.marketDepthFeed200.subscribe(instruments);

		// Show connection status
		const connectionStatus = dhanFeed.marketDepthFeed200.getConnectionStatus();
		console.log("\n🔗 Connection Status:");
		connectionStatus.forEach(conn => {
			console.log(`  Connection ${conn.connectionId}: ${conn.state} (${conn.instrumentCount} instrument) - Depth: ${conn.depthType} levels`);
		});

		console.log("\n✅ 200 Level Market Depth feed is running!");
		console.log("💡 Each connection handles ONLY 1 instrument for 200 level depth");
		console.log("💡 You'll receive separate BID and ASK depth packets");
		console.log("💡 Each packet contains up to 200 levels of market depth");
		console.log("💡 This provides complete demand-supply zone visibility");
		console.log("💡 Press Ctrl+C to exit");

		// Add graceful shutdown handler
		process.on("SIGINT", () => {
			console.log("\n🛑 Gracefully shutting down 200 level depth feed...");
			dhanFeed.marketDepthFeed200.close();
			process.exit(0);
		});
	} catch (error) {
		console.error("Error in 200 level market depth feed demo:", error);
	}
}
