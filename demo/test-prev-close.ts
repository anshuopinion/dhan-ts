import {DhanFeed} from "../src";
import {DhanConfig, DhanEnv, ExchangeSegment, FeedRequestCode, Instrument} from "../src/types";
import dotenv from "dotenv";

dotenv.config();

const config: DhanConfig = {
	accessToken: process.env.ACCESS_TOKEN!,
	clientId: process.env.DHAN_CLIENT_ID!,
	env: DhanEnv.PROD,
};

const dhanFeed = new DhanFeed(config);

// Test instruments
const testInstruments: Instrument[] = [
	[ExchangeSegment.NSE_EQ, "11536"], // HDFC Bank
	[ExchangeSegment.NSE_EQ, "9931"], // ICICI Bank
	[ExchangeSegment.NSE_EQ, "14043"], // Reliance
];

interface TestResults {
	subscriptionType: string;
	requestCode: number;
	prevCloseReceived: boolean;
	dataReceived: boolean;
	messagesReceived: string[];
	startTime: number;
}

class PrevCloseTest {
	private results: TestResults[] = [];
	private currentTest: TestResults | null = null;
	private testTimeout: NodeJS.Timeout | null = null;

	async runAllTests() {
		console.log("🧪 Starting Previous Close Data Test for All Subscription Types");
		console.log("=".repeat(70));

		// Test each subscription type individually
		await this.testSubscriptionType("TICKER", FeedRequestCode.SUBSCRIBE_TICKER);
		await this.delay(3000);

		await this.testSubscriptionType("QUOTE", FeedRequestCode.SUBSCRIBE_QUOTE);
		await this.delay(3000);

		await this.testSubscriptionType("FULL", FeedRequestCode.SUBSCRIBE_FULL);
		await this.delay(3000);

		// Show final results
		this.showFinalResults();
	}

	private async testSubscriptionType(typeName: string, requestCode: number) {
		console.log(`\n🎯 Testing ${typeName} subscription...`);
		console.log("-".repeat(50));

		// Initialize test result
		this.currentTest = {
			subscriptionType: typeName,
			requestCode: requestCode,
			prevCloseReceived: false,
			dataReceived: false,
			messagesReceived: [],
			startTime: Date.now(),
		};

		// Setup event listeners
		this.setupEventListeners();

		try {
			// Subscribe to instruments
			console.log(`📡 Subscribing to ${testInstruments.length} instruments for ${typeName} data...`);
			await dhanFeed.multiConnectionLiveFeed.subscribe(testInstruments, requestCode);

			// Wait for messages (10 seconds timeout)
			await this.waitForMessages(10000);
		} catch (error) {
			console.error(`❌ Error during ${typeName} test:`, error);
			this.currentTest.messagesReceived.push(`ERROR: ${error}`);
		}

		// Store results
		this.results.push({...this.currentTest});

		// Clean up
		this.cleanup();

		// Show test results
		this.showTestResult(this.currentTest);
	}

	private setupEventListeners() {
		// Remove all existing listeners first
		dhanFeed.multiConnectionLiveFeed.removeAllListeners();

		dhanFeed.multiConnectionLiveFeed.on("message", ({connectionId, data}) => {
			if (!this.currentTest) return;

			console.log(data);

			const timestamp = new Date().toLocaleTimeString();
			const messageInfo = `[${timestamp}] Connection ${connectionId}: ${data.type} - Security ${data.securityId}`;

			console.log(`📨 ${messageInfo}`);
			this.currentTest.messagesReceived.push(messageInfo);

			// Track specific message types
			if (data.type === "prev_close") {
				this.currentTest.prevCloseReceived = true;
				console.log(`✅ PREV_CLOSE received! Security: ${data.securityId}, Price: ₹${data.previousClosePrice}`);
			} else if (data.type === this.currentTest.subscriptionType.toLowerCase()) {
				this.currentTest.dataReceived = true;
				console.log(`✅ ${this.currentTest.subscriptionType} data received! Security: ${data.securityId}`);
			}
		});

		dhanFeed.multiConnectionLiveFeed.on("error", error => {
			if (!this.currentTest) return;

			console.error(`❌ Connection error:`, error);
			this.currentTest.messagesReceived.push(`ERROR: ${JSON.stringify(error)}`);
		});

		dhanFeed.multiConnectionLiveFeed.on("connect", data => {
			console.log(`🔗 Connection established:`, data);
		});
	}

