import Link from 'next/link';
import { Terminal, Zap, Package, Shield, TrendingUp, Activity, Database, Code2, ArrowRight, Github, BookOpen, Rocket } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="border-b py-16 md:py-24">
        <div className="container max-w-6xl px-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-fd-muted px-4 py-1.5 text-sm">
              <Package className="h-4 w-4" />
              <span>TypeScript Client for Dhan API v2</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold md:text-6xl lg:text-7xl">
              dhan-ts
            </h1>

            <p className="mb-8 max-w-2xl text-lg text-fd-muted-foreground md:text-xl">
              A comprehensive, fully-typed TypeScript/JavaScript library for Dhan's trading API.
              Build powerful trading applications with type-safe access to 15+ API modules and real-time WebSocket feeds.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-6 py-3 font-semibold text-fd-primary-foreground hover:bg-fd-primary/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-6 py-3 font-semibold hover:bg-fd-muted"
              >
                <BookOpen className="h-4 w-4" />
                Documentation
              </Link>

              <a
                href="https://github.com/anshuopinion/dhan-ts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-6 py-3 font-semibold hover:bg-fd-muted"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-b py-16">
        <div className="container max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Why dhan-ts?
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-fd-card p-6">
              <div className="mb-4 inline-flex rounded-lg bg-fd-primary/10 p-3">
                <Terminal className="h-6 w-6 text-fd-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fully Typed</h3>
              <p className="text-fd-muted-foreground">
                Complete TypeScript support with IntelliSense and compile-time type checking for all API endpoints
              </p>
            </div>

            <div className="rounded-lg border bg-fd-card p-6">
              <div className="mb-4 inline-flex rounded-lg bg-fd-primary/10 p-3">
                <Zap className="h-6 w-6 text-fd-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Real-time Feeds</h3>
              <p className="text-fd-muted-foreground">
                WebSocket feeds for live market data, order updates, and market depth with automatic reconnection
              </p>
            </div>

            <div className="rounded-lg border bg-fd-card p-6">
              <div className="mb-4 inline-flex rounded-lg bg-fd-primary/10 p-3">
                <Database className="h-6 w-6 text-fd-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Comprehensive</h3>
              <p className="text-fd-muted-foreground">
                15+ API modules covering orders, portfolio, funds, market data, options, and more
              </p>
            </div>

            <div className="rounded-lg border bg-fd-card p-6">
              <div className="mb-4 inline-flex rounded-lg bg-fd-primary/10 p-3">
                <Shield className="h-6 w-6 text-fd-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Production Ready</h3>
              <p className="text-fd-muted-foreground">
                Battle-tested with error handling, automatic reconnection, and comprehensive documentation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="border-b py-16">
        <div className="container max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Quick Start
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Code2 className="h-5 w-5" />
                Installation
              </h3>
              <div className="rounded-lg border bg-fd-muted/50 p-4">
                <pre className="overflow-x-auto text-sm">
                  <code>npm install dhan-ts</code>
                </pre>
              </div>

              <h3 className="mb-4 mt-8 flex items-center gap-2 text-xl font-semibold">
                <Activity className="h-5 w-5" />
                REST API Usage
              </h3>
              <div className="rounded-lg border bg-fd-muted/50 p-4">
                <pre className="overflow-x-auto text-sm">
                  <code>{`import { DhanHqClient, DhanEnv } from 'dhan-ts';

const client = new DhanHqClient({
  accessToken: 'your-token',
  clientId: 'your-client-id',
  env: DhanEnv.PROD,
});

// Get fund limits
const funds = await client.funds.getFundLimit();

// Place an order
const order = await client.orders.placeOrder({
  // order details...
});`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Zap className="h-5 w-5" />
                WebSocket Feed
              </h3>
              <div className="rounded-lg border bg-fd-muted/50 p-4">
                <pre className="overflow-x-auto text-sm">
                  <code>{`import { DhanFeed, FeedRequestCode } from 'dhan-ts';

const feed = new DhanFeed(config);
const liveFeed = feed.liveFeed;

// Connect
await liveFeed.connect();

// Subscribe to instruments
liveFeed.subscribe(
  [[1, "1333"]], // Reliance
  FeedRequestCode.SUBSCRIBE_TICKER
);

// Listen for updates
liveFeed.on('data', (data) => {
  console.log('Price:', data.lastTradedPrice);
});`}</code>
                </pre>
              </div>

              <h3 className="mb-4 mt-8 flex items-center gap-2 text-xl font-semibold">
                <TrendingUp className="h-5 w-5" />
                Market Data
              </h3>
              <div className="rounded-lg border bg-fd-muted/50 p-4">
                <pre className="overflow-x-auto text-sm">
                  <code>{`// Get historical data
const data = await client.marketData
  .getProcessedCandleData({
    securityId: '1333',
    exchangeSegment: 'NSE_EQ',
    interval: TimeInterval.DAY_1,
    daysAgo: 100,
  });`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Coverage */}
      <section className="border-b py-16">
        <div className="container max-w-6xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Complete API Coverage
          </h2>
          <p className="mb-12 text-center text-fd-muted-foreground">
            Access every feature of Dhan's trading platform through a unified, type-safe interface
          </p>

          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold">REST APIs (15 Modules)</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Orders', desc: 'Place, modify, cancel orders', href: '/docs/api-reference/orders' },
                { name: 'Portfolio', desc: 'Holdings & positions', href: '/docs/api-reference/portfolio' },
                { name: 'Funds', desc: 'Balance & margin', href: '/docs/api-reference/funds' },
                { name: 'Market Data', desc: 'Real-time & historical', href: '/docs/api-reference/market-data' },
                { name: 'Super Orders', desc: 'Advanced order types', href: '/docs/api-reference/super-orders' },
                { name: 'Forever Orders', desc: 'GTT orders', href: '/docs/api-reference/forever-orders' },
                { name: 'Option Chain', desc: 'Options & Greeks', href: '/docs/api-reference/option-chain' },
                { name: 'Expired Options', desc: 'Historical data', href: '/docs/api-reference/expired-option-data' },
                { name: 'Authentication', desc: 'Auth flows', href: '/docs/authentication' },
                { name: 'E-DIS', desc: 'Delivery instruction', href: '/docs/api-reference/edis' },
                { name: 'Statements', desc: 'Ledger & history', href: '/docs/api-reference/statements' },
                { name: 'Traders Control', desc: 'Kill switch', href: '/docs/api-reference/traders-control' },
                { name: 'Scanner', desc: 'Stock screening', href: '/docs/api-reference/scanner' },
              ].map((api) => (
                <Link
                  key={api.name}
                  href={api.href}
                  className="rounded-lg border bg-fd-card p-4 transition-colors hover:bg-fd-muted"
                >
                  <div className="font-semibold">{api.name}</div>
                  <div className="text-sm text-fd-muted-foreground">{api.desc}</div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">WebSocket Feeds (6 Types)</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Live Feed', desc: 'Real-time market data', href: '/docs/feeds/live-feed' },
                { name: 'Order Updates', desc: 'Order status changes', href: '/docs/feeds/live-order-update' },
                { name: 'Market Depth 20', desc: '20-level depth', href: '/docs/feeds/market-depth-feed' },
                { name: 'Market Depth 200', desc: '200-level depth', href: '/docs/feeds/market-depth-feed' },
                { name: 'Multi Connection', desc: '10,000+ instruments', href: '/docs/feeds/multi-connection-feed' },
                { name: 'Mock Feeds', desc: 'Testing without live', href: '/docs/feeds/mock-feeds' },
              ].map((feed) => (
                <Link
                  key={feed.name}
                  href={feed.href}
                  className="rounded-lg border bg-fd-card p-4 transition-colors hover:bg-fd-muted"
                >
                  <div className="font-semibold">{feed.name}</div>
                  <div className="text-sm text-fd-muted-foreground">{feed.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-16">
        <div className="container max-w-6xl px-4">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold text-fd-primary">15+</div>
              <div className="text-fd-muted-foreground">API Modules</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-fd-primary">6</div>
              <div className="text-fd-muted-foreground">WebSocket Feeds</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-fd-primary">100%</div>
              <div className="text-fd-muted-foreground">TypeScript Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container max-w-4xl px-4">
          <div className="rounded-2xl border bg-gradient-to-br from-fd-primary/10 to-fd-primary/5 p-8 text-center md:p-12">
            <div className="mb-4 inline-flex rounded-full bg-fd-primary/20 p-3">
              <Rocket className="h-8 w-8 text-fd-primary" />
            </div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Start Trading?
            </h2>
            <p className="mb-8 text-lg text-fd-muted-foreground">
              Install dhan-ts today and build your next trading application with confidence
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-6 py-3 font-semibold text-fd-primary-foreground hover:bg-fd-primary/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-lg border bg-fd-background px-6 py-3 font-semibold hover:bg-fd-muted"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
