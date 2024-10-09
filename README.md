# dhan-ts

A TypeScript client library for the Dhan API v2. This library provides a simple and intuitive way to interact with the Dhan trading platform, allowing you to place orders, manage your portfolio, retrieve market data, and more.

## Installation

Install the package using npm:

```bash
npm install dhan-ts
```

Or using yarn:

```bash
yarn add dhan-ts
```

## Usage

First, import the `DhanClient` and necessary types from the library:

```typescript
import {
  DhanClient,
  DhanEnv,
  OrderRequest,
  TransactionType,
  ExchangeSegment,
  ProductType,
  OrderType,
  Validity,
} from "dhan-ts";
```

Then, create a new instance of the DhanClient:

```typescript
const client = new DhanClient({
  accessToken: "YOUR_ACCESS_TOKEN",
  env: DhanEnv.PROD,
  clientId: "YOUR_CLIENT_ID",
  onConnect: () => console.log("Live Order Update connected"),
  onDisconnect: (code, reason) =>
    console.log(`Live Order Update disconnected: ${code} - ${reason}`),
  onError: (error) => console.error("Live Order Update error:", error),
  onOrderUpdate: (update) => console.log("Order Update:", update),
});
```

### Placing an Order

```typescript
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

const orderResponse = await client.orders.placeOrder(orderRequest);
console.log("Order placed:", orderResponse);
```

### Getting Portfolio Holdings

```typescript
const holdings = await client.portfolio.getHoldings();
console.log("Holdings:", holdings);
```

### Retrieving Market Data

```typescript
const marketData = await client.marketData.getQuote({
  NSE_EQ: ["1333"], // Example security ID for HDFC Bank
});
console.log("Market Data:", marketData);
```

## Available Modules

- `orders`: Place, modify, and cancel orders
- `portfolio`: Retrieve holdings and positions
- `funds`: Get fund limits and calculate margins
- `edis`: Handle EDIS operations
- `marketData`: Retrieve market data and historical charts
- `liveFeed`: Subscribe to live market data feeds
- `foreverOrders`: Manage Forever Orders (Good Till Triggered orders)
- `tradersControl`: Access trader control features like Kill Switch
- `statements`: Retrieve ledger reports and trade history
- `liveOrderUpdate`: Receive real-time order updates

## Configuration Options

When creating a new `DhanClient` instance, you can provide the following configuration options:

- `accessToken` (required): Your Dhan API access token
- `env` (required): The environment to use (`DhanEnv.PROD` or `DhanEnv.SANDBOX`)
- `clientId` (required): Your Dhan client ID
- `onConnect` (optional): Callback function when Live Order Update connects
- `onDisconnect` (optional): Callback function when Live Order Update disconnects
- `onError` (optional): Callback function for Live Order Update errors
- `onOrderUpdate` (optional): Callback function for receiving order updates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
