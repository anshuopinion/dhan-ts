import {DhanHqClient} from "../src";

export async function demoScanner(dhanClient: DhanHqClient) {
	console.log("\nDemonstrating Simple Scanner API:");
	console.log("(Thin wrapper - all logic handled by the API)");

	try {
		// Example: Pass any request data directly to the API
		console.log("\n=== Example API Request ===");

		// This is just an example - you can pass any structure the API accepts
		const exampleRequest = {
			data: {
				sort: "Mcap",
				sorder: "desc",
				count: 25,
				params: [
					{field: "Exch", op: "", val: "NSE"},
					{field: "PPerchange", op: "gte", val: "6"},
					{field: "Ltp", op: "gte", val: "50"},
					{field: "Exch", op: "", val: "NSE"},
					{field: "Mcap", op: "gte", val: "500"},
					{field: "Ltp", op: "RANGE", val: "5_200"},
					{field: "PPerchange", op: "gte", val: "9"},
					{field: "Volume", op: "gte", val: "100000"},
					{field: "OgInst", op: "", val: "ES"},
					{field: "Volume", op: "gte", val: "0"},
				],
				logic_op: "AND",
				fields: ["DispSym", "Pchange", "Volume", "Pe", "Sym"],
				pgno: 1,
			},
		};

		console.log("Sending request to API:");
		console.log(JSON.stringify(exampleRequest, null, 2));

		const result = await dhanClient.scanner.scan(exampleRequest);
		console.log("\nAPI Response:");
		console.log("Status:", result.code || "N/A");
		console.log("Records:", result.tot_rec || 0);
		console.log("Data items:", result.data?.length || 0);

		if (result.data && result.data.length > 0) {
			console.log("\nFirst few results:");
			result.data.slice(0, 3).forEach((item, index) => {
				console.log(`${index + 1}.`, JSON.stringify(item, null, 2));
			});
		}

		console.log("\n✅ Scanner working as thin API wrapper!");
		console.log("💡 The scanner simply passes your request to the API and returns the response.");
		console.log("💡 Structure your request data according to the API documentation.");
	} catch (error) {
		console.error("Scanner demo error:", error);
		console.log("\n💡 This is expected if the API endpoint structure has changed.");
		console.log("💡 The scanner is a simple wrapper - just update your request format as needed.");
	}
}