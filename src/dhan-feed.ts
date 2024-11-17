import { DhanConfig } from "./types";
import { LiveFeed } from "./modules/live-feed";
import { LiveOrderUpdateManager } from "./modules/live-order-update";
import { MockLiveFeed } from "./modules/mock-live-feed";

export class DhanFeed {
  public readonly liveFeed: LiveFeed;
  public readonly mockLiveFeed: MockLiveFeed;
  public readonly liveOrderUpdate: LiveOrderUpdateManager;

  constructor(config: DhanConfig) {
    this.liveFeed = new LiveFeed(config);
    this.liveOrderUpdate = new LiveOrderUpdateManager(config);
    this.mockLiveFeed = new MockLiveFeed(config);
  }
}
