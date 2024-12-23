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

// MIN_1 = "1m",
// MIN_2 = "2m",
// MIN_3 = "3m",
// MIN_4 = "4m",
// MIN_5 = "5m",
// MIN_10 = "10m",
// MIN_15 = "15m",
// MIN_30 = "30m",
// MIN_45 = "45m",
// HOUR_1 = "60m",
// HOUR_2 = "120m",
// HOUR_3 = "180m",
// HOUR_4 = "240m",

async function allTimeFrameCandles() {
	// Combined all time frame candles
	const historical = await dhanClient.marketData.getProcessedCandleData({
		exchangeSegment: ExchangeSegmentText.NSE_EQ,
		expiryCode: 0,
		instrument: InstrumentToken.EQUITY,
		interval: TimeInterval.MIN_10,
		securityId: "1235",
		// daysAgo: 0,
		from: "2024-12-10",
		to: "2024-12-10",
		// isFree: true,
	});

	console.log("last 5 Close", historical.close.slice(-3));
	console.log("time frame", historical.timestamp.slice(-3));
	console.log(
		"time frame",
		historical.timestamp.slice(-3).map((time: number) => new Date(time * 1000).toLocaleTimeString())
	);
}
async function runComprehensiveDemo() {
	try {
		// await demoOrders();
		// await demoPortfolio();
		// await demoFunds();
		// await demoEDIS();
		// await demoMarketData();
		// await allTimeFrameCandles();
		// await demoForeverOrders();
		// await demoTradersControl();
		// await demoStatements();
		await demoLiveFeed();
		// await demoLiveOrderUpdate();
		// await demoLiveFeedMock();
	} catch (error) {
		console.error("Error in demo:", error);
	}
}

runComprehensiveDemo();
