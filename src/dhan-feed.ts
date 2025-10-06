import {DhanConfig} from "./types";
import {LiveFeed} from "./modules/live-feed";
import {LiveOrderUpdateManager} from "./modules/live-order-update";
import {MockLiveFeed} from "./modules/mock-live-feed";
import {MultiConnectionLiveFeed} from "./modules/multi-connection-live-feed";
import {MockMultiConnectionLiveFeed} from "./modules/mock-multi-connection-live-feed";
import {MarketDepthFeed} from "./modules/market-depth-feed";

export class DhanFeed {
	public readonly liveFeed: LiveFeed;
	public readonly mockLiveFeed: MockLiveFeed;
	public readonly liveOrderUpdate: LiveOrderUpdateManager;
	public readonly multiConnectionLiveFeed: MultiConnectionLiveFeed;
	public readonly mockMultiConnectionLiveFeed: MockMultiConnectionLiveFeed;
	public readonly marketDepthFeed20: MarketDepthFeed;
	public readonly marketDepthFeed200: MarketDepthFeed;

	constructor(config: DhanConfig) {
		this.liveFeed = new LiveFeed(config);
		this.liveOrderUpdate = new LiveOrderUpdateManager(config);
		this.mockLiveFeed = new MockLiveFeed(config);
		this.multiConnectionLiveFeed = new MultiConnectionLiveFeed(config);
		this.mockMultiConnectionLiveFeed = new MockMultiConnectionLiveFeed(config);
		this.marketDepthFeed20 = new MarketDepthFeed(config, 20);
		this.marketDepthFeed200 = new MarketDepthFeed(config, 200);
	}
}
