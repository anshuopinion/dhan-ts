import {DhanHqClient, DhanFeed} from "../src";
import {
	DhanConfig,
	DhanEnv,
	ExchangeSegment,
	TransactionType,
	ProductType,
	OrderType,
	Validity,
	KillSwitchStatus,
	FeedRequestCode,
	Instrument,
	OrderFlag,
	InstrumentToken,
	ExchangeSegmentText,
	TimeInterval,
} from "../src/types";
import dotenv from "dotenv";

dotenv.config();

const config: DhanConfig = {
	accessToken: process.env.ACCESS_TOKEN!,
	clientId: process.env.DHAN_CLIENT_ID!,
	env: DhanEnv.PROD,
};

const dhanClient = new DhanHqClient(config);
const dhanFeed = new DhanFeed(config);

async function demoOrders() {
	console.log("\nDemonstrating Orders API:");

	// Place an order
	// const orderRequest = {
	//   dhanClientId: config.clientId,
	//   transactionType: TransactionType.BUY,
	//   correlationId: "1234",
	//   exchangeSegment: ExchangeSegmentText.NSE_EQ,
	//   productType: ProductType.CNC,
	//   orderType: OrderType.LIMIT,
	//   validity: Validity.DAY,
	//   securityId: "9362", // HDFC Bank
	//   quantity: 1,
	//   price: 311,
	//   disclosedQuantity: 0,
	//   afterMarketOrder: false,
	// };
	// const orderRequest = {
	//   securityId: "19813",
	//   correlationId: "6e6fe8a0bb",
	//   exchangeSegment: "NSE_EQ",
	//   transactionType: "BUY",
	//   quantity: 1,
	//   orderType: "LIMIT",
	//   productType: "INTRADAY",
	//   validity: "DAY",
	//   triggerPrice: 267.4662,
	//   price: 267.6,
	//   dhanClientId: config.clientId,
	//   afterMarketOrder: false,
	//   disclosedQuantity: 0,
	// };

	// const placedOrder = await dhanClient.orders.placeOrder(orderRequest as any);
	// console.log("Placed order:", placedOrder);

	// Get all orders
	// const allOrders = await dhanClient.orders.getOrders();
	// console.log("All orders:", allOrders);

	// // Get order by ID
	// if (allOrders.length > 0) {
	//   const orderById = await dhanClient.orders.getOrderById(
	//     allOrders[0].orderId
	//   );
	//   console.log("Order by ID:", orderById);
	// }

	// remove order

	// if (allOrders.length > 0) {
	//   const cancelOrder = await dhanClient.orders.cancelOrder(
	//     allOrders[0].orderId
	//   );
	//   console.log("Order removed:", cancelOrder);
	// }

	// modifyOrder

	// const orderModifyRequest = {
	//   dhanClientId: config.clientId,
	//   orderId: allOrders[0].orderId,
	//   orderType: OrderType.LIMIT,
	//   // legName: "",
	//   quantity: 1,
	//   price: 312,
	//   disclosedQuantity: 0,
	//   // triggerPrice: "",
	//   validity: Validity.DAY,
	// };

	// if (allOrders.length > 0) {
	//   const modifyOrder = await dhanClient.orders.modifyOrder(
	//     allOrders[0].orderId,
	//     orderModifyRequest
	//   );
	//   console.log("Order modified:", modifyOrder);
	// }

	// get order by external id
	// const orderbyExternal = await dhanClient.orders.getOrderByCorrelationId(
	//   "1234"
	// );
	// console.log("Order by external id:", orderbyExternal);

	// get trades
	// const trades = await dhanClient.orders.getTrades();
	// console.log("Trades:", trades);

	// get trades by order id

	// const tradesByOrderId = await dhanClient.orders.getTradesByOrderId(
	//   "4124100927065"
	// );
	// console.log("Trades by order id:", tradesByOrderId);
}

async function demoPortfolio() {
	// console.log("\nDemonstrating Portfolio API:");
	// Get holdings
	// const holdings = await dhanClient.portfolio.getHoldings();
	// console.log("Holdings:", holdings);
	// Get positions
	// const positions = await dhanClient.portfolio.getPositions();
	// console.log("Positions:", positions);
}

