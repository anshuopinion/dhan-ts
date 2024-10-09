import {
  DhanHqClient,
  DhanEnv,
  OrderRequest,
  ForeverOrderRequest,
  TransactionType,
  ExchangeSegment,
  ProductType,
  OrderType,
  Validity,
  OrderFlag,
  LiveOrderUpdate,
  KillSwitchStatus,
  LiveOrderUpdateConfig,
  DhanFeed,
} from "../src/index";

async function demo() {
  const config: LiveOrderUpdateConfig = {
    accessToken: "YOUR_ACCESS_TOKEN",
    env: DhanEnv.PROD,
    clientId: "YOUR_CLIENT_ID",
    onConnect: () => console.log("Live Order Update connected"),
    onDisconnect: (code, reason) =>
      console.log(`Live Order Update disconnected: ${code} - ${reason}`),
    onError: (error: Error) => console.error("Live Order Update error:", error),
    onOrderUpdate: (update: LiveOrderUpdate) =>
      console.log("Order Update:", update),
  };

  const client = new DhanHqClient(config);
  const dhanFeed = new DhanFeed(config);

  try {
    // REST API examples
    console.log("--- REST API Examples ---");

    // Get holdings
    const holdings = await client.portfolio.getHoldings();
    console.log("Holdings:", holdings);

    // Get fund limits
    const fundLimits = await client.funds.getFundLimit();
    console.log("Fund Limits:", fundLimits);

    // Place an order
    const orderRequest: OrderRequest = {
      dhanClientId: config.clientId,
      transactionType: TransactionType.BUY,
      exchangeSegment: ExchangeSegment.NSE_EQ,
      productType: ProductType.INTRADAY,
      orderType: OrderType.LIMIT,
      validity: Validity.DAY,
      securityId: "1333", // Example security ID for HDFC Bank
      quantity: 1,
      price: 1500,
      disclosedQuantity: 0,
      afterMarketOrder: false,
    };

    const orderResponse = await client.orders.placeOrder(orderRequest);
    console.log("Order placed:", orderResponse);

    // Get all orders
    const allOrders = await client.orders.getOrders();
    console.log("All orders:", allOrders);

    // Create a Forever Order
    const foreverOrderRequest: ForeverOrderRequest = {
      dhanClientId: config.clientId,
      orderFlag: OrderFlag.SINGLE,
      transactionType: TransactionType.BUY,
      exchangeSegment: ExchangeSegment.NSE_EQ,
      productType: ProductType.CNC,
      orderType: OrderType.LIMIT,
      validity: Validity.DAY,
      securityId: "1333",
      quantity: 1,
      price: 1500,
      triggerPrice: 1495,
      disclosedQuantity: 0,
    };

    const foreverOrderResponse = await client.foreverOrders.createForeverOrder(
      foreverOrderRequest
    );
    console.log("Forever Order placed:", foreverOrderResponse);

    // Get ledger report
    const fromDate = "2023-01-01";
    const toDate = "2023-12-31";
    const ledgerReport = await client.statements.getLedgerReport(
      fromDate,
      toDate
    );
    console.log("Ledger Report:", ledgerReport);

    // WebSocket examples
    console.log("--- WebSocket Examples ---");

    // Connect to Live Feed
    dhanFeed.liveFeed.connect();
    dhanFeed.liveFeed.on("data", (data) => {
      console.log("Received market data:", data);
    });

    // Subscribe to HDFC Bank ticker data
    dhanFeed.liveFeed.subscribe([[ExchangeSegment.NSE_EQ, "1333"]], 15);

    // Connect to Live Order Update
    dhanFeed.liveOrderUpdate.connect();

    // Activate Kill Switch (be careful with this in a real scenario)
    const killSwitchResponse = await client.tradersControl.setKillSwitch(
      KillSwitchStatus.ACTIVATE
    );
    console.log("Kill Switch Activated:", killSwitchResponse);

    // Wait for some time to receive updates
    console.log("Waiting for 30 seconds to receive updates...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Disconnect WebSocket connections
    dhanFeed.liveFeed.close();
    dhanFeed.liveOrderUpdate.disconnect();

    // Deactivate Kill Switch
    const deactivateKillSwitchResponse =
      await client.tradersControl.setKillSwitch(KillSwitchStatus.DEACTIVATE);
    console.log("Kill Switch Deactivated:", deactivateKillSwitchResponse);
  } catch (error) {
    console.error("Error:", error);
  }
}

demo();
