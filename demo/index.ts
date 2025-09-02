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
	StockBasicDetailsRequest,
	StockFundamentalRequest,
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

async function demoStockBasicDetails() {
	console.log("\nDemonstrating Stock Basic Details API:");

	try {
		// Test with IDBI Bank (the example from your curl request)
		const request: StockBasicDetailsRequest = {
			Seg: 1, // NSE Equity segment
			SecId: 1476 // IDBI Bank security ID
		};

		console.log("Fetching stock basic details for Security ID:", request.SecId);
		
		const stockDetails = await dhanClient.marketData.getStockBasicDetails(request);
		
		console.log("\n=== BASIC INFORMATION ===");
		console.log(`Company: ${stockDetails.d_sym}`);
		console.log(`Symbol: ${stockDetails.sym}`);
		console.log(`ISIN: ${stockDetails.isin}`);
		console.log(`Exchange: ${stockDetails.exch}`);
		console.log(`Sector: ${stockDetails.sec}`);
		console.log(`Sub-Sector: ${stockDetails.sub_sec}`);
		
		console.log("\n=== CURRENT PRICE DATA ===");
		console.log(`Last Traded Price: ₹${stockDetails.Ltp}`);
		console.log(`Change: ₹${stockDetails.ch} (${stockDetails.p_ch}%)`);
		console.log(`Open: ₹${stockDetails.op}`);
		console.log(`High: ₹${stockDetails.hg}`);
		console.log(`Low: ₹${stockDetails.lo}`);
		console.log(`Previous Close: ₹${stockDetails.cl}`);
		console.log(`Volume: ${stockDetails.vol.toLocaleString()}`);
		console.log(`Average Trade Price: ₹${stockDetails.atp}`);
		
		console.log("\n=== CIRCUIT LIMITS ===");
		console.log(`Upper Circuit: ₹${stockDetails.uckt}`);
		console.log(`Lower Circuit: ₹${stockDetails.lckt}`);
		
		console.log("\n=== HISTORICAL PERFORMANCE ===");
		console.log(`1 Week: ${stockDetails.c1Wk > 0 ? '+' : ''}₹${stockDetails.c1Wk} (${stockDetails.chp1wk}%)`);
		console.log(`1 Month: ${stockDetails.c1m > 0 ? '+' : ''}₹${stockDetails.c1m} (${stockDetails.chp1m}%)`);
		console.log(`3 Months: ${stockDetails.c3m > 0 ? '+' : ''}₹${stockDetails.c3m} (${stockDetails.chp3m}%)`);
		console.log(`6 Months: ${stockDetails.c6m > 0 ? '+' : ''}₹${stockDetails.c6m} (${stockDetails.chp6m}%)`);
		console.log(`1 Year: ${stockDetails.c1y > 0 ? '+' : ''}₹${stockDetails.c1y} (${stockDetails.chp1y}%)`);
		
		console.log("\n=== 52-WEEK RANGE ===");
		console.log(`52W High: ₹${stockDetails.h1y}`);
		console.log(`52W Low: ₹${stockDetails.l1y}`);
		
		console.log("\n=== TECHNICAL DATA ===");
		console.log(`Lot Size: ${stockDetails.ltsz}`);
		console.log(`Tick Size: ₹${stockDetails.tksz}`);
		console.log(`Last Trade Time: ${stockDetails.ltt}`);
		
		if (stockDetails.idx_lst && stockDetails.idx_lst.length > 0) {
			console.log("\n=== INDEX MEMBERSHIP ===");
			stockDetails.idx_lst.forEach(index => {
				console.log(`- ${index.name}`);
			});
		}
		
		console.log("\n=== MARKET DEPTH (TOP LEVEL) ===");
		if (stockDetails.submbp && stockDetails.submbp.length > 0) {
			const topLevel = stockDetails.submbp[0];
			console.log(`Buy: ₹${topLevel.bp} (Qty: ${topLevel.bqt}, Orders: ${topLevel.BuyOrderNo})`);
			console.log(`Sell: ₹${topLevel.sp} (Qty: ${topLevel.sqt}, Orders: ${topLevel.SellOrderNo})`);
		}
		
		console.log("\n✅ Stock Basic Details fetched successfully!");
		
	} catch (error) {
		console.error("Error fetching stock basic details:", error);
	}
}

