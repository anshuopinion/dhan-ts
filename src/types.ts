export enum DhanEnv {
  PROD = "PROD",
  SANDBOX = "SANDBOX",
}

export interface DhanConfig {
  accessToken: string;
  env: DhanEnv;
  clientId: string;
  webAccess?: string;
}

export enum OrderFlag {
  SINGLE = "SINGLE",
  OCO = "OCO",
}

// Feed Request Codes
export enum FeedRequestCode {
  CONNECT = 11,
  DISCONNECT = 12,
  SUBSCRIBE_TICKER = 15,
  UNSUBSCRIBE_TICKER = 16,
  SUBSCRIBE_QUOTE = 17,
  UNSUBSCRIBE_QUOTE = 18,
  SUBSCRIBE_FULL = 21,
  UNSUBSCRIBE_FULL = 22,
  SUBSCRIBE_MARKET_DEPTH = 23,
  UNSUBSCRIBE_MARKET_DEPTH = 24,
}

// Feed Response Codes
export enum FeedResponseCode {
  INDEX = 1,
  TICKER = 2,
  QUOTE = 4,
  OI = 5,
  PREV_CLOSE = 6,
  MARKET_STATUS = 7,
  FULL = 8,
  FEED_DISCONNECT = 50,
}

// Trading API Error Codes
export enum TradingApiErrorCode {
  INVALID_AUTHENTICATION = "DH-901",
  INVALID_ACCESS = "DH-902",
  USER_ACCOUNT = "DH-903",
  RATE_LIMIT = "DH-904",
  INPUT_EXCEPTION = "DH-905",
  ORDER_ERROR = "DH-906",
  DATA_ERROR = "DH-907",
  INTERNAL_SERVER_ERROR = "DH-908",
  NETWORK_ERROR = "DH-909",
  OTHERS = "DH-910",
}

// Data API Error Codes
export enum DataApiErrorCode {
  INTERNAL_SERVER_ERROR = 800,
  INSTRUMENT_LIMIT_EXCEEDED = 804,
  TOO_MANY_REQUESTS = 805,
  DATA_APIS_NOT_SUBSCRIBED = 806,
  ACCESS_TOKEN_EXPIRED = 807,
  AUTHENTICATION_FAILED = 808,
  ACCESS_TOKEN_INVALID = 809,
  CLIENT_ID_INVALID = 810,
  INVALID_EXPIRY_DATE = 811,
  INVALID_DATE_FORMAT = 812,
  INVALID_SECURITY_ID = 813,
  INVALID_REQUEST = 814,
}

// Error response interfaces
export interface DhanApiError {
  errorType: "TradingApi" | "DataApi";
  code: string | number;
  message: string;
  details?: any;
}

export interface FeedErrorResponse {
  type: "error";
  errorCode: number;
  errorMessage: string;
  connectionId?: string;
  timestamp: number;
}

export interface FeedDisconnectionResponse {
  type: "disconnection";
  errorCode: number;
  reason: string;
  connectionId?: string;
  timestamp: number;
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
  PART_TRADED = "PART_TRADED",
  CLOSED = "CLOSED",
  TRIGGERED = "TRIGGERED",
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
  [exchangeSegment: string]: number[];
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
  webAccess?: string;
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
  | MarketDepthResponse
  | FeedErrorResponse
  | FeedDisconnectionResponse;

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

// Stock Basic Details interfaces
export interface StockBasicDetailsRequest {
  Seg: number; // Segment (1 for NSE_EQ, 2 for NSE_FNO, etc.)
  SecId: number; // Security ID
  headers?: Record<string, string>; // Optional custom headers
}

export interface IndexMembership {
  idx_id: number;
  name: string;
  type: string;
}

export interface MarketDepthLevel {
  bqt: number; // Buy quantity
  sqt: number; // Sell quantity
  bp: number; // Buy price
  sp: number; // Sell price
  BuyOrderNo: number; // Number of buy orders
  SellOrderNo: number; // Number of sell orders
}

export interface StockBasicDetailsResponse {
  // Basic Information
  sid: number; // Security ID
  exch: string; // Exchange
  isin: string; // ISIN code
  d_sym: string; // Display symbol (company name)
  sym: string; // Symbol
  d_inst: string; // Display instrument
  seg: string; // Segment
  sr: string; // Series
  sec: string; // Sector
  sub_sec: string; // Sub-sector
  u_dp_nm: string; // Display name
  seo: string; // SEO friendly name

