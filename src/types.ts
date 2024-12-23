export enum DhanEnv {
	PROD = "PROD",
	SANDBOX = "SANDBOX",
}

export interface DhanConfig {
	accessToken: string;
	env: DhanEnv;
	clientId: string;
}

export enum OrderFlag {
	SINGLE = "SINGLE",
	OCO = "OCO",
}

export enum FeedRequestCode {
	CONNECT = 11,
	DISCONNECT = 12,
	SUBSCRIBE_TICKER = 15,
	UNSUBSCRIBE_TICKER = 16,
	SUBSCRIBE_QUOTE = 17,
	UNSUBSCRIBE_QUOTE = 18,
	SUBSCRIBE_FULL = 21,
	UNSUBSCRIBE_FULL = 22,
}
export enum KillSwitchStatus {
	ACTIVATE = "ACTIVATE",
	DEACTIVATE = "DEACTIVATE",
}
export enum ExchangeSegment {
	NSE_EQ = 1,
	NSE_FNO = 2,
	NSE_CURRENCY = 3,
	BSE_EQ = 4,
	BSE_FNO = 5,
	BSE_CURRENCY = 6,
	MCX_COMM = 7,
}
export enum ExchangeSegmentText {
	NSE_EQ = "NSE_EQ",
	NSE_FNO = "NSE_FNO",
	NSE_CURRENCY = "NSE_CURRENCY",
	BSE_EQ = "BSE_EQ",
	BSE_FNO = "BSE_FNO",
	BSE_CURRENCY = "BSE_CURRENCY",
	MCX_COMM = "MCX_COMM",
}

export enum ProductType {
	CNC = "CNC",
	INTRADAY = "INTRADAY",
	MARGIN = "MARGIN",
	MTF = "MTF",
	CO = "CO",
	BO = "BO",
}

export enum OrderType {
	LIMIT = "LIMIT",
	MARKET = "MARKET",
	STOP_LOSS = "STOP_LOSS",
	STOP_LOSS_MARKET = "STOP_LOSS_MARKET",
}

export enum Validity {
	DAY = "DAY",
	IOC = "IOC",
}

export enum TransactionType {
	BUY = "BUY",
	SELL = "SELL",
}

export enum OrderStatus {
	TRANSIT = "TRANSIT",
	PENDING = "PENDING",
	REJECTED = "REJECTED",
	CANCELLED = "CANCELLED",
	TRADED = "TRADED",
	EXPIRED = "EXPIRED",
}

export enum PositionType {
	LONG = "LONG",
	SHORT = "SHORT",
	CLOSED = "CLOSED",
}

export enum DrvOptionType {
	CALL = "CALL",
	PUT = "PUT",
}

export enum AmoTime {
	OPEN = "OPEN",
	OPEN_30 = "OPEN_30",
	OPEN_60 = "OPEN_60",
}

export enum LegName {
	ENTRY_LEG = "ENTRY_LEG",
	TARGET_LEG = "TARGET_LEG",
	STOP_LOSS_LEG = "STOP_LOSS_LEG",
}

export interface OrderRequest {
	dhanClientId: string;
	correlationId?: string;
	transactionType: TransactionType;
	exchangeSegment: ExchangeSegmentText;
	productType: ProductType;
	orderType: OrderType;
	validity: Validity;
	securityId: string;
	quantity: number;
	disclosedQuantity?: number;
	price?: number;
	triggerPrice?: number;
	afterMarketOrder: boolean;
	amoTime?: AmoTime;
	boProfitValue?: number;
	boStopLossValue?: number;
}

export interface OrderResponse {
	orderId: string;
	orderStatus: OrderStatus;
}