async function demoStockFundamentals() {
	console.log("\nDemonstrating Stock Fundamental Data API:");

	try {
		// Test with the ISIN from your example
		const request: StockFundamentalRequest = {
			isins: ["INE500L01026"] // The ISIN from your curl request
		};

		console.log("Fetching fundamental data for ISIN:", request.isins[0]);
		
		const fundamentalData = await dhanClient.marketData.getStockFundamentals(request);
		const stockData = fundamentalData.data[0]; // Get first stock data
		
		console.log("\n=== COMPANY OVERVIEW ===");
		console.log(`Company Classification: ${stockData.CV.COMPANY_CLASSIFICATION}`);
		console.log(`Sector: ${stockData.CV.SECTOR}`);
		console.log(`Industry: ${stockData.CV.INDUSTRY_NAME}`);
		console.log(`Market Cap: ₹${stockData.CV.MARKET_CAP} Cr`);
		console.log(`Book Value: ₹${stockData.CV.BOOK_VALUE}`);
		console.log(`Face Value: ₹${stockData.CV.FACE_VALUE}`);
		
		console.log("\n=== VALUATION METRICS ===");
		console.log(`Stock P/E: ${stockData.CV.STOCK_PE}`);
		console.log(`Price to Book Value: ${stockData.CV.PRICE_TO_BOOK_VALUE}`);
		console.log(`Dividend Yield: ${stockData.CV.DIVIDEND_YEILD}%`);
		console.log(`52W High: ₹${stockData.CV["52_WEEK_HIGH"]}`);
		console.log(`52W Low: ₹${stockData.CV["52_WEEK_LOW"]}`);
		
		console.log("\n=== TTM FINANCIALS (Current Year) ===");
		console.log(`Revenue: ₹${stockData.TTM_cy.REVENUE} Cr`);
		console.log(`EBITDA: ₹${stockData.TTM_cy.EBITDA} Cr`);
		console.log(`Net Profit: ₹${stockData.TTM_cy.NET_PROFIT} Cr`);
		console.log(`EPS: ₹${stockData.TTM_cy.EPS}`);
		console.log(`Operating Profit Margin: ${stockData.TTM_cy.OPM}%`);
		
		console.log("\n=== PROFITABILITY RATIOS ===");
		console.log(`ROCE: ${stockData.roce_roe.ROCE}%`);
		console.log(`ROE: ${stockData.roce_roe.ROE}%`);
		console.log(`Company Type: ${stockData.roce_roe.TYPES_OF_COMPANY}`);
		
		console.log("\n=== LATEST SHAREHOLDING PATTERN ===");
		const shareholding = stockData.sHp;
		const years = shareholding.YEAR.split('|');
		const latestYear = years[0];
		const promoterHolding = shareholding.PROMOTER.split('|')[0];
		const publicHolding = shareholding.PUBLIC.split('|')[0];
		const diiHolding = shareholding.DII.split('|')[0];
		const fiiHolding = shareholding.FII.split('|')[0];
		
		console.log(`As of: ${latestYear}`);
		console.log(`Promoter: ${promoterHolding}%`);
		console.log(`Public: ${publicHolding}%`);
		console.log(`DII: ${diiHolding}%`);
		console.log(`FII: ${fiiHolding}%`);
		console.log(`Total Shareholders: ${shareholding.NO_OF_SHARE_HOLDERS.split('|')[0]}`);
		
		console.log("\n=== RECENT FINANCIAL PERFORMANCE ===");
		const revenueGrowthData = stockData.rNp_s;
		const revenueYears = revenueGrowthData.YEAR.split('|');
		const revenueValues = revenueGrowthData.REVENUE.split('|');
		const profitGrowth = revenueGrowthData.PROFIT_GROWTH.split('|');
		const revenueGrowth = revenueGrowthData.REVENUE_GROWTH.split('|');
		
		console.log(`Latest Revenue (${revenueYears[0]}): ₹${revenueValues[0]} Cr`);
		console.log(`Revenue Growth: ${revenueGrowth[0]}%`);
		console.log(`Profit Growth: ${profitGrowth[0]}%`);
		
		console.log("\n=== BALANCE SHEET HIGHLIGHTS (Latest Consolidated) ===");
		const balanceSheet = stockData.bs_c;
		const bsYears = balanceSheet.YEAR.split('|');
		const totalAssets = balanceSheet.TOTAL_ASSETS.split('|')[0];
		const totalEquity = balanceSheet.TOTAL_EQUITY.split('|')[0];
		const currentRatio = (
			parseFloat(balanceSheet.CURRENT_ASSETS.split('|')[0]) / 
			parseFloat(balanceSheet.CURRENT_LIABILITIES.split('|')[0])
		).toFixed(2);
		
		console.log(`As of: ${bsYears[0]}`);
		console.log(`Total Assets: ₹${totalAssets} Cr`);
		console.log(`Total Equity: ₹${totalEquity} Cr`);
		console.log(`Current Ratio: ${currentRatio}`);
		
		console.log("\n✅ Stock Fundamental Data fetched successfully!");
		
	} catch (error) {
		console.error("Error fetching stock fundamental data:", error);
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
		await demoStockBasicDetails();
		await demoStockFundamentals();
		// await demoForeverOrders();
		// await demoTradersControl();
		// await demoStatements();
		// await demoLiveFeed();
		// await demoLiveOrderUpdate();
		// await demoLiveFeedMock();
		// await demoMultiConnectionLiveFeed();
		// await demoMockMultiConnectionLiveFeed();
	} catch (error) {
		console.error("Error in demo:", error);
	}
}
runComprehensiveDemo();
