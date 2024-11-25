# dhan-ts

A robust TypeScript client library for the Dhan API v2, providing a seamless interface to interact with the Dhan trading platform. This library enables developers to easily integrate trading functionalities, manage portfolios, access market data, and more.

## Features

- Simple and intuitive API interface
- Comprehensive coverage of Dhan API v2 endpoints
- TypeScript support for better type safety and developer experience
- Real-time market data and order updates via WebSocket
- Mock live feed support for testing and development
- Support for various order types and exchange segments
- Extensive portfolio management capabilities
- Live order update tracking

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Detailed Usage](#detailed-usage)
  - [Authentication](#authentication)
  - [Orders](#orders)
  - [Portfolio](#portfolio)
  - [Market Data](#market-data)
  - [Live Feed](#live-feed)
  - [Mock Live Feed](#mock-live-feed)
  - [Live Order Updates](#live-order-updates)
  - [Funds](#funds)
  - [EDIS](#edis)
  - [Forever Orders](#forever-orders)
  - [Traders Control](#traders-control)
  - [Statements](#statements)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

## Official Documentation

- [Dhan API v2 Documentation](https://dhan.co/docs/api-v2)

## Installation

Install the package using npm:

```bash
npm install dhan-ts
```

Or using yarn:

```bash
yarn add dhan-ts
```

## Quick Start

Here's a quick example to get you started:

```typescript
import {
  DhanHqClient,
  DhanConfig,
  DhanEnv,
  TransactionType,
  ExchangeSegment,
  ProductType,
  OrderType,
  Validity,
} from "dhan-ts";

// Initialize the client
const config: DhanConfig = {
  accessToken: "YOUR_ACCESS_TOKEN",
  clientId: "YOUR_CLIENT_ID",
  env: DhanEnv.PROD,
};

const client = new DhanHqClient(config);

// Place an order
async function placeOrder() {
  const orderRequest = {
    dhanClientId: config.clientId,
    transactionType: TransactionType.BUY,
    exchangeSegment: ExchangeSegment.NSE_EQ,
    productType: ProductType.INTRADAY,
    orderType: OrderType.LIMIT,
    validity: Validity.DAY,
    securityId: "9362", // Example security ID
    quantity: 1,
    price: 1500,
    disclosedQuantity: 0,
    afterMarketOrder: false,
  };

  try {
    const orderResponse = await client.orders.placeOrder(orderRequest);
    console.log("Order placed:", orderResponse);
  } catch (error) {
    console.error("Error placing order:", error);
  }
}
```

## Detailed Usage

### Authentication

Initialize the client with your configuration:

```typescript
const config: DhanConfig = {
  accessToken: "YOUR_ACCESS_TOKEN",
  clientId: "YOUR_CLIENT_ID",
  env: DhanEnv.PROD,
};

const client = new DhanHqClient(config);
```

### Orders

```typescript
// Place an order
const orderResponse = await client.orders.placeOrder(orderRequest);

// Get all orders
const allOrders = await client.orders.getOrders();

// Get order by ID
const order = await client.orders.getOrderById("ORDER_ID");

// Get order by correlation ID
const orderByCorrelationId = await client.orders.getOrderByCorrelationId(
  "CORRELATION_ID"
);

// Modify an order
const modifiedOrder = await client.orders.modifyOrder("ORDER_ID", {
  dhanClientId: config.clientId,
  orderType: OrderType.LIMIT,
  quantity: 1,
  price: 1550,
  disclosedQuantity: 0,
  validity: Validity.DAY,
});

// Cancel an order
const cancelledOrder = await client.orders.cancelOrder("ORDER_ID");

// Get trades
const trades = await client.orders.getTrades();

// Get trades by order ID
const tradesByOrderId = await client.orders.getTradesByOrderId("ORDER_ID");
```

### Portfolio

```typescript
// Get holdings
const holdings = await client.portfolio.getHoldings();

// Get positions
const positions = await client.portfolio.getPositions();
```

### Market Data

```typescript
// Get LTP (Last Traded Price)
const ltp = await client.marketData.getLTP({
  NSE_EQ: ["9362"],
});

// Get OHLC
const ohlc = await client.marketData.getOHLC({
  NSE_EQ: ["9362"],
});

// Get full quote
const quote = await client.marketData.getQuote({
  NSE_EQ: ["9362"],
});

// Get historical daily data
const historical = await client.marketData.getDailyHistoricalData({
  securityId: "9362",
  exchangeSegment: ExchangeSegmentText.NSE_EQ,
  instrument: InstrumentToken.EQUITY,
  toDate: "2024-10-04",
  fromDate: "2024-09-01",
});

// Get intraday historical data
const intraday = await client.marketData.getIntradayHistoricalData({
  securityId: "9362",
  exchangeSegment: ExchangeSegmentText.NSE_EQ,
  instrument: InstrumentToken.EQUITY,
  interval: "5",
  toDate: "2024-10-04",
  fromDate: "2024-10-01",
});
```

### Live Feed

```typescript
import {
  DhanFeed,
  Instrument,
  ExchangeSegment,
  FeedRequestCode,
} from "dhan-ts";

const feed = new DhanFeed(config);

// Connect to live feed
await feed.liveFeed.connect();

// Subscribe to instruments
const instruments: Instrument[] = [[ExchangeSegment.NSE_EQ, "9362"]];

feed.liveFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_FULL);

// Listen for data
feed.liveFeed.on("data", (data) => {
  console.log("Received live feed data:", data);
});

// Handle errors
feed.liveFeed.on("error", (error) => {
  console.error("LiveFeed error:", error);
});
```

### Mock Live Feed

```typescript
// Configure mock feed with security configs
feed.mockLiveFeed.setSecurityConfigs({
  "9362": {
    minPrice: 2300,
    maxPrice: 2450,
    volatility: 0.3,
  },
});

// Connect to mock feed
await feed.mockLiveFeed.connect();

// Set custom market hours if needed
feed.mockLiveFeed.setMarketHours({
  start: "09:15",
  end: "15:30",
  days: [1, 2, 3, 4, 5], // Monday to Friday
});

// Subscribe and handle data
feed.mockLiveFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_TICKER);

feed.mockLiveFeed.on("data", (data) => {
  console.log("Received mock feed data:", data);
});
```

### Live Order Updates

```typescript
// Set up order update listener
feed.liveOrderUpdate.on("orderUpdate", (update) => {
  console.log("Received order update:", update);
});

feed.liveOrderUpdate.on("authenticated", () => {
  console.log("Successfully authenticated");
});

feed.liveOrderUpdate.on("error", (error) => {
  console.error("Live order update error:", error);
});

// Connect to order updates
await feed.liveOrderUpdate.connect();
```

### Funds

```typescript
// Get fund limits
const fundLimits = await client.funds.getFundLimit();

// Calculate margin
const marginCalculation = await client.funds.calculateMargin({
  dhanClientId: config.clientId,
  exchangeSegment: ExchangeSegment.NSE_EQ,
  transactionType: TransactionType.BUY,
  quantity: 1,
  productType: ProductType.CNC,
  securityId: "9362",
  price: 1500,
});
```

### EDIS

```typescript
// Generate TPIN
await client.edis.generateTpin();

// Generate EDIS form
const edisForm = await client.edis.generateEdisForm({
  isin: "INE040A01034",
  qty: 1,
  exchange: "NSE",
  segment: "E",
  bulk: false,
});

// Check EDIS status
const edisStatus = await client.edis.inquireEdisStatus("INE040A01034");
```

### Forever Orders

```typescript
// Create forever order
const foreverOrder = await client.foreverOrders.createForeverOrder({
  dhanClientId: config.clientId,
  orderFlag: OrderFlag.SINGLE,
  transactionType: TransactionType.BUY,
  exchangeSegment: ExchangeSegment.NSE_EQ,
  productType: ProductType.CNC,
  orderType: OrderType.LIMIT,
  validity: Validity.DAY,
  securityId: "9362",
  quantity: 1,
  price: 1500,
  triggerPrice: 1490,
});

// Get all forever orders
const allForeverOrders = await client.foreverOrders.getAllForeverOrders();
```

### Traders Control

```typescript
// Set kill switch
const killSwitchResponse = await client.tradersControl.setKillSwitch(
  KillSwitchStatus.ACTIVATE
);
```

### Statements

```typescript
// Get ledger report
const ledgerReport = await client.statements.getLedgerReport(
  "2024-01-01",
  "2024-01-31"
);

// Get trade history
const tradeHistory = await client.statements.getTradeHistory(
  "2024-01-01",
  "2024-01-31"
);
```

## Error Handling

The library uses promise-based APIs, so use try-catch blocks to handle errors:

```typescript
try {
  const order = await client.orders.placeOrder(orderRequest);
} catch (error) {
  if (error instanceof DhanError) {
    console.error("Dhan API error:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Best Practices

1. Always handle errors with proper error logging and fallback mechanisms
2. Use environment variables for sensitive information (access tokens, client IDs)
3. Implement rate limiting to avoid API throttling
4. Utilize TypeScript types for better code reliability
5. Close WebSocket connections when they're no longer needed
6. Keep your access tokens secure and never expose them in client-side code
7. Use mock live feed for testing and development purposes
8. Implement proper error recovery for WebSocket disconnections
9. Monitor order updates for critical trading operations
10. Regular validation of market data integrity

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