  // Price Data
  Ltp: number; // Last traded price
  ch: number; // Change
  p_ch: number; // Percentage change
  vol: number; // Volume
  hg: number; // Day high
  lo: number; // Day low
  op: number; // Open price
  cl: number; // Previous close
  atp: number; // Average trade price

  // Circuit Limits
  uckt: number; // Upper circuit limit
  lckt: number; // Lower circuit limit

  // Historical Performance Data
  h5y: number; // 5 year high
  l5y: number; // 5 year low
  c5y: number; // 5 year change
  chp5y: number; // 5 year change percentage
  h4y: number; // 4 year high
  l4y: number; // 4 year low
  c4y: number; // 4 year change
  chp4y: number; // 4 year change percentage
  h3y: number; // 3 year high
  l3y: number; // 3 year low
  c3y: number; // 3 year change
  chp3y: number; // 3 year change percentage
  h2y: number; // 2 year high
  l2y: number; // 2 year low
  c2y: number; // 2 year change
  chp2y: number; // 2 year change percentage
  h1y: number; // 1 year high
  l1y: number; // 1 year low
  c1y: number; // 1 year change
  chp1y: number; // 1 year change percentage
  h9m: number; // 9 month high
  l9m: number; // 9 month low
  c9m: number; // 9 month change
  chp9m: number; // 9 month change percentage
  h6m: number; // 6 month high
  l6m: number; // 6 month low
  c6m: number; // 6 month change
  chp6m: number; // 6 month change percentage
  h3m: number; // 3 month high
  l3m: number; // 3 month low
  c3m: number; // 3 month change
  chp3m: number; // 3 month change percentage
  h1m: number; // 1 month high
  l1m: number; // 1 month low
  c1m: number; // 1 month change
  chp1m: number; // 1 month change percentage
  h2wk: number; // 2 week high
  l2wk: number; // 2 week low
  c2Wk: number; // 2 week change
  chp2wk: number; // 2 week change percentage
  h1wk: number; // 1 week high
  l1wk: number; // 1 week low
  c1Wk: number; // 1 week change
  chp1wk: number; // 1 week change percentage

  // Technical Data
  ltsz: number; // Lot size
  mlpl: number; // Market lot price
  tksz: number; // Tick size

  // Volume and Trade Data
  vol_t_td: number; // Total volume traded
  l_tr_qt: number; // Last trade quantity
  t_b_qt: number; // Total buy quantity
  t_s_qty: number; // Total sell quantity

  // Additional Data
  oi: number; // Open interest
  oi_ch: number; // Open interest change
  oi_p_ch: number; // Open interest percentage change
  ltt: string; // Last trade time
  stk: number; // Strike price (for derivatives)
  exdt: string; // Expiry date
  op_tp: string; // Option type
  expc: number; // Expiry code
  jexpdt: number; // Java expiry date
  mtf_rmp: number; // MTF rate

  // Index Membership
  idx_lst: IndexMembership[];

  // Market Depth
  submbp: MarketDepthLevel[];

  // Additional Technical Fields
  r1: number; // Resistance 1
  r2: number; // Resistance 2
  r3: number; // Resistance 3
  pivot: number; // Pivot point
  s1: number; // Support 1
  s2: number; // Support 2
  s3: number; // Support 3

