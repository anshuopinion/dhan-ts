// Scanner API Types for Dhan HQ Client

export interface ScannerParam {
	field: string;
	op: string;
	val: string | number;
}

export interface ScannerRequest {
	data?: any; // Allow any data structure since this is a thin wrapper
	[key: string]: any; // Allow any additional properties
}

export interface ScannerResultItem {
	DispSym: string;
	Exch: string;
	High1Yr: number;
	Inst: string;
	Isin: string;
	LotSize: number;
	Low1Yr: number;
	Ltp: number;
	Mcap?: number; // Market Cap (optional as not always returned)
	Multiplier: number;
	PPerchange: number;
	Pchange: number;
	Pe: number;
	Seg: string;
	Seosym: string;
	Sid: number;
	Sym: string;
	TickSize: number;
	Volume: number;
}

export interface ScannerResponse {
	code?: number;
	remarks?: string;
	tot_rec?: number;
	tot_pg?: number;
	last_resp_time?: string;
	data?: any[]; // Allow any data structure since this is a thin wrapper
	[key: string]: any; // Allow any additional properties
}

// Scanner field operators
export enum ScannerOperator {
	EQUAL = "",
	GREATER_THAN = "gt",
	GREATER_THAN_EQUAL = "gte",
	LESS_THAN = "lt",
	LESS_THAN_EQUAL = "lte",
	RANGE = "RANGE",
	NOT_EQUAL = "ne",
}

// Common scanner fields
export enum ScannerField {
	EXCHANGE = "Exch",
	PRICE_CHANGE_PERCENT = "PPerchange",
	LTP = "Ltp",
	MARKET_CAP = "Mcap",
	VOLUME = "Volume",
	PE_RATIO = "Pe",
	INSTRUMENT = "OgInst",
	SYMBOL = "Sym",
	HIGH_52_WEEK = "High1Yr",
	LOW_52_WEEK = "Low1Yr",
	PRICE_CHANGE = "Pchange",
}

// Scanner sort fields
export enum ScannerSortField {
	MARKET_CAP = "Mcap",
	LTP = "Ltp",
	VOLUME = "Volume",
	PRICE_CHANGE_PERCENT = "PPerchange",
	PRICE_CHANGE = "Pchange",
	PE_RATIO = "Pe",
}

// Available return fields for scanner results
export enum ScannerReturnField {
	DISPLAY_SYMBOL = "DispSym",
	PRICE_CHANGE = "Pchange",
	VOLUME = "Volume",
	PE_RATIO = "Pe",
	SYMBOL = "Sym",
	LTP = "Ltp",
	MARKET_CAP = "Mcap",
	HIGH_52_WEEK = "High1Yr",
	LOW_52_WEEK = "Low1Yr",
	PRICE_CHANGE_PERCENT = "PPerchange",
}
