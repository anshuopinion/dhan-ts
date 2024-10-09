# dhan-ts

A robust TypeScript client library for the Dhan API v2, providing a seamless interface to interact with the Dhan trading platform. This library enables developers to easily integrate trading functionalities, manage portfolios, access market data, and more.

## Features

- Simple and intuitive API
- Comprehensive coverage of Dhan API v2 endpoints
- TypeScript support for better type safety and developer experience
- Real-time market data and order updates
- Support for various order types and exchange segments

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Detailed Usage](#detailed-usage)
  - [Authentication](#authentication)
  - [Orders](#orders)
  - [Portfolio](#portfolio)
  - [Market Data](#market-data)
  - [Live Feed](#live-feed)
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

## Offical Docs
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
  DhanEnv,
  OrderRequest,
  TransactionType,
  ExchangeSegment,
  ProductType,
  OrderType,
  Validity,
} from "dhan-ts";

// Initialize the client
const client = new DhanHqClient({
  accessToken: "YOUR_ACCESS_TOKEN",
  env: DhanEnv.PROD,
  clientId: "YOUR_CLIENT_ID",
});

// Place an order
async function placeOrder() {
  const orderRequest: OrderRequest = {
    dhanClientId: "YOUR_CLIENT_ID",
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

  try {
    const orderResponse = await client.orders.placeOrder(orderRequest);
    console.log("Order placed:", orderResponse);
  } catch (error) {
    console.error("Error placing order:", error);
  }
}

placeOrder();
```

## Detailed Usage

### Authentication

The `DhanHqClient` constructor requires an access token, environment, and client ID:

```typescript
const client = new DhanHqClient({
  accessToken: "YOUR_ACCESS_TOKEN",
  env: DhanEnv.PROD,
  clientId: "YOUR_CLIENT_ID",
});
```

### Orders

Place, modify, and manage orders:

```typescript
// Place an order
const orderResponse = await client.orders.placeOrder(orderRequest);

// Get all orders
const allOrders = await client.orders.getOrders();

// Get order by ID
const order = await client.orders.getOrderById("ORDER_ID");

// Modify an order
const modifiedOrder = await client.orders.modifyOrder(
  "ORDER_ID",
  modifyOrderRequest
);

// Cancel an order
const cancelledOrder = await client.orders.cancelOrder("ORDER_ID");
```

### Portfolio

Retrieve holdings and positions:

```typescript
// Get holdings
const holdings = await client.portfolio.getHoldings();

// Get positions
const positions = await client.portfolio.getPositions();
```

### Market Data

Access real-time and historical market data:

```typescript
// Get LTP (Last Traded Price)
const ltp = await client.marketData.getLTP({ NSE_EQ: ["1333"] });

// Get OHLC (Open, High, Low, Close)
const ohlc = await client.marketData.getOHLC({ NSE_EQ: ["1333"] });

// Get full quote
const quote = await client.marketData.getQuote({ NSE_EQ: ["1333"] });

// Get historical data
const historicalData = await client.marketData.getDailyHistoricalData({
  securityId: "1333",
  exchangeSegment: ExchangeSegment.NSE_EQ,
  instrument: "EQUITY",
  fromDate: "2023-01-01",
  toDate: "2023-12-31",
});
```

### Live Feed

Subscribe to real-time market data:

```typescript
import {
  DhanFeed,
  ExchangeSegment,
  Instrument,
  FeedRequestCode,
} from "dhan-ts";

const feed = new DhanFeed({
  accessToken: "YOUR_ACCESS_TOKEN",
  env: DhanEnv.PROD,
  clientId: "YOUR_CLIENT_ID",
});

await feed.liveFeed.connect();

const instruments: Instrument[] = [[ExchangeSegment.NSE_EQ, "1333"]];
feed.liveFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_FULL);

feed.liveFeed.on("data", (data) => {
  console.log("Received live feed data:", data);
});
```

### Live Order Updates

Receive real-time updates for your orders:

```typescript
import { DhanFeed, LiveOrderUpdate } from "dhan-ts";

const feed = new DhanFeed({
  accessToken: "YOUR_ACCESS_TOKEN",
  env: DhanEnv.PROD,
  clientId: "YOUR_CLIENT_ID",
  onConnect: () => console.log("Live Order Update connected"),
  onDisconnect: (code, reason) =>
    console.log(`Disconnected: ${code} - ${reason}`),
  onError: (error) => console.error("Live order update error:", error),
  onOrderUpdate: (update: LiveOrderUpdate) =>
    console.log("Order Update:", update),
});

await feed.liveOrderUpdate.connect();

// The onOrderUpdate callback will be called whenever there's an order update
```

### Funds

Manage funds and calculate margins:

```typescript
// Get fund limits
const fundLimits = await client.funds.getFundLimit();

// Calculate margin
const marginCalculation = await client.funds.calculateMargin(marginRequest);
```

### EDIS

Handle EDIS (Electronic Delivery Instruction Slip) operations:

```typescript
// Generate TPIN
await client.edis.generateTpin();

// Generate EDIS form
const edisForm = await client.edis.generateEdisForm(edisFormRequest);

// Inquire EDIS status
const edisStatus = await client.edis.inquireEdisStatus("ISIN");
```

### Forever Orders

Manage Forever Orders (Good Till Triggered orders):

```typescript
// Create a forever order
const foreverOrder = await client.foreverOrders.createForeverOrder(
  foreverOrderRequest
);

// Get all forever orders
const allForeverOrders = await client.foreverOrders.getAllForeverOrders();
```

### Traders Control

Access trader control features:

```typescript
// Set kill switch
const killSwitchResponse = await client.tradersControl.setKillSwitch(
  KillSwitchStatus.ACTIVATE
);
```

### Statements

Retrieve ledger reports and trade history:

```typescript
// Get ledger report
const ledgerReport = await client.statements.getLedgerReport(
  "2023-01-01",
  "2023-12-31"
);

// Get trade history
const tradeHistory = await client.statements.getTradeHistory(
  "2023-01-01",
  "2023-12-31"
);
```

## Error Handling

The library uses a promise-based API, so you can use try-catch blocks or .catch() methods to handle errors:

```typescript
try {
  const order = await client.orders.placeOrder(orderRequest);
} catch (error) {
  console.error("Error placing order:", error);
}
```

## Best Practices

1. Always handle errors and implement proper error logging.
2. Use environment variables to store sensitive information like access tokens.
3. Implement rate limiting to avoid hitting API limits.
4. Use TypeScript to leverage type checking and improve code quality.
5. Keep your access token and client ID secure and never expose them in client-side code.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
