import {DhanHqClient} from "../src";
import {
	StockBasicDetailsRequest,
	StockFundamentalRequest,
} from "../src/types";

export async function demoStockBasicDetails(dhanClient: DhanHqClient) {
	console.log("\nDemonstrating Stock Basic Details API:");

	try {
		// Test with IDBI Bank (the example from your curl request)
		const request: StockBasicDetailsRequest = {
			Seg: 1, // NSE Equity segment
			SecId: 1476 // IDBI Bank security ID
		};

		console.log("Fetching stock basic details for Security ID:", request.SecId);
		
		const stockDetails = await dhanClient.marketData.getStockBasicDetails(request);
		
		console.log("\n=== BASIC INFORMATION ===");
		console.log(`Company: ${stockDetails.d_sym}`);
		console.log(`Symbol: ${stockDetails.sym}`);
		console.log(`ISIN: ${stockDetails.isin}`);
		console.log(`Exchange: ${stockDetails.exch}`);
		console.log(`Sector: ${stockDetails.sec}`);
		console.log(`Sub-Sector: ${stockDetails.sub_sec}`);
		
		console.log("\n=== CURRENT PRICE DATA ===");
		console.log(`Last Traded Price: ₹${stockDetails.Ltp}`);
		console.log(`Change: ₹${stockDetails.ch} (${stockDetails.p_ch}%)`);
		console.log(`Open: ₹${stockDetails.op}`);
		console.log(`High: ₹${stockDetails.hg}`);
		console.log(`Low: ₹${stockDetails.lo}`);
		console.log(`Previous Close: ₹${stockDetails.cl}`);
		console.log(`Volume: ${stockDetails.vol.toLocaleString()}`);
		console.log(`Average Trade Price: ₹${stockDetails.atp}`);
		
		console.log("\n=== CIRCUIT LIMITS ===");
		console.log(`Upper Circuit: ₹${stockDetails.uckt}`);
		console.log(`Lower Circuit: ₹${stockDetails.lckt}`);
		
		console.log("\n=== HISTORICAL PERFORMANCE ===");
		console.log(`1 Week: ${stockDetails.c1Wk > 0 ? '+' : ''}₹${stockDetails.c1Wk} (${stockDetails.chp1wk}%)`);
		console.log(`1 Month: ${stockDetails.c1m > 0 ? '+' : ''}₹${stockDetails.c1m} (${stockDetails.chp1m}%)`);
		console.log(`3 Months: ${stockDetails.c3m > 0 ? '+' : ''}₹${stockDetails.c3m} (${stockDetails.chp3m}%)`);
		console.log(`6 Months: ${stockDetails.c6m > 0 ? '+' : ''}₹${stockDetails.c6m} (${stockDetails.chp6m}%)`);
		console.log(`1 Year: ${stockDetails.c1y > 0 ? '+' : ''}₹${stockDetails.c1y} (${stockDetails.chp1y}%)`);
		
		console.log("\n=== 52-WEEK RANGE ===");
		console.log(`52W High: ₹${stockDetails.h1y}`);
		console.log(`52W Low: ₹${stockDetails.l1y}`);
		
		console.log("\n=== TECHNICAL DATA ===");
		console.log(`Lot Size: ${stockDetails.ltsz}`);
		console.log(`Tick Size: ₹${stockDetails.tksz}`);
		console.log(`Last Trade Time: ${stockDetails.ltt}`);
		
		if (stockDetails.idx_lst && stockDetails.idx_lst.length > 0) {
			console.log("\n=== INDEX MEMBERSHIP ===");
			stockDetails.idx_lst.forEach(index => {
				console.log(`- ${index.name}`);
			});
		}
		
		console.log("\n=== MARKET DEPTH (TOP LEVEL) ===");
		if (stockDetails.submbp && stockDetails.submbp.length > 0) {
			const topLevel = stockDetails.submbp[0];
			console.log(`Buy: ₹${topLevel.bp} (Qty: ${topLevel.bqt}, Orders: ${topLevel.BuyOrderNo})`);
			console.log(`Sell: ₹${topLevel.sp} (Qty: ${topLevel.sqt}, Orders: ${topLevel.SellOrderNo})`);
		}
		
		console.log("\n✅ Stock Basic Details fetched successfully!");
		
	} catch (error) {
		console.error("Error fetching stock basic details:", error);
	}
}

