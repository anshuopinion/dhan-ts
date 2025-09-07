import {DhanHqClient} from "../src";

export async function demoStatements(dhanClient: DhanHqClient) {
	console.log("\nDemonstrating Statements API:");

	// not working for me

	// Get ledger report
	// const ledgerReport = await dhanClient.statements.getLedgerReport(
	//   "2024-10-02",
	//   "2024-10-09"
	// );
	// console.log("Ledger report:", ledgerReport);

	// Get trade history
	// const tradeHistory = await dhanClient.statements.getTradeHistory(
	//   "2024-09-09",
	//   "2024-10-02"
	// );
	// console.log("Trade history:", tradeHistory);
}