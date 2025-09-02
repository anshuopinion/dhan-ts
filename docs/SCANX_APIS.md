# ScanX APIs Documentation

The ScanX APIs provide comprehensive stock analysis capabilities, offering both real-time market data and detailed fundamental analysis. These APIs are integrated into the Dhan TypeScript SDK as part of the free market data services.

## Table of Contents

- [Overview](#overview)
- [Stock Basic Details API](#stock-basic-details-api)
- [Stock Fundamental Data API](#stock-fundamental-data-api)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Data Structures](#data-structures)

## Overview

The ScanX APIs consist of two powerful endpoints:

1. **Stock Basic Details API** - Real-time market data and technical analysis
2. **Stock Fundamental Data API** - Comprehensive fundamental analysis and financial data

Both APIs are accessible through the `MarketData` class and provide extensive information for stock analysis and trading applications.

---

## Stock Basic Details API

### Endpoint
```
POST https://scanx.dhan.co/scanx/rtscrdt
```

### Purpose
Provides comprehensive real-time stock information including current price data, historical performance, technical indicators, and market structure details.

### Method Signature
```typescript
async getStockBasicDetails(request: StockBasicDetailsRequest): Promise<StockBasicDetailsResponse>
```

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `Seg` | number | Market segment (1 = NSE_EQ, 2 = NSE_FNO, etc.) |
| `SecId` | number | Security ID of the stock |

### Key Data Points

#### 🏢 **Basic Information**
- Company name and symbol
- ISIN code and exchange details
- Sector and sub-sector classification
- SEO-friendly identifiers

#### 📈 **Current Market Data**
- Last Traded Price (LTP)
- Open, High, Low, Close prices
- Volume and average trade price
- Price change (absolute and percentage)

#### 🔄 **Historical Performance**
Performance data across multiple timeframes:
- **Short-term**: 1 week, 2 weeks, 1 month
- **Medium-term**: 3 months, 6 months, 9 months
- **Long-term**: 1 year, 2 years, 3 years, 4 years, 5 years

Each timeframe includes:
- High and low prices
- Absolute change
- Percentage change

#### ⚡ **Technical Data**
- Circuit limits (upper and lower)
- Support and resistance levels (S1, S2, S3, R1, R2, R3)
- Pivot point
- Lot size and tick size
- Last trade time

#### 🏛️ **Market Structure**
- **Index Memberships**: All indices the stock belongs to
- **Market Depth**: Bid/ask prices, quantities, and order counts
- **Trading Statistics**: Total buy/sell quantities

### Response Example
```typescript
const stockDetails = await dhanClient.marketData.getStockBasicDetails({
  Seg: 1,
  SecId: 1476
});

console.log({
  company: stockDetails.d_sym,           // "IDBI Bank"
  symbol: stockDetails.sym,              // "IDBI"
  ltp: stockDetails.Ltp,                 // 87.05
  change: stockDetails.ch,               // 1.38
  changePercent: stockDetails.p_ch,      // 1.6108
  dayHigh: stockDetails.hg,              // 87.4
  dayLow: stockDetails.lo,               // 86.09
  volume: stockDetails.vol,              // 5817217
  sector: stockDetails.sec,              // "Banks"
  marketCap: stockDetails.atp,           // Average trade price
  indices: stockDetails.idx_lst          // Array of index memberships
});
```

---

## Stock Fundamental Data API

### Endpoint
```
POST https://scanx.dhan.co/scanx/fundamental
```

### Purpose
Provides comprehensive fundamental analysis including financial statements, ratios, shareholding patterns, and growth metrics for in-depth stock valuation.

### Method Signature
```typescript
async getStockFundamentals(request: StockFundamentalRequest): Promise<StockFundamentalResponse>
```

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `isins` | string[] | Array of ISIN codes for stocks |

### Key Data Categories

#### 🏢 **Company Overview (`CV`)**
- Company classification (Large/Mid/Small cap)
- Sector and industry details
- Market capitalization
- Book value and face value
- 52-week high/low prices
- Stock P/E ratio and P/B ratio
- Dividend yield

#### 📊 **TTM Financials**
**Current Year (`TTM_cy`) & Same Year (`TTM_sy`)**
- Revenue and sales figures
- EBITDA and operating profit
- Net profit and EPS
- Operating margin (OPM)
- Interest and tax expenses
- Depreciation

#### 📋 **Financial Statements**

##### **Balance Sheet** (`bs_c` - Consolidated, `bs_s` - Standalone)
- **Assets**: Current assets, fixed assets, investments, CWIP
- **Liabilities**: Current liabilities, non-current liabilities
- **Equity**: Share capital, reserves & surplus, total equity
- **Key Metrics**: Total assets, equity ratios
- **Historical Data**: 11 years of annual data

##### **Cash Flow Statement** (`cF_c` - Consolidated, `cF_s` - Standalone)
- Operating activities cash flow
- Investing activities (including capex)
- Financing activities
- Net cash flow
- Changes in working capital

##### **Income Statement** (`incomeStat_*`)
**Multiple Views Available:**
- `incomeStat_cy`: Current year annual
- `incomeStat_sy`: Same year annual
- `incomeStat_cq`: Current quarter
- `incomeStat_sq`: Same quarter

**Includes:**
- Revenue trends and growth
- Profit margins analysis
- Expense breakdown
- Tax analysis
- EPS trends

#### 📈 **Performance Metrics**

##### **Profitability Ratios (`roce_roe`)**
- ROCE (Return on Capital Employed)
- ROE (Return on Equity)
- Company type (Consolidated/Standalone)

##### **Growth Analysis (`rNp_s`)**
- Revenue growth trends
- Profit growth analysis
- Year-over-year comparisons
- Growth rates calculation

#### 👥 **Shareholding Pattern (`sHp`)**
**Ownership Structure:**
- Promoter shareholding percentage
- Public shareholding
- Domestic Institutional Investors (DII)
- Foreign Institutional Investors (FII)
- Government holding
- Other categories
- Total number of shareholders

**Historical Tracking:**
- Quarterly shareholding changes
- Ownership trend analysis

### Response Example
```typescript
const fundamentals = await dhanClient.marketData.getStockFundamentals({
  isins: ["INE500L01026"]
});

const stock = fundamentals.data[0];

console.log({
  // Company Overview
  sector: stock.CV.SECTOR,                    // "Chemicals"
  industry: stock.CV.INDUSTRY_NAME,           // "Specialty Chemicals"
  marketCap: stock.CV.MARKET_CAP,            // "3513.40" (in Cr)
  pe: stock.CV.STOCK_PE,                     // "26.4"
  
  // TTM Financials
  revenue: stock.TTM_cy.REVENUE,             // "2309.1" (in Cr)
  netProfit: stock.TTM_cy.NET_PROFIT,        // "185.3" (in Cr)
  eps: stock.TTM_cy.EPS,                     // "13.4"
  margin: stock.TTM_cy.OPM,                  // "12.6" (%)
  
  // Profitability
  roce: stock.roce_roe.ROCE,                 // "10.57" (%)
  roe: stock.roce_roe.ROE,                   // "5.82" (%)
  
  // Latest Shareholding (first entry in pipe-separated data)
  promoter: stock.sHp.PROMOTER.split('|')[0], // "55.03" (%)
  public: stock.sHp.PUBLIC.split('|')[0],     // "19.42" (%)
  fii: stock.sHp.FII.split('|')[0],          // "6.96" (%)
  
  // Growth Metrics
  revenueGrowth: stock.rNp_s.REVENUE_GROWTH.split('|')[0], // "20.92" (%)
  profitGrowth: stock.rNp_s.PROFIT_GROWTH.split('|')[0]    // "-114.38" (%)
});
```

---

## Usage Examples

### Basic Implementation

```typescript
import { DhanHqClient, StockBasicDetailsRequest, StockFundamentalRequest } from 'dhan-ts';

const dhanClient = new DhanHqClient({
  accessToken: 'your-token',
  clientId: 'your-client-id',
  env: DhanEnv.PROD
});

// Get stock basic details
async function getStockOverview(securityId: number) {
  const request: StockBasicDetailsRequest = {
    Seg: 1,
    SecId: securityId
  };
  
  const details = await dhanClient.marketData.getStockBasicDetails(request);
  
  return {
    name: details.d_sym,
    price: details.Ltp,
    change: details.p_ch,
    volume: details.vol,
    high52w: details.h1y,
    low52w: details.l1y
  };
}

// Get fundamental analysis
async function getFundamentalAnalysis(isin: string) {
  const request: StockFundamentalRequest = {
    isins: [isin]
  };
  
  const fundamentals = await dhanClient.marketData.getStockFundamentals(request);
  const stock = fundamentals.data[0];
  
  return {
    valuation: {
      marketCap: stock.CV.MARKET_CAP,
      pe: stock.CV.STOCK_PE,
      pb: stock.CV.PRICE_TO_BOOK_VALUE,
      dividendYield: stock.CV.DIVIDEND_YEILD
    },
    financials: {
      revenue: stock.TTM_cy.REVENUE,
      profit: stock.TTM_cy.NET_PROFIT,
      eps: stock.TTM_cy.EPS,
      margin: stock.TTM_cy.OPM
    },
    ratios: {
      roce: stock.roce_roe.ROCE,
      roe: stock.roce_roe.ROE
    }
  };
}
```

### Advanced Analysis

```typescript
// Comprehensive stock screener
async function analyzeStock(securityId: number, isin: string) {
  // Get both basic details and fundamentals
  const [basicDetails, fundamentals] = await Promise.all([
    dhanClient.marketData.getStockBasicDetails({ Seg: 1, SecId: securityId }),
    dhanClient.marketData.getStockFundamentals({ isins: [isin] })
  ]);
  
  const stock = fundamentals.data[0];
  
  // Technical Analysis
  const technicalScore = calculateTechnicalScore(basicDetails);
  
  // Fundamental Analysis
  const fundamentalScore = calculateFundamentalScore(stock);
  
  // Growth Analysis
  const growthMetrics = analyzeGrowthTrends(stock.rNp_s, stock.incomeStat_cy);
  
  return {
    symbol: basicDetails.sym,
    company: basicDetails.d_sym,
    scores: {
      technical: technicalScore,
      fundamental: fundamentalScore,
      overall: (technicalScore + fundamentalScore) / 2
    },
    metrics: {
      currentPrice: basicDetails.Ltp,
      targetPrice: calculateTargetPrice(stock),
      upside: calculateUpside(basicDetails.Ltp, stock),
      riskLevel: assessRisk(basicDetails, stock)
    },
    growth: growthMetrics,
    recommendation: generateRecommendation(technicalScore, fundamentalScore)
  };
}

function calculateTechnicalScore(details: StockBasicDetailsResponse): number {
  let score = 50; // Base score
  
  // Price momentum
  if (details.p_ch > 0) score += 10;
  if (details.p_ch > 5) score += 10;
  
  // Volume analysis
  const avgVolume = details.vol_t_td;
  if (details.vol > avgVolume * 1.5) score += 15;
  
  // 52-week position
  const current = details.Ltp;
  const high52w = details.h1y;
  const low52w = details.l1y;
  const position = (current - low52w) / (high52w - low52w);
  
  if (position > 0.8) score += 15;
  else if (position > 0.6) score += 10;
  else if (position < 0.2) score -= 15;
  
  return Math.min(Math.max(score, 0), 100);
}

function calculateFundamentalScore(stock: StockFundamentalData): number {
  let score = 50;
  
  // Profitability
  const roce = parseFloat(stock.roce_roe.ROCE);
  const roe = parseFloat(stock.roce_roe.ROE);
  
  if (roce > 15) score += 15;
  else if (roce > 10) score += 10;
  
  if (roe > 15) score += 15;
  else if (roe > 10) score += 10;
  
  // Growth
  const revenueGrowth = parseFloat(stock.rNp_s.REVENUE_GROWTH.split('|')[0]);
  const profitGrowth = parseFloat(stock.rNp_s.PROFIT_GROWTH.split('|')[0]);
  
  if (revenueGrowth > 15) score += 10;
  if (profitGrowth > 15) score += 10;
  
  // Valuation
  const pe = parseFloat(stock.CV.STOCK_PE);
  if (pe > 0 && pe < 15) score += 10;
  else if (pe > 30) score -= 10;
  
  return Math.min(Math.max(score, 0), 100);
}
```

### Portfolio Analysis

```typescript
// Analyze multiple stocks for portfolio construction
async function analyzePortfolio(stockList: Array<{secId: number, isin: string, weight: number}>) {
  const analyses = await Promise.all(
    stockList.map(stock => analyzeStock(stock.secId, stock.isin))
  );
  
  const portfolioMetrics = {
    totalStocks: stockList.length,
    averageScore: analyses.reduce((sum, analysis) => sum + analysis.scores.overall, 0) / analyses.length,
    sectorDiversification: calculateSectorDiversification(analyses),
    riskProfile: calculatePortfolioRisk(analyses, stockList),
    expectedReturns: calculateExpectedReturns(analyses, stockList)
  };
  
  return {
    stocks: analyses,
    portfolio: portfolioMetrics,
    recommendations: generatePortfolioRecommendations(analyses, portfolioMetrics)
  };
}
```

---

## Error Handling

Both APIs include comprehensive error handling:

```typescript
try {
  const stockDetails = await dhanClient.marketData.getStockBasicDetails({
    Seg: 1,
    SecId: 1476
  });
  
  // Process successful response
  console.log(stockDetails);
  
} catch (error) {
  if (error.message.includes('ScanX API Error')) {
    console.error('API returned an error:', error.message);
  } else if (error.message.includes('No stock data found')) {
    console.error('Invalid security ID provided');
  } else {
    console.error('Network or other error:', error.message);
  }
}
```

### Common Error Scenarios

1. **Invalid Security ID**: When `SecId` doesn't exist
2. **Invalid Segment**: When `Seg` parameter is incorrect
3. **Invalid ISIN**: When ISIN code is not found
4. **Network Issues**: Connection problems or timeouts
5. **API Rate Limits**: Too many requests in short time

---

## Data Structures

### Key Interface Definitions

```typescript
// Request interfaces
interface StockBasicDetailsRequest {
  Seg: number;    // Market segment
  SecId: number;  // Security identifier
}

interface StockFundamentalRequest {
  isins: string[]; // Array of ISIN codes
}

// Response interfaces contain extensive data structures
// See TypeScript definitions for complete interface details
```

### Data Format Notes

1. **Pipe-separated Historical Data**: Many fields contain historical data separated by `|` (pipe) characters, with the first value being the most recent.

2. **Numerical Precision**: Financial figures are typically in crores for Indian stocks.

3. **Date Formats**: Dates are in YYYYMM format (e.g., "202506" for June 2025).

4. **Percentage Values**: Most percentage values are already calculated and ready to display.

---

## Best Practices

### 1. **Efficient Data Usage**
```typescript
// Cache frequently accessed data
const cache = new Map();

async function getCachedStockDetails(secId: number) {
  const cacheKey = `stock_${secId}`;
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
      return cached.data;
    }
  }
  
  const data = await dhanClient.marketData.getStockBasicDetails({
    Seg: 1,
    SecId: secId
  });
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

### 2. **Batch Processing**
```typescript
// Process multiple stocks efficiently
async function processBatch(isins: string[]) {
  // ScanX fundamental API supports multiple ISINs
  const fundamentals = await dhanClient.marketData.getStockFundamentals({
    isins: isins
  });
  
  return fundamentals.data.map(stock => ({
    isin: stock.isin,
    score: calculateFundamentalScore(stock),
    recommendation: generateRecommendation(stock)
  }));
}
```

### 3. **Data Parsing Utilities**
```typescript
// Helper functions for parsing pipe-separated data
function parseHistoricalData(pipeData: string, periods: number = 5) {
  return pipeData.split('|')
    .slice(0, periods)
    .map(value => parseFloat(value));
}

function getLatestValue(pipeData: string): number {
  return parseFloat(pipeData.split('|')[0]);
}

function parseShareholdingTrend(shareholding: ShareholdingPattern) {
  const years = shareholding.YEAR.split('|');
  const promoter = shareholding.PROMOTER.split('|').map(Number);
  const public_holding = shareholding.PUBLIC.split('|').map(Number);
  
  return years.map((year, index) => ({
    year,
    promoter: promoter[index],
    public: public_holding[index],
    total_shareholders: parseInt(shareholding.NO_OF_SHARE_HOLDERS.split('|')[index])
  }));
}
```

---

## Integration Examples

### React Component Example

```tsx
import React, { useState, useEffect } from 'react';

interface StockAnalysisProps {
  securityId: number;
  isin: string;
}

const StockAnalysisComponent: React.FC<StockAnalysisProps> = ({ securityId, isin }) => {
  const [basicDetails, setBasicDetails] = useState(null);
  const [fundamentals, setFundamentals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [details, funds] = await Promise.all([
          dhanClient.marketData.getStockBasicDetails({ Seg: 1, SecId: securityId }),
          dhanClient.marketData.getStockFundamentals({ isins: [isin] })
        ]);
        
        setBasicDetails(details);
        setFundamentals(funds.data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [securityId, isin]);

  if (loading) return <div>Loading stock analysis...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="stock-analysis">
      <h2>{basicDetails.d_sym} ({basicDetails.sym})</h2>
      
      <div className="price-section">
        <h3>Current Price: ₹{basicDetails.Ltp}</h3>
        <p className={basicDetails.ch > 0 ? 'positive' : 'negative'}>
          {basicDetails.ch > 0 ? '+' : ''}₹{basicDetails.ch} ({basicDetails.p_ch}%)
        </p>
      </div>
      
      <div className="fundamental-metrics">
        <h3>Key Metrics</h3>
        <div className="metrics-grid">
          <div>P/E Ratio: {fundamentals.CV.STOCK_PE}</div>
          <div>Market Cap: ₹{fundamentals.CV.MARKET_CAP} Cr</div>
          <div>ROE: {fundamentals.roce_roe.ROE}%</div>
          <div>ROCE: {fundamentals.roce_roe.ROCE}%</div>
        </div>
      </div>
      
      <div className="performance-section">
        <h3>Performance</h3>
        <div className="performance-grid">
          <div>1 Week: {basicDetails.chp1wk}%</div>
          <div>1 Month: {basicDetails.chp1m}%</div>
          <div>1 Year: {basicDetails.chp1y}%</div>
        </div>
      </div>
    </div>
  );
};
```

---

This documentation provides comprehensive coverage of both ScanX APIs, including practical examples, best practices, and integration patterns. The APIs offer extensive capabilities for building sophisticated stock analysis and trading applications.