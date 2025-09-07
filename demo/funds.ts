import {DhanHqClient} from "../src";
import {
	ExchangeSegment,
	TransactionType,
	ProductType,
} from "../src/types";

export async function demoFunds(dhanClient: DhanHqClient, config: any) {
	console.log("\nDemonstrating Funds API:");

	// Get fund limits
	// const fundLimits = await dhanClient.funds.getFundLimit();
	// console.log("Fund limits:", fundLimits);

	// Calculate margin
	// const marginRequest = {
	//   dhanClientId: config.clientId,
	//   exchangeSegment: ExchangeSegment.NSE_EQ,
	//   transactionType: TransactionType.BUY,
	//   quantity: 1,
	//   productType: ProductType.CNC,
	//   securityId: "1333", // HDFC Bank
	//   price: 1500,
	// };
	// const marginCalculation = await dhanClient.funds.calculateMargin(
	//   marginRequest
	// );
	// console.log("Margin calculation:", marginCalculation);
}