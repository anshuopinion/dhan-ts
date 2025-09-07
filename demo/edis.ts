import {DhanHqClient} from "../src";

export async function demoEDIS(dhanClient: DhanHqClient) {
	console.log("\nDemonstrating EDIS API:");

	// Generate TPIN
	await dhanClient.edis.generateTpin();
	console.log("TPIN generation initiated");

	// Generate EDIS form
	const edisFormRequest = {
		isin: "INE040A01034", // HDFC Bank ISIN
		qty: 1,
		exchange: "NSE",
		segment: "E",
		bulk: false,
	};
	const edisForm = await dhanClient.edis.generateEdisForm(edisFormRequest);
	console.log("EDIS form:", edisForm);

	// Inquire EDIS status
	const edisStatus = await dhanClient.edis.inquireEdisStatus("INE040A01034");
	console.log("EDIS status:", edisStatus);
}