	private waitForMessages(timeoutMs: number): Promise<void> {
		return new Promise(resolve => {
			this.testTimeout = setTimeout(() => {
				console.log(`⏰ Test timeout after ${timeoutMs}ms`);
				resolve();
			}, timeoutMs);

			// Check every 500ms if we have received both types of messages
			const checkInterval = setInterval(() => {
				if (this.currentTest && this.currentTest.prevCloseReceived && this.currentTest.dataReceived) {
					clearInterval(checkInterval);
					if (this.testTimeout) {
						clearTimeout(this.testTimeout);
						this.testTimeout = null;
					}
					console.log(`✅ Both message types received! Completing test early.`);
					resolve();
				}
			}, 500);
		});
	}

	private showTestResult(test: TestResults) {
		const duration = (Date.now() - test.startTime) / 1000;

		console.log(`\n📊 ${test.subscriptionType} Test Results:`);
		console.log(`   Duration: ${duration.toFixed(1)}s`);
		console.log(`   Previous Close Received: ${test.prevCloseReceived ? "✅ YES" : "❌ NO"}`);
		console.log(`   ${test.subscriptionType} Data Received: ${test.dataReceived ? "✅ YES" : "❌ NO"}`);
		console.log(`   Total Messages: ${test.messagesReceived.length}`);

		if (test.messagesReceived.length > 0) {
			console.log(`   Message Summary:`);
			const messageTypes = test.messagesReceived.reduce((acc, msg) => {
				const type = msg.includes("ticker")
					? "ticker"
					: msg.includes("quote")
					? "quote"
					: msg.includes("full")
					? "full"
					: msg.includes("prev_close")
					? "prev_close"
					: msg.includes("ERROR")
					? "error"
					: "other";
				acc[type] = (acc[type] || 0) + 1;
				return acc;
			}, {} as Record<string, number>);

			Object.entries(messageTypes).forEach(([type, count]) => {
				console.log(`     ${type}: ${count}`);
			});
		}
	}

	private showFinalResults() {
		console.log("\n" + "=".repeat(70));
		console.log("📋 FINAL TEST RESULTS SUMMARY");
		console.log("=".repeat(70));

		console.log("\n📊 Previous Close Data Reception by Subscription Type:");
		console.log("-".repeat(55));
		console.log("| Subscription Type | Prev Close | Data Received | Messages |");
		console.log("-".repeat(55));

		this.results.forEach(result => {
			const prevClose = result.prevCloseReceived ? "✅ YES" : "❌ NO ";
			const dataRec = result.dataReceived ? "✅ YES" : "❌ NO ";
			const msgCount = result.messagesReceived.length.toString().padStart(8);

			console.log(`| ${result.subscriptionType.padEnd(16)} | ${prevClose}  | ${dataRec}      | ${msgCount} |`);
		});
		console.log("-".repeat(55));

		// Analysis
		console.log("\n🔍 Analysis:");
		const prevCloseResults = this.results.filter(r => r.prevCloseReceived);
		const noPrevCloseResults = this.results.filter(r => !r.prevCloseReceived);

		if (prevCloseResults.length === this.results.length) {
			console.log("✅ All subscription types receive prev_close data - Implementation is correct!");
		} else if (prevCloseResults.length === 0) {
			console.log("❌ No subscription types receive prev_close data - There may be an issue with prev_close parsing or server behavior");
		} else {
			console.log(`⚠️  Mixed results: ${prevCloseResults.length}/${this.results.length} subscription types receive prev_close data`);
			console.log(`   Types that receive prev_close: ${prevCloseResults.map(r => r.subscriptionType).join(", ")}`);
			console.log(`   Types that DON'T receive prev_close: ${noPrevCloseResults.map(r => r.subscriptionType).join(", ")}`);
		}

		console.log("\n💡 Expected Behavior:");
		console.log("   According to Dhan API documentation, prev_close data should be");
		console.log("   automatically sent for ALL subscription types when instruments are first subscribed.");
	}

	private cleanup() {
		if (this.testTimeout) {
			clearTimeout(this.testTimeout);
			this.testTimeout = null;
		}

		// Close all connections to ensure clean state for next test
		dhanFeed.multiConnectionLiveFeed.close();

		// Small delay to ensure cleanup
		console.log("🧹 Cleaning up connections...");
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

async function runTest() {
	const test = new PrevCloseTest();

	// Handle graceful shutdown
	process.on("SIGINT", () => {
		console.log("\n🛑 Test interrupted by user");
		dhanFeed.multiConnectionLiveFeed.close();
		process.exit(0);
	});

	try {
		await test.runAllTests();
	} catch (error) {
		console.error("❌ Test failed:", error);
	} finally {
		console.log("\n🏁 Test completed");
		process.exit(0);
	}
}

// Run the test
if (require.main === module) {
	runTest().catch(console.error);
}
