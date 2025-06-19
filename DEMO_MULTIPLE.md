# Multi-Connection Live Feed Demo

This demo demonstrates how to test the multi-connection live feed functionality with multiple instruments loaded from the scanner instruments file.

## Overview

The demo:
1. Loads instruments from `scanner.instruments.json`
2. Extracts `secId` from each instrument
3. Converts them to proper Dhan `Instrument` format `[ExchangeSegment, securityId]`
4. Tests both Mock and Live multi-connection feeds
5. Subscribes to different types of market data (Ticker, Quote, Full)
6. Displays real-time statistics and performance metrics

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Dhan credentials:

```env
ACCESS_TOKEN=your_access_token_here
DHAN_CLIENT_ID=your_client_id_here
DHAN_ENV=PROD
```

**Note:** For testing purposes, you can run the demo in mock mode without real credentials.

### 3. Ensure Scanner Data

Make sure `demo/scanner.instruments.json` contains your instrument data in the format:

```json
[
  {
    "_id": {"$oid": "..."},
    "secId": "10",
    "symbol": "ABAN",
    "custom": "Aban Offshore",
    "nameOfCompany": "ABAN OFFSHORE LTD.",
    "__v": 0,
    "createdAt": {"$date": "..."},
    "updatedAt": {"$date": "..."}
  }
]
```

## Running the Demo

### Mock Mode (Default - No API credentials required)

```bash
npm run demo:multiple
```

This runs the demo with:
- Mock feed (simulated data)
- Maximum 500 instruments
- All subscription types (Ticker, Quote, Full)

### Live Mode (Requires API credentials)

```bash
npm run demo:multiple:live
```

This connects to the real Dhan live feed.

### Custom Configuration

You can customize the demo with command line arguments:

```bash
# Run with different maximum instruments
npm run demo:multiple -- --max=1000

# Run live mode with custom limit
npm run demo:multiple:live -- --max=250
```

## Demo Features

### 1. Instrument Loading
- Loads instruments from `scanner.instruments.json`
- Converts `secId` to Dhan `Instrument` format
- Handles errors gracefully for invalid instruments

### 2. Multi-Connection Management
- Automatically distributes instruments across multiple connections
- Respects Dhan's limits (5000 instruments per connection, 100 per message)
- Creates up to 5 concurrent connections

### 3. Subscription Types
The demo tests three types of market data subscriptions:

- **Ticker Data (`FeedRequestCode.SUBSCRIBE_TICKER`)**: Basic price and time
- **Quote Data (`FeedRequestCode.SUBSCRIBE_QUOTE`)**: Extended market data
- **Full Market Data (`FeedRequestCode.SUBSCRIBE_FULL`)**: Complete market depth

### 4. Real-time Statistics
Displays comprehensive statistics every 10 seconds:
- Runtime duration
- Message counts by type
- Message rate (messages per second)
- Connection status
- Error tracking

### 5. Mock Features (Mock Mode Only)
- Realistic price simulation with volatility
- Market event simulation (high volume, price spikes, crashes)
- Configurable market data generation

## Expected Output

### Startup
```
🚀 Starting Multi-Connection Live Feed Demo
📊 Mode: MOCK Feed
🎯 Max Instruments: 500
⚙️  Config: PROD environment

📁 Loaded 33584 instruments from scanner.instruments.json
🔄 Converted 500 instruments for live feed

🎯 Testing different subscription types:
📈 Ticker batch: 167 instruments
📊 Quote batch: 167 instruments
📋 Full batch: 166 instruments
```

### Real-time Data
```
🔗 Connection established: { connectionId: 0 }
🔔 Subscribing to TICKER data for 167 instruments...
📈 Ticker #100: 1:10 @ ₹45.23
📊 Quote #50: 1:100 | Price: ₹156.78 | Volume: 25847
📋 Full Market Data #25: 1:1008 | OHLC: 245.60/248.90/243.20/245.60
```

### Statistics Report
```
📊 === LIVE FEED STATISTICS ===
🕐 Runtime: 45.2s
📈 Ticker Messages: 1,247
📊 Quote Messages: 634
📋 Full Messages: 298
❌ Error Messages: 0
📦 Total Messages: 2,179
⚡ Message Rate: 48.20 msg/sec
🔗 Connections: 0(connected:167), 1(connected:167), 2(connected:166)
=============================
```

## Troubleshooting

### Common Issues

1. **No instruments loaded**
   - Ensure `demo/scanner.instruments.json` exists and is valid JSON
   - Check file permissions

2. **Connection errors in live mode**
   - Verify your ACCESS_TOKEN and DHAN_CLIENT_ID in `.env`
   - Check your internet connection
   - Ensure you have active Dhan API subscription

3. **TypeScript errors**
   - Run `npm run build` to check for compilation issues
   - Ensure all dependencies are installed

### Performance Tuning

- **Reduce instruments**: Use `--max=100` for lighter testing
- **Mock mode**: Use mock mode for development/testing
- **Connection limits**: The demo respects Dhan's connection limits automatically

## Code Structure

The demo is organized into several key components:

- **`MultiConnectionDemo`**: Main demo class
- **`loadInstrumentsFromFile()`**: Loads data from JSON file
- **`convertToInstruments()`**: Converts to Dhan format
- **`setupEventListeners()`**: Handles live feed events
- **`testSubscriptionTypes()`**: Tests different subscription types
- **`handleMarketData()`**: Processes incoming market data

## Integration Example

You can use this demo as a template for your own applications:

```typescript
import { MultiConnectionDemo } from './demo/demo-for-multiple';

// Create demo instance
const demo = new MultiConnectionDemo(false, 1000); // Live mode, 1000 instruments

// Run the demo
demo.run().catch(console.error);
```

## Next Steps

After running the demo successfully:

1. Modify instrument selection logic for your use case
2. Implement your own market data handling
3. Add persistence/database integration
4. Implement trading logic based on market data
5. Add monitoring and alerting

For production use, consider:
- Error recovery strategies
- Data persistence
- Rate limiting
- Connection monitoring
- Failover mechanisms
