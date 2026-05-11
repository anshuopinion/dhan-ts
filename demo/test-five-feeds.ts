import {DhanConfig, DhanEnv} from "../src/types";
import {demoFourLiveFeeds} from "./live-feeds";
import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.resolve(__dirname, ".env")});

const config: DhanConfig = {
	accessToken: process.env.ACCESS_TOKEN!,
	clientId: process.env.DHAN_CLIENT_ID!,
	env: DhanEnv.PROD,
	webAccess: process.env.WEB_ACCCES_TOKEN,
};

demoFourLiveFeeds(config).catch((err: any) => {
	console.error("Top-level error:", err);
	process.exit(1);
});