  // Additional Identifiers
  u_id: number;
  u_bid: number;
  u_seg_id: number;
  u_seg_cd: string;
  u_inst_nm: string;
  u_ex_nm: string;
  u_d_iv: number;
  inst_nm: string;
  p_vol_f: string;
  u_vol_f: string;
  s_bc_dt: string; // Settlement date
  dy_t_exp: number;
  expt: string;
  ltd: string;
  nr_o_expj: number;
  nr_f_expj: number;
  nr_f_sid: number;
}

// Stock Fundamental Data interfaces
export interface StockFundamentalRequest {
  isins: string[]; // Array of ISIN codes
  headers?: Record<string, string>; // Optional custom headers
}

export interface CompanyValues {
  "52_WEEK_HIGH": string;
  "52_WEEK_LOW": string;
  BOOK_VALUE: string;
  BSE: string;
  COMPANY_CLASSIFICATION: string;
  DIVIDEND_YEILD: string;
  FACE_VALUE: string;
  INDUSTRY_NAME: string;
  MARKET_CAP: string;
  NSE: string;
  PRICE_TO_BOOK_VALUE: string;
  SECTOR: string;
  STOCK_PE: string;
  SUB_SECTOR: string;
}

export interface TTMFinancials {
  DEPRECIATION: string;
  EBITDA: string;
  EPS: string;
  EXPENSES: string;
  INTEREST: string;
  NET_PROFIT: string;
  OPERATING_PROFIT: string;
  OPM: string;
  OTHER_INCOME: string;
  PROFIT_BEFORE_TAX: string;
  REVENUE: string;
  SALES: string;
  TAX: string;
  TAX_PAYMENT_ABSOLUTE: string;
}

export interface BalanceSheetData {
  CURRENT_ASSETS: string;
  CURRENT_LIABILITIES: string;
  CWIP: string; // Capital Work in Progress
  FIXED_ASSETS: string;
  INVESTMENTS: string;
  MINORITY_INTEREST: string;
  NON_CURRENT_LIABILITIES: string;
  OTHER_ASSETS: string;
  RESERVE_SURPLUS: string;
  SHAREHOLDERs_CAPITAL: string;
  SHARE_CAPITAL: string;
  TOTAL_ASSETS: string;
  TOTAL_EQUITY: string;
  TOTAL_EQUITY_AND_LIABILITIES: string;
  YEAR: string;
}

export interface CashFlowData {
  CAPITAL_EXPENDITURE: string;
  CHANGES_IN_WORKING_CAPITAL: string;
  FINANCING_ACTIVITIES: string;
  INVESTING_ACTIVITIES: string;
  NET_CASH_FLOW: string;
  OPERATING_ACTIVITIES: string;
  YEAR: string;
}

export interface IncomeStatementData {
  DEPRECIATION: string;
  EBITDA: string;
  EPS: string;
  EXPENSES: string;
  INTEREST: string;
  NET_PROFIT: string;
  OPERATING_PROFIT: string;
  OPM: string;
  OTHER_INCOME: string;
  PROFIT_BEFORE_TAX: string;
  REVENUE: string;
  SALES: string;
  TAX: string;
  TAX_PAYMENT_ABSOLUTE: string;
  YEAR: string;
}

export interface RevenueNetProfitData {
  PROFIT: string;
  PROFIT_GROWTH: string;
  REVENUE: string;
  REVENUE_GROWTH: string;
  YEAR: string;
}

export interface ROCEROEData {
  ROCE: string;
  ROE: string;
  TYPES_OF_COMPANY: string;
  YEAR: string;
}

export interface ShareholdingPattern {
  DII: string; // Domestic Institutional Investors
  FII: string; // Foreign Institutional Investors
  GOVERNMENT: string;
  NO_OF_SHARE_HOLDERS: string;
  OTHERS: string;
  PROMOTER: string;
  PUBLIC: string;
  YEAR: string;
}

export interface StockFundamentalData {
  CV: CompanyValues;
  TTM_cy: TTMFinancials; // TTM Current Year
  TTM_sy: TTMFinancials; // TTM Same Year
  bs_c: BalanceSheetData; // Balance Sheet Consolidated
  bs_s: BalanceSheetData; // Balance Sheet Standalone
  cF_c: CashFlowData; // Cash Flow Consolidated
  cF_s: CashFlowData; // Cash Flow Standalone
  incomeStat_cq: IncomeStatementData; // Income Statement Current Quarter
  incomeStat_cy: IncomeStatementData; // Income Statement Current Year
  incomeStat_sq: IncomeStatementData; // Income Statement Same Quarter
  incomeStat_sy: IncomeStatementData; // Income Statement Same Year
  isin: string;
  rNp_s: RevenueNetProfitData; // Revenue Net Profit Standalone
  roce_roe: ROCEROEData;
  sHp: ShareholdingPattern; // Shareholding Pattern
}

export interface StockFundamentalResponse {
  data: StockFundamentalData[];
}

// Market Feed Response Types
export interface LTPInstrumentData {
  last_price: number;
}

export interface MarketLTPResponse {
  data: {
    [exchangeSegment: string]: {
      [securityId: string]: LTPInstrumentData;
    };
  };
  status: string;
}

export interface OHLCInstrumentData {
  last_price: number;
  ohlc: {
    open: number;
    close: number;
    high: number;
    low: number;
  };
}

export interface MarketOHLCResponse {
  data: {
    [exchangeSegment: string]: {
      [securityId: string]: OHLCInstrumentData;
    };
  };
  status: string;
}

export interface QuoteDepthLevel {
  quantity: number;
  orders: number;
  price: number;
}

export interface QuoteDepth {
  buy: QuoteDepthLevel[];
  sell: QuoteDepthLevel[];
}

export interface QuoteInstrumentData {
  average_price: number;
  buy_quantity: number;
  sell_quantity: number;
  depth: QuoteDepth;
  last_price: number;
  last_quantity: number;
  last_trade_time: string;
  lower_circuit_limit: number;
  upper_circuit_limit: number;
  net_change: number;
  ohlc: {
    open: number;
    close: number;
    high: number;
    low: number;
  };
  oi: number;
  oi_day_high: number;
  oi_day_low: number;
  volume: number;
}

export interface MarketQuoteResponse {
  data: {
    [exchangeSegment: string]: {
      [securityId: string]: QuoteInstrumentData;
    };
  };
  status: string;
}

// Authentication Types

// App-based (Individual) Authentication
export interface GenerateConsentAppRequest {
  dhanClientId: string;
}

export interface GenerateConsentAppResponse {
  consentAppId: string;
  consentAppStatus: string;
  status: string;
}

export interface ConsumeConsentAppRequest {
  tokenId: string;
}

export interface ConsumeConsentAppResponse {
  dhanClientId: string;
  dhanClientName: string;
  dhanClientUcc: string;
  givenPowerOfAttorney: boolean;
  accessToken: string;
  expiryTime: string;
}

// Partner-based Authentication
export interface GenerateConsentPartnerResponse {
  consentId: string;
  consentStatus: string;
}

export interface ConsumeConsentPartnerRequest {
  tokenId: string;
}

export interface ConsumeConsentPartnerResponse {
  dhanClientId: string;
  dhanClientName: string;
  dhanClientUcc: string;
  givenPowerOfAttorney: boolean;
  accessToken: string;
  expiryTime: string;
}

// Static IP Management
export enum IPFlag {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}

export interface SetIPRequest {
  dhanClientId: string;
  ip: string;
  ipFlag: IPFlag;
}

export interface ModifyIPRequest {
  dhanClientId: string;
  ip: string;
  ipFlag: IPFlag;
}

export interface IPResponse {
  message: string;
  status: string;
}

export interface GetIPResponse {
  modifyDateSecondary: string;
  secondaryIP: string;
  modifyDatePrimary: string;
  primaryIP: string;
}

// User Profile
export interface UserProfileResponse {
  dhanClientId: string;
  tokenValidity: string;
  activeSegment: string;
  ddpi: string;
  mtf: string;
  dataPlan: string;
  dataValidity: string;
}

// Super Order Types
export interface SuperOrderRequest {
  dhanClientId: string;
  correlationId?: string;
  transactionType: TransactionType;
  exchangeSegment: ExchangeSegmentText;
  productType: ProductType;
  orderType: OrderType;
  securityId: string;
  quantity: number;
  price: number;
  targetPrice: number;
  stopLossPrice: number;
  trailingJump: number;
}

export interface SuperOrderResponse {
  orderId: string;
  orderStatus: OrderStatus;
}

export interface ModifySuperOrderRequest {
  dhanClientId: string;
  orderId: string;
  orderType?: OrderType;
  legName: LegName;
  quantity?: number;
  price?: number;
  targetPrice?: number;
  stopLossPrice?: number;
  trailingJump?: number;
}

export interface SuperOrderLegDetail {
  orderId: string;
  legName: LegName;
  transactionType: TransactionType;
  totalQuantity?: number;
  remainingQuantity: number;
  triggeredQuantity: number;
  price: number;
  orderStatus: OrderStatus;
  trailingJump: number;
}

export interface SuperOrderDetail {
  dhanClientId: string;
  orderId: string;
  correlationId?: string;
  orderStatus: OrderStatus;
  transactionType: TransactionType;
  exchangeSegment: ExchangeSegmentText;
  productType: ProductType;
  orderType: OrderType;
  validity: Validity;
  tradingSymbol: string;
  securityId: string;
  quantity: number;
  remainingQuantity: number;
  ltp: number;
  price: number;
  afterMarketOrder: boolean;
  legName: LegName;
  exchangeOrderId: string;
  createTime: string;
  updateTime: string;
  exchangeTime: string;
  omsErrorDescription: string;
  averageTradedPrice: number;
  filledQty: number;
  legDetails: SuperOrderLegDetail[];
}

// Option Chain Types
export interface OptionGreeks {
  delta: number;
  theta: number;
  gamma: number;
  vega: number;
}

export interface OptionData {
  greeks: OptionGreeks;
  implied_volatility: number;
  last_price: number;
  oi: number;
  previous_close_price: number;
  previous_oi: number;
  previous_volume: number;
  top_ask_price: number;
  top_ask_quantity: number;
  top_bid_price: number;
  top_bid_quantity: number;
  volume: number;
}

export interface StrikeData {
  ce?: OptionData;
  pe?: OptionData;
}

export interface OptionChainData {
  last_price: number;
  oc: {
    [strike: string]: StrikeData;
  };
}

export interface OptionChainRequest {
  UnderlyingScrip: number;
  UnderlyingSeg: string;
  Expiry: string;
}

export interface OptionChainResponse {
  data: OptionChainData;
}

export interface ExpiryListRequest {
  UnderlyingScrip: number;
  UnderlyingSeg: string;
}

export interface ExpiryListResponse {
  data: string[];
  status: string;
}

// Expired Options Data Types
export enum ExpiryFlag {
  WEEK = "WEEK",
  MONTH = "MONTH",
}

export enum StrikeType {
  ATM = "ATM",
  ATM_PLUS_1 = "ATM+1",
  ATM_PLUS_2 = "ATM+2",
  ATM_PLUS_3 = "ATM+3",
  ATM_PLUS_4 = "ATM+4",
  ATM_PLUS_5 = "ATM+5",
  ATM_PLUS_6 = "ATM+6",
  ATM_PLUS_7 = "ATM+7",
  ATM_PLUS_8 = "ATM+8",
  ATM_PLUS_9 = "ATM+9",
  ATM_PLUS_10 = "ATM+10",
  ATM_MINUS_1 = "ATM-1",
  ATM_MINUS_2 = "ATM-2",
  ATM_MINUS_3 = "ATM-3",
  ATM_MINUS_4 = "ATM-4",
  ATM_MINUS_5 = "ATM-5",
  ATM_MINUS_6 = "ATM-6",
  ATM_MINUS_7 = "ATM-7",
  ATM_MINUS_8 = "ATM-8",
  ATM_MINUS_9 = "ATM-9",
  ATM_MINUS_10 = "ATM-10",
}

export type RequiredDataField =
  | "open"
  | "high"
  | "low"
  | "close"
  | "iv"
  | "volume"
  | "strike"
  | "oi"
  | "spot";

export interface ExpiredOptionDataRequest {
  exchangeSegment: ExchangeSegmentText;
  interval: string;
  securityId: string;
  instrument: InstrumentToken;
  expiryFlag: ExpiryFlag;
  expiryCode: number;
  strike: StrikeType | string;
  drvOptionType: DrvOptionType;
  requiredData: RequiredDataField[];
  fromDate: string;
  toDate: string;
}

export interface ExpiredOptionDataValues {
  iv?: number[];
  oi?: number[];
  strike?: number[];
  spot?: number[];
  open?: number[];
  high?: number[];
  low?: number[];
  close?: number[];
  volume?: number[];
  timestamp: number[];
}

export interface ExpiredOptionDataResponse {
  data: {
    ce: ExpiredOptionDataValues | null;
    pe: ExpiredOptionDataValues | null;
  };
}
