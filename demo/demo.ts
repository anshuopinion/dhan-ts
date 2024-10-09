import { LiveFeed } from "../src/modules/live-feed";
import {
  DhanConfig,
  Instrument,
  ExchangeSegment,
  DhanEnv,
  FeedRequestCode,
} from "../src/types";
import dotenv from "dotenv";

dotenv.config();

const config: DhanConfig = {
  accessToken: process.env.ACCESS_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
  env: DhanEnv.PROD,
};

const liveFeed = new LiveFeed(config);

async function runDemo() {
  try {
    await liveFeed.connect();
    console.log("WebSocket connection established");

    const instruments: Instrument[] = [
      [ExchangeSegment.NSE_EQ, "1333"], // HDFC Bank
    ];

    liveFeed.subscribe(instruments, FeedRequestCode.SUBSCRIBE_TICKER);
    console.log("Subscription message sent");

    liveFeed.on("data", (data) => {
      console.log("Received data:", data);
    });

    liveFeed.on("disconnected", (data) => {
      console.log("Disconnected:", data);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

runDemo();

// Keep the process running and handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Closing connection...");
  liveFeed.close();
  process.exit();
});