async function demoFunds() {
	console.log("\nDemonstrating Funds API:");

	// Get fund limits
	// const fundLimits = await dhanClient.funds.getFundLimit();
	// console.log("Fund limits:", fundLimits);

	// Calculate margin
	// const marginRequest = {
	//   dhanClientId: config.clientId,
	//   exchangeSegment: ExchangeSegment.NSE_EQ,
	//   transactionType: TransactionType.BUY,
	//   quantity: 1,
	//   productType: ProductType.CNC,
	//   securityId: "1333", // HDFC Bank
	//   price: 1500,
	// };
	// const marginCalculation = await dhanClient.funds.calculateMargin(
	//   marginRequest
	// );
	// console.log("Margin calculation:", marginCalculation);
}

async function demoEDIS() {
	console.log("\nDemonstrating EDIS API:");

	// Generate TPIN
	await dhanClient.edis.generateTpin();
	console.log("TPIN generation initiated");

	// Generate EDIS form
	const edisFormRequest = {
		isin: "INE040A01034", // HDFC Bank ISIN
		qty: 1,
		exchange: "NSE",
		segment: "E",
		bulk: false,
	};
	const edisForm = await dhanClient.edis.generateEdisForm(edisFormRequest);
	console.log("EDIS form:", edisForm);

	// Inquire EDIS status
	const edisStatus = await dhanClient.edis.inquireEdisStatus("INE040A01034");
	console.log("EDIS status:", edisStatus);
}

async function demoForeverOrders() {
	console.log("\nDemonstrating Forever Orders API:");

	// Create a forever order
	const foreverOrderRequest = {
		dhanClientId: config.clientId,
		orderFlag: OrderFlag.SINGLE,
		transactionType: TransactionType.BUY,
		exchangeSegment: ExchangeSegment.NSE_EQ,
		productType: ProductType.CNC,
		orderType: OrderType.LIMIT,
		validity: Validity.DAY,
		securityId: "1333", // HDFC Bank
		quantity: 1,
		price: 1500,
		triggerPrice: 1490,
	};
	const foreverOrder = await dhanClient.foreverOrders.createForeverOrder(foreverOrderRequest);
	console.log("Created forever order:", foreverOrder);

	// Get all forever orders
	const allForeverOrders = await dhanClient.foreverOrders.getAllForeverOrders();
	console.log("All forever orders:", allForeverOrders);
}

async function demoTradersControl() {
	console.log("\nDemonstrating Traders Control API:");

	// Set kill switch
	const killSwitchResponse = await dhanClient.tradersControl.setKillSwitch(KillSwitchStatus.ACTIVATE);
	console.log("Kill switch response:", killSwitchResponse);
}

async function demoStatements() {
	console.log("\nDemonstrating Statements API:");

	// not working for me

	// Get ledger report
	// const ledgerReport = await dhanClient.statements.getLedgerReport(
	//   "2024-10-02",
	//   "2024-10-09"
	// );
	// console.log("Ledger report:", ledgerReport);

	// Get trade history
	// const tradeHistory = await dhanClient.statements.getTradeHistory(
	//   "2024-09-09",
	//   "2024-10-02"
	// );
	// console.log("Trade history:", tradeHistory);
}

