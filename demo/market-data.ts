import { DhanHqClient } from "../src";
import {
  ExchangeSegmentText,
  InstrumentToken,
  TimeInterval,
} from "../src/types";

export async function demoMarketData(dhanClient: DhanHqClient) {
  console.log("\nDemonstrating Market Data API:");
  console.log(
    "📋 Note: Market Data APIs have a rate limit of 1 request per second"
  );
  console.log(
    "📋 Up to 1000 instruments can be fetched in a single API request"
  );

  const marketFeedRequest = {
    NSE_EQ: [11536, 9362], // NSE_EQ: HDFC Bank, HDFC Ltd
    NSE_FNO: [49081, 49082], // NSE_FNO: Some derivatives
  };

  try {
    // Helper function to add delay between API calls (rate limit: 1 request per second)
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Get LTP
    console.log("\n=== Testing LTP API ===");
    // const ltp = await dhanClient.marketData.getLTP(marketFeedRequest);
    // console.log("LTP Response Status:", ltp.status);
    // console.log("LTP Data:");

    // // Display LTP data for each exchange segment
    // Object.entries(ltp.data).forEach(([exchangeSegment, instruments]) => {
    // 	console.log(`\n${exchangeSegment}:`);
    // 	Object.entries(instruments).forEach(([securityId, data]) => {
    // 		console.log(`  Security ID ${securityId}: Last Price = ₹${data.last_price}`);
    // 	});
    // });

    // // Wait 1.2 seconds to respect rate limit
    // console.log("\n⏳ Waiting 1.2 seconds to respect API rate limit...");
    // await delay(1200);

    // // Get OHLC
    // console.log("\n=== Testing OHLC API ===");
    // const ohlc = await dhanClient.marketData.getOHLC(marketFeedRequest);
    // console.log("OHLC Response Status:", ohlc.status);
    // console.log("OHLC Data:");

    // Object.entries(ohlc.data).forEach(([exchangeSegment, instruments]) => {
    // 	console.log(`\n${exchangeSegment}:`);
    // 	Object.entries(instruments).forEach(([securityId, data]) => {
    // 		console.log(`  Security ID ${securityId}:`);
    // 		console.log(`    Last Price: ₹${data.last_price}`);
    // 		console.log(`    Open: ₹${data.ohlc.open}`);
    // 		console.log(`    High: ₹${data.ohlc.high}`);
    // 		console.log(`    Low: ₹${data.ohlc.low}`);
    // 		console.log(`    Close: ₹${data.ohlc.close}`);
    // 	});
    // });

    // // Wait 1.2 seconds to respect rate limit
    // console.log("\n⏳ Waiting 1.2 seconds to respect API rate limit...");
    // await delay(1200);

    // Get Quote (Full market depth)
    console.log("\n=== Testing Quote API ===");
    const quote = await dhanClient.marketData.getQuote(marketFeedRequest);
    console.log("Quote Response Status:", quote.status);
    console.log("Quote Data:");

    Object.entries(quote.data).forEach(([exchangeSegment, instruments]) => {
      console.log(`\n${exchangeSegment}:`);
      Object.entries(instruments).forEach(([securityId, data]) => {
        console.log(`\n  Security ID ${securityId}:`);
        console.log(`    Last Price: ₹${data.last_price}`);
        console.log(`    Last Quantity: ${data.last_quantity}`);
        console.log(`    Last Trade Time: ${data.last_trade_time}`);
        console.log(`    Average Price: ₹${data.average_price}`);
        console.log(`    Volume: ${data.volume}`);
        console.log(`    Buy Quantity: ${data.buy_quantity}`);
        console.log(`    Sell Quantity: ${data.sell_quantity}`);
        console.log(
          `    Circuit Limits: ₹${data.lower_circuit_limit} - ₹${data.upper_circuit_limit}`
        );
        console.log(`    Net Change: ₹${data.net_change}`);

        // OHLC within quote
        console.log(
          `    OHLC: O:₹${data.ohlc.open} H:₹${data.ohlc.high} L:₹${data.ohlc.low} C:₹${data.ohlc.close}`
        );

        // Open Interest (for derivatives)
        if (data.oi > 0) {
          console.log(
            `    Open Interest: ${data.oi} (High: ${data.oi_day_high}, Low: ${data.oi_day_low})`
          );
        }

        // Market Depth
        console.log(`    Market Depth:`);
        console.log(`      Buy Side:`);
        data.depth.buy.slice(0, 3).forEach((level, index) => {
          if (level.price > 0) {
            console.log(
              `        Level ${index + 1}: Price ₹${level.price}, Qty ${
                level.quantity
              }, Orders ${level.orders}`
            );
          }
        });
        console.log(`      Sell Side:`);
        data.depth.sell.slice(0, 3).forEach((level, index) => {
          if (level.price > 0) {
            console.log(
              `        Level ${index + 1}: Price ₹${level.price}, Qty ${
                level.quantity
              }, Orders ${level.orders}`
            );
          }
        });
      });
    });

    console.log("\n✅ Market Data API demo completed successfully!");
  } catch (error: any) {
    console.error("❌ Error in Market Data API demo:", error.message);
    if (error.response) {
      const { status, data } = error.response;
      console.error(`Response Status: ${status}`);
      console.error("Response Data:", data);

      // Provide specific error explanations
      if (status === 429) {
        console.error(
          "💡 Rate Limit Hit: The API allows only 1 request per second for market data endpoints"
        );
      } else if (status === 401) {
        console.error(
          "💡 Authentication Failed: Please check your access token and client ID in .env file"
        );
      } else if (status === 400) {
        console.error(
          "💡 Bad Request: Check the request parameters, security IDs, and date formats"
        );
      } else if (data?.data?.["805"]) {
        console.error(
          "💡 Rate Limiting: Too many requests. Wait before making more requests."
        );
      }
    }
  }

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

  // Get Intraday Data (Candle) - Commented out as it's a different API
  // const intraday = await dhanClient.marketData.getIntradayHistoricalData({
  //	securityId: "1235",
  //	exchangeSegment: ExchangeSegmentText.NSE_EQ,
  //	instrument: InstrumentToken.EQUITY,
  //	interval: "2",
  //	toDate: "2024-12-10",
  //	fromDate: "2024-12-10",
  // });
  // console.log("last 5 Hlose", intraday.close.slice(-3));
  // console.log("time frame", intraday.timestamp.slice(-3));
  // console.log(
  //	"time frame",
  //	intraday.timestamp.slice(-3).map((time: number) => new Date(time * 1000).toLocaleTimeString())
  // );
}

export async function allTimeFrameCandles(dhanClient: DhanHqClient) {
  // Combined all time frame candles
  const yesterdayData = await dhanClient.marketData.getProcessedCandleData({
    exchangeSegment: ExchangeSegmentText.NSE_EQ,
    instrument: InstrumentToken.EQUITY,
    expiryCode: 0,
    interval: TimeInterval.MIN_1,
    daysAgo: 1,
    symbol: "TCS",
    securityId: "11536",
    to: "2025-10-06",
    isFree: false,
    webAccess: process.env.WEB_ACCCES_TOKEN!,
  });

  if (yesterdayData.close.length > 0) {
    const lastClose = yesterdayData.close[yesterdayData.close.length - 2];
    console.log("Last Close", lastClose);
  }
}
