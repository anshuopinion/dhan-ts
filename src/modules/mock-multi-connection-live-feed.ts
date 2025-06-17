import { EventEmitter } from "events";
import {
	DhanConfig,
	LiveFeedResponse,
	DisconnectionResponse,
	Instrument,
	ExchangeSegment,
	TickerResponse,
	QuoteResponse,
	OiDataResponse,
	PrevCloseResponse,
	MarketStatusResponse,
	FullMarketDataResponse,
	DepthLevel,
} from "../types";

interface MockConnectionInfo {
	connectionId: string;
	instrumentCount: number;
	subscribedBatches: Map<number, Instrument[][]>;
	isActive: boolean;
	mockInterval: NodeJS.Timeout | null;
}

interface MockStockData {
	instrument: Instrument;
	basePrice: number;
	currentPrice: number;
	volume: number;
	high: number;
	low: number;
	lastTradeTime: number;
	volatility: number; // How much the price can change
}

export class MockMultiConnectionLiveFeed extends EventEmitter {
	private readonly config: DhanConfig;
	private connections: Map<number, MockConnectionInfo> = new Map();
	private readonly maxConnections: number = 5;
	private readonly maxInstrumentsPerConnection: number = 5000;
	private readonly maxInstrumentsPerMessage: number = 100;
	private connectionCounter: number = 0;
	private instanceId: string;
	
	// Mock data storage
	private mockStockData: Map<string, MockStockData> = new Map();
	private isRunning: boolean = false;
	private marketOpenTime: number = 9 * 60 + 15; // 9:15 AM in minutes
	private marketCloseTime: number = 15 * 60 + 30; // 3:30 PM in minutes

