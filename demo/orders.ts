import {DhanHqClient} from "../src";
import {
	TransactionType,
	ProductType,
	OrderType,
	Validity,
	ExchangeSegmentText,
} from "../src/types";

export async function demoOrders(dhanClient: DhanHqClient, config: any) {
	console.log("\nDemonstrating Orders API:");

	// Place an order
	// const orderRequest = {
	//   dhanClientId: config.clientId,
	//   transactionType: TransactionType.BUY,
	//   correlationId: "1234",
	//   exchangeSegment: ExchangeSegmentText.NSE_EQ,
	//   productType: ProductType.CNC,
	//   orderType: OrderType.LIMIT,
	//   validity: Validity.DAY,
	//   securityId: "9362", // HDFC Bank
	//   quantity: 1,
	//   price: 311,
	//   disclosedQuantity: 0,
	//   afterMarketOrder: false,
	// };
	// const orderRequest = {
	//   securityId: "19813",
	//   correlationId: "6e6fe8a0bb",
	//   exchangeSegment: "NSE_EQ",
	//   transactionType: "BUY",
	//   quantity: 1,
	//   orderType: "LIMIT",
	//   productType: "INTRADAY",
	//   validity: "DAY",
	//   triggerPrice: 267.4662,
	//   price: 267.6,
	//   dhanClientId: config.clientId,
	//   afterMarketOrder: false,
	//   disclosedQuantity: 0,
	// };

	// const placedOrder = await dhanClient.orders.placeOrder(orderRequest as any);
	// console.log("Placed order:", placedOrder);

	// Get all orders
	// const allOrders = await dhanClient.orders.getOrders();
	// console.log("All orders:", allOrders);

	// // Get order by ID
	// if (allOrders.length > 0) {
	//   const orderById = await dhanClient.orders.getOrderById(
	//     allOrders[0].orderId
	//   );
	//   console.log("Order by ID:", orderById);
	// }

	// remove order

	// if (allOrders.length > 0) {
	//   const cancelOrder = await dhanClient.orders.cancelOrder(
	//     allOrders[0].orderId
	//   );
	//   console.log("Order removed:", cancelOrder);
	// }

	// modifyOrder

	// const orderModifyRequest = {
	//   dhanClientId: config.clientId,
	//   orderId: allOrders[0].orderId,
	//   orderType: OrderType.LIMIT,
	//   // legName: "",
	//   quantity: 1,
	//   price: 312,
	//   disclosedQuantity: 0,
	//   // triggerPrice: "",
	//   validity: Validity.DAY,
	// };

	// if (allOrders.length > 0) {
	//   const modifyOrder = await dhanClient.orders.modifyOrder(
	//     allOrders[0].orderId,
	//     orderModifyRequest
	//   );
	//   console.log("Order modified:", modifyOrder);
	// }

	// get order by external id
	// const orderbyExternal = await dhanClient.orders.getOrderByCorrelationId(
	//   "1234"
	// );
	// console.log("Order by external id:", orderbyExternal);

	// get trades
	// const trades = await dhanClient.orders.getTrades();
	// console.log("Trades:", trades);

	// get trades by order id

	// const tradesByOrderId = await dhanClient.orders.getTradesByOrderId(
	//   "4124100927065"
	// );
	// console.log("Trades by order id:", tradesByOrderId);
}