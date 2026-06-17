# Previous Close Data on Dhan Live Feed — Findings

## TL;DR

| Subscription | Standalone `prev_close` packet (code 6) | Prev close field |
|---|---|---|
| `SUBSCRIBE_TICKER` (15) | **Yes** — 1 packet | `data.previousClosePrice` |
| `SUBSCRIBE_QUOTE`  (17) | **No** | `data.closePrice` (inside each quote tick) |
| `SUBSCRIBE_FULL`   (21) | **No** | `data.closePrice` (inside each full tick) |

Tested live against NSE_EQ securityId `14043` (Reliance) on 2026-05-14. Prev close = ₹96.93 in all three modes (consistent value, different delivery channel).

## How to consume prev close

### Plain `liveFeed` (single connection)

```ts
dhanFeed.liveFeed.on("data", (data) => {
  if ("type" in data) {
    if (data.type === "prev_close") {
      // arrives only when subscribed with SUBSCRIBE_TICKER
      console.log("prev close:", data.previousClosePrice);
    } else if (data.type === "quote" || data.type === "full") {
      // prev close is bundled as closePrice on every tick
      console.log("prev close:", data.closePrice);
    }
  }
});
```

Note on type-guard: `LiveFeedResponse` is a union that includes `MarketDepthResponse` which has no `type` discriminator (see `src/types.ts:389-392`). TypeScript narrowing requires `"type" in data` first before checking `data.type`.

### `multiConnectionLiveFeed`

Same packet shapes, accessed via `"message"` or `"data"` event. See `demo/live-feeds.ts:332-335` for the existing `case "prev_close"` branch.

## Why TICKER differs

`TickerResponse` (`src/types.ts:394-400`) only carries `lastTradedPrice` + `lastTradedTime` — no close price. Server therefore pushes a separate `prev_close` packet (response code 6) once per subscribe so the client knows yesterday's close.

`QuoteResponse` (`src/types.ts:402-417`) and `FullMarketDataResponse` (`src/types.ts:439-458`) already include `closePrice` in their payloads (Dhan API quirk: `closePrice` in a live quote = **previous** day close, not today's close). So the server doesn't bother sending a separate prev_close packet.

## SDK plumbing (reference)

`src/modules/live-feed.ts` response-code dispatch:

```
case 2  → parseTickerPacket       → TickerResponse
case 4  → parseQuotePacket        → QuoteResponse
case 5  → parseOIDataPacket       → OiDataResponse
case 6  → parsePrevClosePacket    → PrevCloseResponse
case 7  → parseMarketStatusPacket → MarketStatusResponse
case 8  → parseFullPacket         → FullMarketDataResponse
case 50 → handleDisconnection
```

`parsePrevClosePacket` (`src/modules/live-feed.ts:368-376`):

```
exchangeSegment    UInt8  @ byte 3
securityId         UInt32 @ bytes 4-7
previousClosePrice Float  @ bytes 8-11
previousOpenInterest UInt32 @ bytes 12-15
```

All parsed packets emit on the same `"data"` event (`src/modules/live-feed.ts:326`).

## Caveats

- `previousOpenInterest` is `0` for equity instruments. Meaningful for F&O.
- `prev_close` for TICKER arrives **once** per subscribe — cache it client-side. Won't repeat on every tick.
- For QUOTE/FULL, `closePrice` is on every tick. Same value across ticks; safe to read once.
- Earlier docs (and SDK comments at `src/modules/live-feed.ts:717`) claim prev_close auto-sends for QUOTE and FULL too. Empirically false as of 2026-05-14. Comment is stale.

## Test methodology

Standalone ts-node runner that:
1. Connects plain `liveFeed`
2. Subscribes 1 instrument (Reliance, NSE_EQ secId 14043)
3. Logs packet `type` + relevant fields for 12s
4. Tallies packet counts before exit

Repeated for each `FeedRequestCode` (TICKER / QUOTE / FULL). Results above are direct stdout captures.

## References

- `src/modules/live-feed.ts:294-376` — parser and dispatch
- `src/types.ts:91-97` — `FeedErrorResponse`
- `src/types.ts:389-468` — packet response types + `LiveFeedResponse` union
- `demo/live-feeds.ts:25-37` — consumer example (single-feed)
- `demo/live-feeds.ts:332-335` — consumer example (multi-connection)
- `demo/test-prev-close.ts` — existing multi-connection test for all three sub types
