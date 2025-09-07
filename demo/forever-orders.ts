import {DhanHqClient} from "../src";
import {
	ExchangeSegment,
	TransactionType,
	ProductType,
	OrderType,
	Validity,
	OrderFlag,
} from "../src/types";

export async function demoForeverOrders(dhanClient: DhanHqClient, config: any) {
	console.log("\nDemonstrating Forever Orders API:");

	// Create a forever order
	const foreverOrderRequest = {
		dhanClientId: config.clientId,
		orderFlag: OrderFlag.SINGLE,
		transactionType: TransactionType.BUY,
		exchangeSegment: ExchangeSegment.NSE_EQ,
		productType: ProductType.CNC,
		orderType: OrderType.LIMIT,
		validity: Validity.DAY,
		securityId: "1333", // HDFC Bank
		quantity: 1,
		price: 1500,
		triggerPrice: 1490,
	};
	const foreverOrder = await dhanClient.foreverOrders.createForeverOrder(foreverOrderRequest);
	console.log("Created forever order:", foreverOrder);

	// Get all forever orders
	const allForeverOrders = await dhanClient.foreverOrders.getAllForeverOrders();
	console.log("All forever orders:", allForeverOrders);
}