export interface OrderDetail extends OrderRequest {
	orderId: string;
	exchangeOrderId: string;
	orderStatus: OrderStatus;
	tradingSymbol: string;
	legName?: LegName;
	createTime: string;
	updateTime: string;
	exchangeTime: string;
	drvExpiryDate?: string;
	drvOptionType?: DrvOptionType;
	drvStrikePrice?: number;
	omsErrorCode?: string;
	omsErrorDescription?: string;
	remainingQuantity: number;
	averageTradedPrice: number;
	filledQty: number;
}

export interface HoldingsResponse {
	exchange: string;
	tradingSymbol: string;
	securityId: string;
	isin: string;
	totalQty: number;
	dpQty: number;
	t1Qty: number;
	availableQty: number;
	collateralQty: number;
	avgCostPrice: number;
}

export interface PositionResponse {
	dhanClientId: string;
	tradingSymbol: string;
	securityId: string;
	positionType: PositionType;
	exchangeSegment: ExchangeSegment;
	productType: ProductType;
	buyAvg: number;
	buyQty: number;
	sellAvg: number;
	sellQty: number;
	netQty: number;
	realizedProfit: number;
	unrealizedProfit: number;
	rbiReferenceRate: number;
	multiplier: number;
	carryForwardBuyQty: number;
	carryForwardSellQty: number;
	carryForwardBuyValue: number;
	carryForwardSellValue: number;
	dayBuyQty: number;
	daySellQty: number;
	dayBuyValue: number;
	daySellValue: number;
	drvExpiryDate?: string;
	drvOptionType?: DrvOptionType;
	drvStrikePrice?: number;
	crossCurrency: boolean;
}

export interface ConvertPositionRequest {
	dhanClientId: string;
	fromProductType: ProductType;
	exchangeSegment: ExchangeSegment;
	positionType: PositionType;
	securityId: string;
	tradingSymbol: string;
	convertQty: number;
	toProductType: ProductType;
}

export interface FundLimitResponse {
	dhanClientId: string;
	availabelBalance: number;
	sodLimit: number;
	collateralAmount: number;
	receiveableAmount: number;
	utilizedAmount: number;
	blockedPayoutAmount: number;
	withdrawableBalance: number;
}

export interface MarginCalculatorRequest {
	dhanClientId: string;
	exchangeSegment: ExchangeSegment;
	transactionType: TransactionType;
	quantity: number;
	productType: ProductType;
	securityId: string;
	price: number;
	triggerPrice?: number;
}

export interface MarginCalculatorResponse {
	totalMargin: number;
	spanMargin: number;
	exposureMargin: number;
	availableBalance: number;
	variableMargin: number;
	insufficientBalance: number;
	brokerage: number;
	leverage: string;
}

export interface EdisFormRequest {
	isin: string;
	qty: number;
	exchange: string;
	segment: string;
	bulk: boolean;
}

export interface EdisFormResponse {
	dhanClientId: string;
	edisFormHtml: string;
}

export interface EdisInquiryResponse {
	clientId: string;
	isin: string;
	totalQty: number;
	aprvdQty: number;
	status: string;
	remarks: string;
}

export interface MarketFeedRequest {
	[exchangeSegment: number]: number[];
}

export interface HistoricalDataRequest {
	securityId: string;
	exchangeSegment: ExchangeSegmentText;
	instrument: string;
	expiryCode: number;
	fromDate: string;
	toDate: string;
	isFree?: boolean;
}

export interface IntradayDataRequest {
	securityId: string;
	exchangeSegment: ExchangeSegmentText;
	instrument: string;
	interval: string;
	fromDate: string;
	toDate: string;
}

export interface HistoricalDataResponse {
	open: number[];
	high: number[];
	low: number[];
	close: number[];
	volume: number[];
	timestamp: number[];
}
export interface Candle {
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	timestamp: number;
}
export interface DepthLevel {
	quantity: number;
	orders: number;
	price: number;
}

export interface MarketDepthResponse {
	buy: DepthLevel[];
	sell: DepthLevel[];
}

export interface TickerResponse {
	type: "ticker";
	exchangeSegment: number;
	securityId: number;
	lastTradedPrice: number;
	lastTradedTime: number;
}