async function demoLiveFeed() {
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

async function demoLiveFeedMock() {
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
async function demoLiveOrderUpdate() {
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

async function demoMarketData() {
	console.log("\nDemonstrating Market Data API:");

	// const marketFeedRequest = {
	//   NSE_EQ: [9362],
	// };

	// Get LTP
	// const ltp = await dhanClient.marketData.getLTP(marketFeedRequest);
	// console.log("LTP:", ltp.data);

	// Get OHLC
	// const ohlc = await dhanClient.marketData.getOHLC(marketFeedRequest);
	// console.log("OHLC:", ohlc.data.NSE_EQ);

	// Get Quote
	// const quote = await dhanClient.marketData.getQuote(marketFeedRequest);
	// console.log("Quote:", quote.data.NSE_EQ);

	// Get Historical Data (Candle)

	// const historical = await dhanClient.marketData.getDailyHistoricalData({
	//   securityId: "19913",
	//   exchangeSegment: ExchangeSegmentText.NSE_EQ,
	//   instrument: InstrumentToken.EQUITY,
	//   toDate: "2024-10-04",
	//   fromDate: "2024-09-01",
	//   expiryCode: 0,
	// });
	// console.log("Historical Data:", historical);

	// Get Intraday Data (Candle)
	const intraday = await dhanClient.marketData.getIntradayHistoricalData({
		securityId: "1235",
		exchangeSegment: ExchangeSegmentText.NSE_EQ,
		instrument: InstrumentToken.EQUITY,
		interval: "2",
		toDate: "2024-12-10",
		fromDate: "2024-12-10",
	});
	console.log("last 5 Hlose", intraday.close.slice(-3));
	console.log("time frame", intraday.timestamp.slice(-3));
	console.log(
		"time frame",
		intraday.timestamp.slice(-3).map((time: number) => new Date(time * 1000).toLocaleTimeString())
	);
}

async function allTimeFrameCandles() {
	// Combined all time frame candles
	const historical = await dhanClient.marketData.getProcessedCandleData({
		exchangeSegment: ExchangeSegmentText.NSE_EQ,
		expiryCode: 0,
		instrument: InstrumentToken.EQUITY,
		interval: TimeInterval.MIN_30,
		securityId: "1041",
		daysAgo: 2,
		// from: "2025-01-17",
		to: "2025-01-17",
		isFree: true,
	});

	console.log(
		"Historical Data:",
		historical.timestamp.map((time: number) => new Date(time * 1000).toLocaleDateString())
	);
}

async function demoScanner() {
	console.log("\nDemonstrating Simple Scanner API:");
	console.log("(Thin wrapper - all logic handled by the API)");

	try {
		// Example: Pass any request data directly to the API
		console.log("\n=== Example API Request ===");

		// This is just an example - you can pass any structure the API accepts
		const exampleRequest = {
			data: {
				sort: "Mcap",
				sorder: "desc",
				count: 25,
				params: [
					{field: "Exch", op: "", val: "NSE"},
					{field: "PPerchange", op: "gte", val: "6"},
					{field: "Ltp", op: "gte", val: "50"},
					{field: "Exch", op: "", val: "NSE"},
					{field: "Mcap", op: "gte", val: "500"},
					{field: "Ltp", op: "RANGE", val: "5_200"},
					{field: "PPerchange", op: "gte", val: "9"},
					{field: "Volume", op: "gte", val: "100000"},
					{field: "OgInst", op: "", val: "ES"},
					{field: "Volume", op: "gte", val: "0"},
				],
				logic_op: "AND",
				fields: ["DispSym", "Pchange", "Volume", "Pe", "Sym"],
				pgno: 1,
			},
		};

		console.log("Sending request to API:");
		console.log(JSON.stringify(exampleRequest, null, 2));

		const result = await dhanClient.scanner.scan(exampleRequest);
		console.log("\nAPI Response:");
		console.log("Status:", result.code || "N/A");
		console.log("Records:", result.tot_rec || 0);
		console.log("Data items:", result.data?.length || 0);

		if (result.data && result.data.length > 0) {
			console.log("\nFirst few results:");
			result.data.slice(0, 3).forEach((item, index) => {
				console.log(`${index + 1}.`, JSON.stringify(item, null, 2));
			});
		}

		console.log("\n✅ Scanner working as thin API wrapper!");
		console.log("💡 The scanner simply passes your request to the API and returns the response.");
		console.log("💡 Structure your request data according to the API documentation.");
	} catch (error) {
		console.error("Scanner demo error:", error);
		console.log("\n💡 This is expected if the API endpoint structure has changed.");
		console.log("💡 The scanner is a simple wrapper - just update your request format as needed.");
	}
}
async function demoMultiConnectionLiveFeed() {
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
		console.log("📈 Subscribing to first set of instruments (TICKER)...");
		await dhanFeed.multiConnectionLiveFeed.subscribe(instrumentSet1, FeedRequestCode.SUBSCRIBE_TICKER);

		console.log("📊 Subscribing to same instruments for QUOTE data...");
		await dhanFeed.multiConnectionLiveFeed.subscribe(instrumentSet1, FeedRequestCode.SUBSCRIBE_QUOTE);

		console.log("📋 Subscribing to same instruments for FULL market data...");
		await dhanFeed.multiConnectionLiveFeed.subscribe(instrumentSet1, FeedRequestCode.SUBSCRIBE_FULL);

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

async function demoMockMultiConnectionLiveFeed() {
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

async function runComprehensiveDemo() {
	try {
		// await demoOrders();
		// await demoPortfolio();
		// await demoFunds();
		// await demoEDIS();
		// await demoMarketData();
		// await allTimeFrameCandles();
		// await demoScanner();
		// await demoForeverOrders();
		// await demoTradersControl();
		// await demoStatements();
		// await demoLiveFeed();
		// await demoLiveOrderUpdate();
		// await demoLiveFeedMock();
		await demoMultiConnectionLiveFeed();
		// await demoMockMultiConnectionLiveFeed();
	} catch (error) {
		console.error("Error in demo:", error);
	}
}
runComprehensiveDemo();
