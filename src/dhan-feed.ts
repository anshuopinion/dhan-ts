import { DhanConfig } from "./types";
import { LiveFeed } from "./modules/live-feed";
import { LiveOrderUpdateManager } from "./modules/live-order-update";

export class DhanFeed {
  public readonly liveFeed: LiveFeed;
  public readonly liveOrderUpdate: LiveOrderUpdateManager;

  constructor(config: DhanConfig) {
    this.liveFeed = new LiveFeed(config);
    this.liveOrderUpdate = new LiveOrderUpdateManager(config);
  }
}