	constructor(config: DhanConfig) {
		super();
		this.config = config;
		this.instanceId = `mock_mlf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		console.log("🎭 MockMultiConnectionLiveFeed initialized for testing");
	}

	/**
	 * Create a unique key for an instrument
	 */
	private createInstrumentKey(instrument: Instrument): string {
		return `${instrument[0]}_${instrument[1]}`;
	}

	/**
	 * Generate realistic base price for a stock
	 */
	private generateBasePrice(): number {
		const priceRanges = [
			{ min: 10, max: 50, weight: 0.3 },    // Penny stocks
			{ min: 50, max: 200, weight: 0.4 },   // Small/Mid cap
			{ min: 200, max: 1000, weight: 0.2 }, // Large cap
			{ min: 1000, max: 5000, weight: 0.1 } // Premium stocks
		];

		const random = Math.random();
		let cumulativeWeight = 0;
		
		for (const range of priceRanges) {
			cumulativeWeight += range.weight;
			if (random <= cumulativeWeight) {
				return Math.random() * (range.max - range.min) + range.min;
			}
		}
		
		return 100; // Default
	}

	/**
	 * Initialize mock data for instruments
	 */
	private initializeMockData(instruments: Instrument[]) {
		instruments.forEach(instrument => {
			const key = this.createInstrumentKey(instrument);
			
			if (!this.mockStockData.has(key)) {
				const basePrice = this.generateBasePrice();
				const volatility = 0.5 + Math.random() * 2; // 0.5% to 2.5% volatility
				
				this.mockStockData.set(key, {
					instrument,
					basePrice,
					currentPrice: basePrice,
					volume: Math.floor(Math.random() * 100000) + 1000,
					high: basePrice * (1 + Math.random() * 0.05), // Up to 5% higher
					low: basePrice * (1 - Math.random() * 0.05),  // Up to 5% lower
					lastTradeTime: Date.now(),
					volatility,
				});
			}
		});
	}

	/**
	 * Split instruments into batches
	 */
	private splitIntoBatches(instruments: Instrument[]): Instrument[][] {
		const batches: Instrument[][] = [];
		for (let i = 0; i < instruments.length; i += this.maxInstrumentsPerMessage) {
			batches.push(instruments.slice(i, i + this.maxInstrumentsPerMessage));
		}
		return batches;
	}

	/**
	 * Find or create a connection
	 */
	private findAvailableConnection(instrumentCount: number): number {
		// Find existing connection with capacity
		for (const [connId, info] of this.connections) {
			if (info.instrumentCount + instrumentCount <= this.maxInstrumentsPerConnection) {
				return connId;
			}
		}

		// Create new connection if possible
		if (this.connections.size < this.maxConnections) {
			const newConnectionId = this.connectionCounter++;
			this.connections.set(newConnectionId, {
				connectionId: `${this.instanceId}_${newConnectionId}`,
				instrumentCount: 0,
				subscribedBatches: new Map(),
				isActive: false,
				mockInterval: null,
			});
			return newConnectionId;
		}

		throw new Error(`Cannot accommodate ${instrumentCount} instruments. Maximum connections reached.`);
	}

	/**
	 * Subscribe to instruments - Mock version
	 */
	async subscribe(instruments: Instrument[], requestCode: number): Promise<void> {
		if (instruments.length === 0) {
			throw new Error("No instruments provided for subscription");
		}

		console.log(`🎭 Mock: Subscribing to ${instruments.length} instruments with request code ${requestCode}`);

		// Find or create connection
		const connectionId = this.findAvailableConnection(instruments.length);
		const connection = this.connections.get(connectionId)!;

		// Split into batches
		const batches = this.splitIntoBatches(instruments);
		console.log(`🎭 Mock: Split ${instruments.length} instruments into ${batches.length} batches`);

		// Store batches
		connection.subscribedBatches.set(requestCode, batches);
		connection.instrumentCount += instruments.length;

		// Initialize mock data
		this.initializeMockData(instruments);

		// Simulate connection establishment
		await this.simulateConnection(connectionId);

		// Start generating mock data
		this.startMockDataGeneration(connectionId, requestCode);

		console.log(`🎭 Mock: Successfully subscribed to ${instruments.length} instruments on connection ${connectionId}`);
	}

	/**
	 * Simulate connection establishment
	 */
	private async simulateConnection(connectionId: number): Promise<void> {
		const connection = this.connections.get(connectionId)!;
		
		if (!connection.isActive) {
			// Simulate connection delay
			await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
			
			connection.isActive = true;
			console.log(`🎭 Mock: Connection ${connectionId} established`);
			this.emit("connect", { connectionId });
		}
	}

	/**
	 * Start generating mock market data
	 */
	private startMockDataGeneration(connectionId: number, requestCode: number) {
		const connection = this.connections.get(connectionId);
		if (!connection) return;

		// Clear existing interval
		if (connection.mockInterval) {
			clearInterval(connection.mockInterval);
		}

		// Generate data every 100-500ms (realistic market speed)
		connection.mockInterval = setInterval(() => {
			if (!connection.isActive) return;

			const batches = connection.subscribedBatches.get(requestCode);
			if (!batches) return;

			// Pick random instruments to generate data for
			const allInstruments: Instrument[] = [];
			batches.forEach(batch => allInstruments.push(...batch));
			const numUpdates = Math.floor(Math.random() * 5) + 1; // 1-5 updates per interval
			
			for (let i = 0; i < numUpdates && i < allInstruments.length; i++) {
				const randomIndex = Math.floor(Math.random() * allInstruments.length);
				const instrument = allInstruments[randomIndex];
				this.generateMockData(connectionId, instrument, requestCode);
			}
		}, 100 + Math.random() * 400);
	}

	/**
	 * Generate realistic mock market data
	 */
	private generateMockData(connectionId: number, instrument: Instrument, requestCode: number) {
		const key = this.createInstrumentKey(instrument);
		const stockData = this.mockStockData.get(key);
		if (!stockData) return;

		// Simulate price movement
		const priceChange = (Math.random() - 0.5) * 2 * stockData.volatility * 0.01;
		const newPrice = stockData.currentPrice * (1 + priceChange);
		
		// Keep price within reasonable bounds
		const maxPrice = stockData.basePrice * 1.10; // Max 10% from base
		const minPrice = stockData.basePrice * 0.90; // Min 10% from base
		stockData.currentPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

		// Update high/low
		if (stockData.currentPrice > stockData.high) {
			stockData.high = stockData.currentPrice;
		}
		if (stockData.currentPrice < stockData.low) {
			stockData.low = stockData.currentPrice;
		}

		// Update volume
		stockData.volume += Math.floor(Math.random() * 1000) + 100;
		stockData.lastTradeTime = Date.now();

		// Generate appropriate response based on request code
		let mockResponse: LiveFeedResponse;

		switch (requestCode) {
			case 15: // Ticker data
				mockResponse = this.generateTickerResponse(instrument, stockData);
				break;
			case 4: // Quote data
				mockResponse = this.generateQuoteResponse(instrument, stockData);
				break;
			case 8: // Full market data
				mockResponse = this.generateFullResponse(instrument, stockData);
				break;
			default:
				mockResponse = this.generateTickerResponse(instrument, stockData);
		}

		// Emit the mock data
		this.emit("message", { connectionId, data: mockResponse });
	}

	/**
	 * Generate mock ticker response
	 */
	private generateTickerResponse(instrument: Instrument, stockData: MockStockData): TickerResponse {
		return {
			type: "ticker",
			exchangeSegment: instrument[0],
			securityId: parseInt(instrument[1]),
			lastTradedPrice: parseFloat(stockData.currentPrice.toFixed(2)),
			lastTradedTime: stockData.lastTradeTime,
		};
	}

	/**
	 * Generate mock quote response
	 */
	private generateQuoteResponse(instrument: Instrument, stockData: MockStockData): QuoteResponse {
		return {
			type: "quote",
			exchangeSegment: instrument[0],
			securityId: parseInt(instrument[1]),
			lastTradedPrice: parseFloat(stockData.currentPrice.toFixed(2)),
			lastTradedQuantity: Math.floor(Math.random() * 1000) + 100,
			lastTradedTime: stockData.lastTradeTime,
			averageTradePrice: parseFloat(((stockData.high + stockData.low) / 2).toFixed(2)),
			volumeTraded: stockData.volume,
			totalBuyQuantity: Math.floor(Math.random() * 10000) + 5000,
			totalSellQuantity: Math.floor(Math.random() * 10000) + 5000,
			openPrice: parseFloat(stockData.basePrice.toFixed(2)),
			highPrice: parseFloat(stockData.high.toFixed(2)),
			lowPrice: parseFloat(stockData.low.toFixed(2)),
			closePrice: parseFloat(stockData.basePrice.toFixed(2)), // Previous close
		};
	}

	/**
	 * Generate mock full market data response
	 */
	private generateFullResponse(instrument: Instrument, stockData: MockStockData): FullMarketDataResponse {
		// Generate mock market depth
		const buyDepth: DepthLevel[] = [];
		const sellDepth: DepthLevel[] = [];
		
		for (let i = 0; i < 5; i++) {
			buyDepth.push({
				quantity: Math.floor(Math.random() * 5000) + 500,
				orders: Math.floor(Math.random() * 20) + 5,
				price: parseFloat((stockData.currentPrice - (i + 1) * 0.5).toFixed(2)),
			});
			
			sellDepth.push({
				quantity: Math.floor(Math.random() * 5000) + 500,
				orders: Math.floor(Math.random() * 20) + 5,
				price: parseFloat((stockData.currentPrice + (i + 1) * 0.5).toFixed(2)),
			});
		}

		return {
			type: "full",
			exchangeSegment: instrument[0],
			securityId: parseInt(instrument[1]),
			lastTradedPrice: parseFloat(stockData.currentPrice.toFixed(2)),
			lastTradedQuantity: Math.floor(Math.random() * 1000) + 100,
			lastTradedTime: stockData.lastTradeTime,
			averageTradePrice: parseFloat(((stockData.high + stockData.low) / 2).toFixed(2)),
			volumeTraded: stockData.volume,
			totalBuyQuantity: Math.floor(Math.random() * 10000) + 5000,
			totalSellQuantity: Math.floor(Math.random() * 10000) + 5000,
			openInterest: Math.floor(Math.random() * 50000) + 10000,
			openInterestDayHigh: Math.floor(Math.random() * 60000) + 15000,
			openInterestDayLow: Math.floor(Math.random() * 40000) + 5000,
			openPrice: parseFloat(stockData.basePrice.toFixed(2)),
			closePrice: parseFloat(stockData.basePrice.toFixed(2)),
			highPrice: parseFloat(stockData.high.toFixed(2)),
			lowPrice: parseFloat(stockData.low.toFixed(2)),
			marketDepth: {
				buy: buyDepth,
				sell: sellDepth,
			},
		};
	}

	/**
	 * Unsubscribe from instruments
	 */
	async unsubscribe(instruments: Instrument[]): Promise<void> {
		console.log(`🎭 Mock: Unsubscribing from ${instruments.length} instruments`);
		
		// Remove from all connections
		for (const [connectionId, connection] of this.connections) {
			connection.subscribedBatches.clear();
			connection.instrumentCount = 0;
		}
	}

	/**
	 * Get connection status
	 */
	getConnectionStatus(): Array<{ connectionId: number; state: string; instrumentCount: number; connectionIdString: string }> {
		return Array.from(this.connections.entries()).map(([id, info]) => ({
			connectionId: id,
			state: info.isActive ? "connected" : "disconnected",
			instrumentCount: info.instrumentCount,
			connectionIdString: info.connectionId,
		}));
	}

	/**
	 * Close all mock connections
	 */
	close(): void {
		console.log("🎭 Mock: Closing all connections");
		
		for (const [connectionId, connection] of this.connections) {
			if (connection.mockInterval) {
				clearInterval(connection.mockInterval);
				connection.mockInterval = null;
			}
			connection.isActive = false;
		}
		
		this.connections.clear();
		this.mockStockData.clear();
	}

	/**
	 * Simulate market events (optional)
	 */
	simulateMarketEvent(eventType: "high_volume" | "price_spike" | "crash") {
		console.log(`🎭 Mock: Simulating ${eventType} event`);
		
		const allStocks = Array.from(this.mockStockData.values());
		const affectedStocks = allStocks.slice(0, Math.floor(allStocks.length * 0.1)); // Affect 10% of stocks
		
		affectedStocks.forEach(stock => {
			switch (eventType) {
				case "high_volume":
					stock.volume += Math.floor(Math.random() * 500000) + 100000;
					break;
				case "price_spike":
					stock.currentPrice *= 1.05 + Math.random() * 0.05; // 5-10% spike
					break;
				case "crash":
					stock.currentPrice *= 0.90 - Math.random() * 0.05; // 5-10% drop
					break;
			}
		});
	}
}
