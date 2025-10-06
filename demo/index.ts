import { DhanHqClient, DhanFeed } from "../src";
import { DhanConfig, DhanEnv } from "../src/types";
import dotenv from "dotenv";

// Import demo functions
import { demoOrders } from "./orders";
import { demoPortfolio } from "./portfolio";
import { demoFunds } from "./funds";
import { demoEDIS } from "./edis";
import { demoForeverOrders } from "./forever-orders";
import { demoTradersControl } from "./traders-control";
import { demoStatements } from "./statements";
import { demoMarketData, allTimeFrameCandles } from "./market-data";
import { demoScanner } from "./scanner";
import { demoStockBasicDetails, demoStockFundamentals } from "./stock-data";
import {
  demoLiveFeed,
  demoLiveFeedMock,
  demoLiveOrderUpdate,
  demoMultiConnectionLiveFeed,
  demoMockMultiConnectionLiveFeed,
} from "./live-feeds";

dotenv.config();

const config: DhanConfig = {
  accessToken: process.env.ACCESS_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
  env: DhanEnv.PROD,
};

const dhanClient = new DhanHqClient(config);
const dhanFeed = new DhanFeed(config);

async function runComprehensiveDemo() {
  try {
    await allTimeFrameCandles(dhanClient);
    // await demoOrders(dhanClient, config);
    // await demoPortfolio(dhanClient);
    // await demoFunds(dhanClient, config);
    // await demoEDIS(dhanClient);
    // await demoMarketData(dhanClient);
    // await demoScanner(dhanClient);
    // await demoStockBasicDetails(dhanClient);
    // await demoStockFundamentals(dhanClient);
    // await demoForeverOrders(dhanClient, config);
    // await demoTradersControl(dhanClient);
    // await demoStatements(dhanClient);
    // await demoLiveFeed(dhanFeed);
    // await demoLiveOrderUpdate(dhanFeed);
    // await demoLiveFeedMock(dhanFeed);
    // await demoMultiConnectionLiveFeed(dhanFeed);
    // await demoMockMultiConnectionLiveFeed(dhanFeed);
  } catch (error) {
    console.error("Error in demo:", error);
  }
}

runComprehensiveDemo();
