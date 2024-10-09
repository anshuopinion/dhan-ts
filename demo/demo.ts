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
  const orderRequest = {
    dhanClientId: config.clientId,
    transactionType: TransactionType.BUY,
    exchangeSegment: ExchangeSegment.NSE_EQ,
    productType: ProductType.CNC,
    orderType: OrderType.LIMIT,
    validity: Validity.DAY,
    securityId: "1333", // HDFC Bank
    quantity: 1,
    price: 1500,
    disclosedQuantity: 0,
    afterMarketOrder: false,
  };

  const placedOrder = await dhanClient.orders.placeOrder(orderRequest);
  console.log("Placed order:", placedOrder);

  // Get all orders
  const allOrders = await dhanClient.orders.getOrders();
  console.log("All orders:", allOrders);

  // Get order by ID
  if (allOrders.length > 0) {
    const orderById = await dhanClient.orders.getOrderById(
      allOrders[0].orderId
    );
    console.log("Order by ID:", orderById);
  }
}

async function demoPortfolio() {
  console.log("\nDemonstrating Portfolio API:");

  // Get holdings
  const holdings = await dhanClient.portfolio.getHoldings();
  console.log("Holdings:", holdings);

  // Get positions
  const positions = await dhanClient.portfolio.getPositions();
  console.log("Positions:", positions);
}

async function demoFunds() {
  console.log("\nDemonstrating Funds API:");

  // Get fund limits
  const fundLimits = await dhanClient.funds.getFundLimit();
  console.log("Fund limits:", fundLimits);

  // Calculate margin
  const marginRequest = {
    dhanClientId: config.clientId,
    exchangeSegment: ExchangeSegment.NSE_EQ,
    transactionType: TransactionType.BUY,
    quantity: 1,
    productType: ProductType.CNC,
    securityId: "1333", // HDFC Bank
    price: 1500,
  };
  const marginCalculation = await dhanClient.funds.calculateMargin(
    marginRequest
  );
  console.log("Margin calculation:", marginCalculation);
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
    NSE_EQ: [11536],
  };

  // // Get LTP
  // const ltp = await dhanClient.marketData.getLTP(marketFeedRequest);
  // console.log("LTP:", ltp.data);

  // // Get OHLC
  // const ohlc = await dhanClient.marketData.getOHLC(marketFeedRequest);
  // console.log("OHLC:", ohlc.data.NSE_EQ);

  // Get Quote
  // const quote = await dhanClient.marketData.getQuote(marketFeedRequest);
  // console.log("Quote:", quote.data.NSE_EQ);

  // Get Historical Data
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

  // Get ledger report
  const ledgerReport = await dhanClient.statements.getLedgerReport(
    "2023-01-01",
    "2023-04-01"
  );
  console.log("Ledger report:", ledgerReport);

  // Get trade history
  const tradeHistory = await dhanClient.statements.getTradeHistory(
    "2023-01-01",
    "2023-04-01"
  );
  console.log("Trade history:", tradeHistory);
}

async function demoLiveFeed() {
  console.log("\nDemonstrating Live Feed:");

  await dhanFeed.liveFeed.connect();
  console.log("WebSocket connection established");
  const instruments: Instrument[] = [[ExchangeSegment.NSE_EQ, "7508"]]; // HDFC Bank
  dhanFeed.liveFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_TICKER);
  console.log("Subscribed to live feed");

  dhanFeed.liveFeed.on("data", (data) => {
    console.log("Received live feed data:", data);
  });

  // Keep the connection open for 30 seconds
  await new Promise((resolve) => setTimeout(resolve, 30000));
  dhanFeed.liveFeed.close();
}

async function demoLiveOrderUpdate() {
  console.log("\nDemonstrating Live Order Update:");

  dhanFeed.liveOrderUpdate.connect();
  console.log("Connected to live order updates");

  // Keep the connection open for 30 seconds
  await new Promise((resolve) => setTimeout(resolve, 30000));
  dhanFeed.liveOrderUpdate.disconnect();
}

async function runComprehensiveDemo() {
  try {
    // await demoOrders();
    // await demoPortfolio();
    // await demoFunds();
    // await demoEDIS();
    await demoMarketData();
    // await demoForeverOrders();
    // await demoTradersControl();
    // await demoStatements();
    // await demoLiveFeed();
    // await demoLiveOrderUpdate();
  } catch (error) {
    console.error("Error in demo:", error);
  }
}

runComprehensiveDemo();
