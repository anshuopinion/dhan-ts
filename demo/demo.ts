import { DhanHqClient, DhanFeed } from "../src";
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

  // const placedOrder = await dhanClient.orders.placeOrder(orderRequest);
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

async function demoMarketData() {
  console.log("\nDemonstrating Market Data API:");

  const marketFeedRequest = {
    NSE_EQ: [9362],
  };

  // Get LTP
  const ltp = await dhanClient.marketData.getLTP(marketFeedRequest);
  console.log("LTP:", ltp.data);

  // Get OHLC
  const ohlc = await dhanClient.marketData.getOHLC(marketFeedRequest);
  console.log("OHLC:", ohlc.data.NSE_EQ);

  // Get Quote
  const quote = await dhanClient.marketData.getQuote(marketFeedRequest);
  console.log("Quote:", quote.data.NSE_EQ);

  // Get Historical Data (Candle)

  const historical = await dhanClient.marketData.getDailyHistoricalData({
    securityId: "19913",
    exchangeSegment: ExchangeSegmentText.NSE_EQ,
    instrument: InstrumentToken.EQUITY,
    toDate: "2024-10-04",
    fromDate: "2024-09-01",
    expiryCode: 0,
  });
  console.log("Historical Data:", historical);

  // Get Intraday Data (Candle)
  const intraday = await dhanClient.marketData.getIntradayHistoricalData({
    securityId: "19913",
    exchangeSegment: ExchangeSegmentText.NSE_EQ,
    instrument: InstrumentToken.EQUITY,
    interval: "1",
    toDate: "2024-10-04",
    fromDate: "2024-10-01",
  });
  console.log("Intraday Data:", intraday);
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
  const foreverOrder = await dhanClient.foreverOrders.createForeverOrder(
    foreverOrderRequest
  );
  console.log("Created forever order:", foreverOrder);

  // Get all forever orders
  const allForeverOrders = await dhanClient.foreverOrders.getAllForeverOrders();
  console.log("All forever orders:", allForeverOrders);
}

async function demoTradersControl() {
  console.log("\nDemonstrating Traders Control API:");

  // Set kill switch
  const killSwitchResponse = await dhanClient.tradersControl.setKillSwitch(
    KillSwitchStatus.ACTIVATE
  );
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

  await dhanFeed.liveFeed.connect();
  console.log("WebSocket connection established");
  const instruments: Instrument[] = [[ExchangeSegment.NSE_EQ, "7508"]]; // HDFC Bank
  dhanFeed.liveFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_FULL);
  console.log("Subscribed to live feed");

  dhanFeed.liveFeed.on("data", (data) => {
    console.log("Received live feed data:", data);
  });

  // Keep the connection open for 30 seconds
  await new Promise((resolve) => setTimeout(resolve, 30000));
  dhanFeed.liveFeed.close();
}

async function demoLiveOrderUpdate() {
  // Not working for me
  console.log("\nDemonstrating Live Order Update:");

  try {
    await dhanFeed.liveOrderUpdate.connect();
    console.log("WebSocket connection established for live order updates");

    dhanFeed.liveOrderUpdate.on("orderUpdate", (update) => {
      console.log("Received order update:", update);
    });

    dhanFeed.liveOrderUpdate.on("authenticated", () => {
      console.log("Successfully authenticated with the order update service");
    });

    dhanFeed.liveOrderUpdate.on("authError", (error) => {
      console.error("Authentication failed:", error.message);
    });

    dhanFeed.liveOrderUpdate.on("disconnected", ({ code, reason }) => {
      console.log(`Disconnected: ${code} - ${reason}`);
    });

    dhanFeed.liveOrderUpdate.on("error", (error) => {
      console.error("Live order update error:", error);
    });

    console.log("Listening for order updates...");

    // Keep the connection open for 30 seconds
    await new Promise((resolve) => setTimeout(resolve, 30000));
  } catch (error) {
    console.error("Error in live order update demo:", error);
  } finally {
    dhanFeed.liveOrderUpdate.disconnect();
    console.log("Disconnected from live order updates");
  }
}

async function allTimeFrameCandles() {
  // Combined all time frame candles
  const historical = await dhanClient.marketData.getProcessedCandleData({
    exchangeSegment: ExchangeSegmentText.NSE_EQ,
    instrument: InstrumentToken.EQUITY,
    interval: TimeInterval.HOUR_1,
    expiryCode: 0,
    daysAgo: 2,
    // to: "2024-10-16",
    // from: "2023-06-11",
    securityId: "19913",
  });

  console.log("Historical Data:", historical);
}

async function runComprehensiveDemo() {
  try {
    // await demoOrders();
    // await demoPortfolio();
    // await demoFunds();
    // await demoEDIS();
    // await demoMarketData();
    // await demoForeverOrders();
    // await demoTradersControl();
    // await demoStatements();
    // await demoLiveFeed();
    // await demoLiveOrderUpdate();
    await allTimeFrameCandles();
  } catch (error) {
    console.error("Error in demo:", error);
  }
}

runComprehensiveDemo();
