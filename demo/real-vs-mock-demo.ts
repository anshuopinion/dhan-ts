import { DhanFeed } from "../src/dhan-feed";
import { DhanConfig, DhanEnv, ExchangeSegment, Instrument } from "../src/types";

// Example showing how to switch between real and mock feeds
const config: DhanConfig = {
	clientId: "your-client-id",
	accessToken: "your-access-token",
	env: DhanEnv.SANDBOX,
};

async function testBothFeeds() {
	const dhanFeed = new DhanFeed(config);

	// Create sample instruments for testing
	const testInstruments: Instrument[] = [
		[ExchangeSegment.NSE_EQ, "1333"], // HDFC Bank
		[ExchangeSegment.NSE_EQ, "2885"], // Reliance
		[ExchangeSegment.NSE_EQ, "1270"], // ICICI Bank
		[ExchangeSegment.NSE_EQ, "1660"], // ITC
		[ExchangeSegment.NSE_EQ, "11536"], // TCS
	];

	console.log("🔄 Demonstrating Real vs Mock Feed Usage");
	console.log("==========================================");

	// Test 1: Mock Feed (for offline testing)
	console.log("\\n🎭 MOCK FEED TEST (Market Closed)");
	console.log("-----------------------------------");
	
	let messageCount = 0;
	const maxMessages = 10;

	// Set up mock feed listener
	dhanFeed.mockMultiConnectionLiveFeed.on("message", ({ connectionId, data }) => {
		messageCount++;
		console.log(`🎭 Mock Data [${messageCount}]: ${data.type} - ${data.securityId} = ₹${data.lastTradedPrice}`);
		
		if (messageCount >= maxMessages) {
			console.log("🎭 Mock feed test completed!\\n");
			dhanFeed.mockMultiConnectionLiveFeed.close();
			testRealFeed();
		}
	});

	// Subscribe to mock feed
	try {
		await dhanFeed.mockMultiConnectionLiveFeed.subscribe(testInstruments, 15);
		console.log("✅ Mock feed subscribed successfully!");
	} catch (error) {
		console.error("❌ Mock feed error:", error);
		testRealFeed();
	}

	// Test 2: Real Feed (for live market)
	function testRealFeed() {
		console.log("🔴 REAL FEED TEST (Market Open)");
		console.log("--------------------------------");
		console.log("⚠️  This will only work when market is open");
		
		// Set up real feed listener
		dhanFeed.multiConnectionLiveFeed.on("message", ({ connectionId, data }) => {
			console.log(`🔴 Real Data: ${data.type} - ${data.securityId} = ₹${data.lastTradedPrice}`);
		});

		dhanFeed.multiConnectionLiveFeed.on("connect", ({ connectionId }) => {
			console.log("✅ Real feed connected!");
		});

		dhanFeed.multiConnectionLiveFeed.on("error", ({ connectionId, error }) => {
			console.log("❌ Real feed error (expected if market is closed):", error.message);
			console.log("\\n💡 Use mock feed for testing when market is closed!");
			cleanup();
		});

		// Try to subscribe to real feed
		dhanFeed.multiConnectionLiveFeed.subscribe(testInstruments, 15)
			.then(() => {
				console.log("✅ Real feed subscribed successfully!");
				
				// Clean up after 5 seconds
				setTimeout(() => {
					console.log("🛑 Cleaning up real feed...");
					cleanup();
				}, 5000);
			})
			.catch((error) => {
				console.log("❌ Real feed subscription failed (market closed?):", error.message);
				console.log("\\n💡 Perfect! Use mock feed for development and testing!");
				cleanup();
			});
	}

	function cleanup() {
		dhanFeed.mockMultiConnectionLiveFeed.close();
		dhanFeed.multiConnectionLiveFeed.close();
		
		console.log("\\n🎯 SUMMARY:");
		console.log("============");
		console.log("✅ Mock Feed: Perfect for development and testing");
		console.log("✅ Real Feed: Use when market is open");
		console.log("✅ Same API for both - easy to switch!");
		console.log("\\n🚀 Your scanner app is ready for both scenarios!");
		
		process.exit(0);
	}
}

// Run the test
testBothFeeds().catch(console.error);
