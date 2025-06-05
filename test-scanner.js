// Simple test script to verify the scanner works without authentication
const {DhanHqClient} = require("./dist/index.js");

// Create client without authentication (scanner doesn't need it)
const client = new DhanHqClient({
	accessToken: "dummy", // Not used by scanner
	clientId: "dummy", // Not used by scanner
	env: "PROD",
});

async function testScanner() {
	console.log("🧪 Testing Simplified Scanner Implementation...\n");

	try {
		// Test 1: Basic scanner functionality
		console.log("Test 1: Getting top 5 stocks by market cap...");
		const topStocks = await client.scanner.getTopStocks(5);
		console.log(`✅ Success: Found ${topStocks.data.length} stocks`);
		console.log(`   First stock: ${topStocks.data[0].DispSym} - ₹${topStocks.data[0].Ltp}\n`);

		// Test 2: Exchange-specific stocks
		console.log("Test 2: Getting NSE stocks...");
		const nseStocks = await client.scanner.getNSEStocks(5);
		console.log(`✅ Success: Found ${nseStocks.data.length} NSE stocks`);
		console.log(`   First NSE stock: ${nseStocks.data[0].DispSym}\n`);

		// Test 3: Client-side filtering
		console.log("Test 3: Testing client-side price filtering...");
		const expensiveStocks = client.scanner.filterByPriceRange(topStocks, 1000);
		console.log(`✅ Success: Found ${expensiveStocks.data.length} stocks above ₹1000\n`);

		// Test 4: Smart methods
		console.log("Test 4: Getting top gainers...");
		const gainers = await client.scanner.getTopGainers(1, 50, 3);
		console.log(`✅ Success: Found ${gainers.data.length} top gainers`);
		if (gainers.data.length > 0) {
			console.log(`   Top gainer: ${gainers.data[0].DispSym} (+${gainers.data[0].PPerchange}%)\n`);
		}

		// Test 5: Volume filtering
		console.log("Test 5: Getting high volume stocks...");
		const highVolume = await client.scanner.getHighVolumeStocks(100000, 50, 3);
		console.log(`✅ Success: Found ${highVolume.data.length} high volume stocks\n`);

		console.log("🎉 All tests passed! Scanner implementation is working correctly.");
		console.log("🔑 Key benefits:");
		console.log("   ✓ No authentication required");
		console.log("   ✓ No token management needed");
		console.log("   ✓ Client-side filtering for complex queries");
		console.log("   ✓ Reliable public endpoint access");
	} catch (error) {
		console.error("❌ Test failed:", error.message);
		process.exit(1);
	}
}

testScanner();