export async function demoStockFundamentals(dhanClient: DhanHqClient) {
	console.log("\nDemonstrating Stock Fundamental Data API:");

	try {
		// Test with the ISIN from your example
		const request: StockFundamentalRequest = {
			isins: ["INE500L01026"] // The ISIN from your curl request
		};

		console.log("Fetching fundamental data for ISIN:", request.isins[0]);
		
		const fundamentalData = await dhanClient.marketData.getStockFundamentals(request);
		const stockData = fundamentalData.data[0]; // Get first stock data
		
		console.log("\n=== COMPANY OVERVIEW ===");
		console.log(`Company Classification: ${stockData.CV.COMPANY_CLASSIFICATION}`);
		console.log(`Sector: ${stockData.CV.SECTOR}`);
		console.log(`Industry: ${stockData.CV.INDUSTRY_NAME}`);
		console.log(`Market Cap: ₹${stockData.CV.MARKET_CAP} Cr`);
		console.log(`Book Value: ₹${stockData.CV.BOOK_VALUE}`);
		console.log(`Face Value: ₹${stockData.CV.FACE_VALUE}`);
		
		console.log("\n=== VALUATION METRICS ===");
		console.log(`Stock P/E: ${stockData.CV.STOCK_PE}`);
		console.log(`Price to Book Value: ${stockData.CV.PRICE_TO_BOOK_VALUE}`);
		console.log(`Dividend Yield: ${stockData.CV.DIVIDEND_YEILD}%`);
		console.log(`52W High: ₹${stockData.CV["52_WEEK_HIGH"]}`);
		console.log(`52W Low: ₹${stockData.CV["52_WEEK_LOW"]}`);
		
		console.log("\n=== TTM FINANCIALS (Current Year) ===");
		console.log(`Revenue: ₹${stockData.TTM_cy.REVENUE} Cr`);
		console.log(`EBITDA: ₹${stockData.TTM_cy.EBITDA} Cr`);
		console.log(`Net Profit: ₹${stockData.TTM_cy.NET_PROFIT} Cr`);
		console.log(`EPS: ₹${stockData.TTM_cy.EPS}`);
		console.log(`Operating Profit Margin: ${stockData.TTM_cy.OPM}%`);
		
		console.log("\n=== PROFITABILITY RATIOS ===");
		console.log(`ROCE: ${stockData.roce_roe.ROCE}%`);
		console.log(`ROE: ${stockData.roce_roe.ROE}%`);
		console.log(`Company Type: ${stockData.roce_roe.TYPES_OF_COMPANY}`);
		
		console.log("\n=== LATEST SHAREHOLDING PATTERN ===");
		const shareholding = stockData.sHp;
		const years = shareholding.YEAR.split('|');
		const latestYear = years[0];
		const promoterHolding = shareholding.PROMOTER.split('|')[0];
		const publicHolding = shareholding.PUBLIC.split('|')[0];
		const diiHolding = shareholding.DII.split('|')[0];
		const fiiHolding = shareholding.FII.split('|')[0];
		
		console.log(`As of: ${latestYear}`);
		console.log(`Promoter: ${promoterHolding}%`);
		console.log(`Public: ${publicHolding}%`);
		console.log(`DII: ${diiHolding}%`);
		console.log(`FII: ${fiiHolding}%`);
		console.log(`Total Shareholders: ${shareholding.NO_OF_SHARE_HOLDERS.split('|')[0]}`);
		
		console.log("\n=== RECENT FINANCIAL PERFORMANCE ===");
		const revenueGrowthData = stockData.rNp_s;
		const revenueYears = revenueGrowthData.YEAR.split('|');
		const revenueValues = revenueGrowthData.REVENUE.split('|');
		const profitGrowth = revenueGrowthData.PROFIT_GROWTH.split('|');
		const revenueGrowth = revenueGrowthData.REVENUE_GROWTH.split('|');
		
		console.log(`Latest Revenue (${revenueYears[0]}): ₹${revenueValues[0]} Cr`);
		console.log(`Revenue Growth: ${revenueGrowth[0]}%`);
		console.log(`Profit Growth: ${profitGrowth[0]}%`);
		
		console.log("\n=== BALANCE SHEET HIGHLIGHTS (Latest Consolidated) ===");
		const balanceSheet = stockData.bs_c;
		const bsYears = balanceSheet.YEAR.split('|');
		const totalAssets = balanceSheet.TOTAL_ASSETS.split('|')[0];
		const totalEquity = balanceSheet.TOTAL_EQUITY.split('|')[0];
		const currentRatio = (
			parseFloat(balanceSheet.CURRENT_ASSETS.split('|')[0]) / 
			parseFloat(balanceSheet.CURRENT_LIABILITIES.split('|')[0])
		).toFixed(2);
		
		console.log(`As of: ${bsYears[0]}`);
		console.log(`Total Assets: ₹${totalAssets} Cr`);
		console.log(`Total Equity: ₹${totalEquity} Cr`);
		console.log(`Current Ratio: ${currentRatio}`);
		
		console.log("\n✅ Stock Fundamental Data fetched successfully!");
		
	} catch (error) {
		console.error("Error fetching stock fundamental data:", error);
	}
}