export interface QuoteResponse {
	type: "quote";
	exchangeSegment: number;
	securityId: number;
	lastTradedPrice: number;
	lastTradedQuantity: number;
	lastTradedTime: number;
	averageTradePrice: number;
	volumeTraded: number;
	totalBuyQuantity: number;
	totalSellQuantity: number;
	openPrice: number;
	highPrice: number;
	lowPrice: number;
	closePrice: number;
}

export interface OiDataResponse {
	type: "oi_data";
	exchangeSegment: number;
	securityId: number;
	openInterest: number;
}

export interface PrevCloseResponse {
	type: "prev_close";
	exchangeSegment: number;
	securityId: number;
	previousClosePrice: number;
	previousOpenInterest: number;
}

export interface MarketStatusResponse {
	type: "market_status";
	status: "open" | "closed";
}

export interface FullMarketDataResponse {
	type: "full";
	exchangeSegment: number;
	securityId: number;
	lastTradedPrice: number;
	lastTradedQuantity: number;
	lastTradedTime: number;
	averageTradePrice: number;
	volumeTraded: number;
	totalBuyQuantity: number;
	totalSellQuantity: number;
	openInterest: number;
	openInterestDayHigh: number;
	openInterestDayLow: number;
	openPrice: number;
	closePrice: number;
	highPrice: number;
	lowPrice: number;
	marketDepth: MarketDepthResponse;
}

export type LiveFeedResponse =
	| TickerResponse
	| QuoteResponse
	| OiDataResponse
	| PrevCloseResponse
	| MarketStatusResponse
	| FullMarketDataResponse
	| MarketDepthResponse;

export interface DisconnectionResponse {
	errorCode: number;
	reason: string;
}

export interface ForeverOrderRequest {
	dhanClientId: string;
	correlationId?: string;
	orderFlag: OrderFlag;
	transactionType: TransactionType;
	exchangeSegment: ExchangeSegment;
	productType: ProductType;
	orderType: OrderType;
	validity: Validity;
	securityId: string;
	quantity: number;
	disclosedQuantity?: number;
	price: number;
	triggerPrice: number;
	price1?: number;
	triggerPrice1?: number;
	quantity1?: number;
}

export interface ForeverOrderResponse {
	orderId: string;
	orderStatus: OrderStatus;
}

export interface ForeverOrderDetail extends ForeverOrderRequest {
	orderId: string;
	orderStatus: OrderStatus;
	tradingSymbol: string;
	legName?: LegName;
	createTime: string;
	updateTime: string;
	exchangeTime: string;
	drvExpiryDate?: string;
	drvOptionType?: DrvOptionType;
	drvStrikePrice?: number;
}

export interface ModifyForeverOrderRequest {
	dhanClientId: string;
	orderId: string;
	orderFlag: OrderFlag;
	orderType: OrderType;
	legName?: LegName;
	quantity: number;
	price: number;
	disclosedQuantity?: number;
	triggerPrice: number;
	validity: Validity;
}

export interface KillSwitchResponse {
	dhanClientId: string;
	killSwitchStatus: string;
}

export interface LedgerEntry {
	dhanClientId: string;
	narration: string;
	voucherdate: string;
	exchange: string;
	voucherdesc: string;
	vouchernumber: string;
	debit: string;
	credit: string;
	runbal: string;
}

export interface TradeHistoryEntry {
	dhanClientId: string;
	orderId: string;
	exchangeOrderId: string;
	exchangeTradeId: string;
	transactionType: TransactionType;
	exchangeSegment: ExchangeSegment;
	productType: ProductType;
	orderType: OrderType;
	tradingSymbol: string | null;
	customSymbol: string;
	securityId: string;
	tradedQuantity: number;
	tradedPrice: number;
	isin: string;
	instrument: string;
	sebiTax: number;
	stt: number;
	brokerageCharges: number;
	serviceTax: number;
	exchangeTransactionCharges: number;
	stampDuty: number;
	createTime: string;
	updateTime: string;
	exchangeTime: string;
	drvExpiryDate: string | null;
	drvOptionType: DrvOptionType | null;
	drvStrikePrice: number;
}

