# dhan-ts

<div align="center">

[![npm version](https://img.shields.io/npm/v/dhan-ts.svg)](https://www.npmjs.com/package/dhan-ts)
[![npm downloads](https://img.shields.io/npm/dm/dhan-ts.svg)](https://www.npmjs.com/package/dhan-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**A comprehensive, fully-typed TypeScript/JavaScript library for Dhan's trading API v2**

Build powerful trading applications with type-safe access to 15+ API modules and real-time WebSocket feeds.

[**📚 Documentation**](https://dhan-ts.vercel.app/) • [**🚀 Getting Started**](https://dhan-ts.vercel.app/docs/getting-started) • [**📖 API Reference**](https://dhan-ts.vercel.app/docs/api-reference/orders) • [**⚡ WebSocket Feeds**](https://dhan-ts.vercel.app/docs/feeds/live-feed)

</div>

---

## ✨ Features

- **🎯 Fully Typed** - Complete TypeScript support with IntelliSense and compile-time type checking
- **⚡ Real-time Feeds** - WebSocket feeds for live market data, order updates, and market depth
- **📦 Comprehensive** - 15+ API modules covering orders, portfolio, funds, market data, options, and more
- **🛡️ Production Ready** - Battle-tested with automatic reconnection, error handling, and robust architecture
- **🧪 Testing Support** - Mock feeds for development and testing without live connections
- **🔄 Auto-Reconnection** - Built-in reconnection logic with exponential backoff for WebSocket feeds
- **📊 Market Data** - Real-time quotes, historical data, option chains with Greeks, and fundamentals

## 📦 Installation

```bash
npm install dhan-ts
```

## 🚀 Quick Start

```typescript
import { DhanHqClient, DhanFeed, DhanEnv } from "dhan-ts";

// Initialize REST API client
const client = new DhanHqClient({
  accessToken: process.env.DHAN_ACCESS_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
  env: DhanEnv.PROD,
});

// Get your fund limits
const funds = await client.funds.getFundLimit();
console.log("Available Balance:", funds.availabelBalance);

// Place an order
const order = await client.orders.placeOrder({
  dhanClientId: process.env.DHAN_CLIENT_ID!,
  transactionType: "BUY",
  exchangeSegment: "NSE_EQ",
  productType: "CNC",
  orderType: "LIMIT",
  validity: "DAY",
  securityId: "1333",
  quantity: 1,
  price: 1850.0,
  afterMarketOrder: false,
});

// Initialize WebSocket feed
const feed = new DhanFeed({
  accessToken: process.env.DHAN_ACCESS_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
  env: DhanEnv.PROD,
});

// Connect to live feed
await feed.liveFeed.connect();

// Subscribe to instruments
feed.liveFeed.subscribe([[1, "1333"]], "SUBSCRIBE_TICKER");

// Listen for updates
feed.liveFeed.on("data", (data) => {
  console.log("Price:", data.lastTradedPrice);
});
```

## 📚 Documentation

For complete documentation, visit **[dhan-ts.vercel.app](https://dhan-ts.vercel.app/)**

### Quick Links

- [**Getting Started Guide**](https://dhan-ts.vercel.app/docs/getting-started) - Installation and first API call
- [**Authentication**](https://dhan-ts.vercel.app/docs/authentication) - App-based, partner, and static IP auth
- [**Orders API**](https://dhan-ts.vercel.app/docs/api-reference/orders) - Place, modify, cancel orders
- [**Portfolio API**](https://dhan-ts.vercel.app/docs/api-reference/portfolio) - Holdings and positions
- [**Market Data API**](https://dhan-ts.vercel.app/docs/api-reference/market-data) - LTP, OHLC, historical data
- [**Live Feed**](https://dhan-ts.vercel.app/docs/feeds/live-feed) - Real-time market data WebSocket
- [**Live Order Updates**](https://dhan-ts.vercel.app/docs/feeds/live-order-update) - Real-time order status
- [**Option Chain**](https://dhan-ts.vercel.app/docs/api-reference/option-chain) - Options with Greeks and IV
- [**Mock Feeds**](https://dhan-ts.vercel.app/docs/feeds/mock-feeds) - Testing without live connections

## 🎯 API Coverage

### REST APIs (15 Modules)

Orders • Portfolio • Funds • Market Data • Super Orders • Forever Orders • Option Chain • Expired Options • Authentication • E-DIS • Statements • Traders Control • Scanner

### WebSocket Feeds (6 Types)

Live Feed • Order Updates • Market Depth (20 & 200) • Multi Connection • Mock Feeds

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [**Documentation**](https://dhan-ts.vercel.app/)
- [**npm Package**](https://www.npmjs.com/package/dhan-ts)
- [**GitHub Repository**](https://github.com/anshuopinion/dhan-ts)
- [**Report Issues**](https://github.com/anshuopinion/dhan-ts/issues)
- [**Official Dhan API**](https://dhanhq.co/docs/v2/)

---

<div align="center">

**⚠️ Disclaimer:** This is an unofficial TypeScript client for Dhan API. For official support, please contact Dhan directly.

Made with ❤️ by the community

</div>