export interface LiveOrderUpdate {
	Data: {
		exchange: string;
		segment: string;
		source: string;
		securityId: string;
		clientId: string;
		exchOrderNo: string;
		orderNo: string;
		product: string;
		txnType: string;
		orderType: string;
		validity: string;
		discQuantity: number;
		discQtyRem: number;
		remainingQuantity: number;
		quantity: number;
		tradedQty: number;
		price: number;
		triggerPrice: number;
		tradedPrice: number;
		avgTradedPrice: number;
		algoOrdNo: string;
		offMktFlag: string;
		orderDateTime: string;
		exchOrderTime: string;
		lastUpdatedTime: string;
		remarks: string;
		mktType: string;
		reasonDescription: string;
		legNo: number;
		instrument: string;
		symbol: string;
		productName: string;
		status: string;
		lotSize: number;
		strikePrice: number;
		expiryDate: string;
		optType: string;
		displayName: string;
		isin: string;
		series: string;
		goodTillDaysDate: string;
		refLtp: number;
		tickSize: number;
		algoId: string;
		multiplier: number;
	};
	Type: string;
}

export interface LiveOrderUpdateConfig extends DhanConfig {
	onConnect?: () => void;
	onDisconnect?: (code: number, reason: string) => void;
	onError?: (error: Error) => void;
	onOrderUpdate?: (update: LiveOrderUpdate) => void;
}

export type Instrument = [ExchangeSegment, string];

export enum InstrumentToken {
	INDEX = "INDEX",
	FUTIDX = "FUTIDX",
	OPTIDX = "OPTIDX",
	EQUITY = "EQUITY",
	FUTSTK = "FUTSTK",
	OPTSTK = "OPTSTK",
	FUTCOM = "FUTCOM",
	OPTFUT = "OPTFUT",
	FUTCUR = "FUTCUR",
	OPTCUR = "OPTCUR",
}

export enum TimeInterval {
	MIN_1 = "1m",
	MIN_2 = "2m",
	MIN_3 = "3m",
	MIN_4 = "4m",
	MIN_5 = "5m",
	MIN_10 = "10m",
	MIN_15 = "15m",
	MIN_30 = "30m",
	MIN_45 = "45m",
	HOUR_1 = "60m",
	HOUR_2 = "120m",
	HOUR_3 = "180m",
	HOUR_4 = "240m",
	DAY_1 = "1d",
	WEEK_1 = "1w",
	MONTH_1 = "1M",
	MONTH_2 = "2M",
	MONTH_3 = "3M",
	MONTH_6 = "6M",
	YEAR_1 = "1y",
}

export interface DhanApiResponse {
	success: boolean;
	message?: string;
	status?: string;
	data: DhanOHLCData;
	remark?: string;
}

// Data structure for OHLC data
export interface DhanOHLCData {
	t: number[]; // Array of timestamps in seconds
	o: number[]; // Array of open prices
	h: number[]; // Array of high prices
	l: number[]; // Array of low prices
	c: number[]; // Array of close prices
	v: number[]; // Array of volumes
	n?: number[]; // Array of number of trades (optional)
}

// Request interface for Dhan API
export interface DhanHistoricalDataRequest {
	EXCH: string; // Exchange (e.g., "NSE", "BSE")
	SYM: string; // Symbol/scrip code
	SEG: string; // Segment (e.g., "E" for equity)
	INST: string; // Instrument type (e.g., "EQUITY")
	START: number; // Start timestamp in seconds
	END: number; // End timestamp in seconds
	INTERVAL?: string; // Time interval (e.g., "1", "5", "15", "D", "W", "M")
}
