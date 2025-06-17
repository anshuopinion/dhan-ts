import WebSocket from "ws";
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
	MarketDepthResponse,
	DepthLevel,
	FeedRequestCode,
	FeedResponseCode,
	TradingApiErrorCode,
	DataApiErrorCode,
	DhanApiError,
	FeedErrorResponse,
	FeedDisconnectionResponse,
} from "../types";

interface ConnectionInfo {
	ws: WebSocket | null;
	reconnectAttempts: number;
	reconnectTimeout: NodeJS.Timeout | null;
	pingInterval: NodeJS.Timeout | null;
	subscribedBatches: Map<number, Instrument[][]>; // requestCode -> batches of instruments
	connectionState: "disconnected" | "connecting" | "connected" | "reconnecting";
	isIntentionalClose: boolean;
	instrumentCount: number;
	connectionId: string; // Unique identifier for this connection
}

export class MultiConnectionLiveFeed extends EventEmitter {
	private readonly config: DhanConfig;
	private connections: Map<number, ConnectionInfo> = new Map();
	private readonly maxConnections: number = 5;
	private readonly maxReconnectAttempts: number = 10;
	private readonly baseReconnectDelay: number = 2000;
	private readonly maxReconnectDelay: number = 60000;
	private readonly maxInstrumentsPerConnection: number = 5000; // Dhan allows 5000 per connection
	private readonly maxInstrumentsPerMessage: number = 100; // Dhan limit per message
	private connectionCounter: number = 0;
	private instanceId: string;

	constructor(config: DhanConfig) {
		super();
		this.config = config;
		// Create unique instance ID to avoid conflicts with other instances
		this.instanceId = `mlf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Split instruments into batches of maximum 100 instruments per batch
	 */
	private splitIntoBatches(instruments: Instrument[]): Instrument[][] {
		const batches: Instrument[][] = [];
		for (let i = 0; i < instruments.length; i += this.maxInstrumentsPerMessage) {
			batches.push(instruments.slice(i, i + this.maxInstrumentsPerMessage));
		}
		return batches;
	}

	/**
	 * Get WebSocket URL with unique connection identifier
	 */
	private getWebSocketUrl(connectionId: number): string {
		const baseUrl = `wss://api-feed.dhan.co?version=2&token=${this.config.accessToken}&clientId=${this.config.clientId}&authType=2`;
		// Add connection identifier to prevent conflicts
		return `${baseUrl}&connId=${this.instanceId}_${connectionId}`;
	}

	/**
	 * Find or create a connection that can accommodate the instruments
	 */
	private findAvailableConnection(instrumentCount: number): number {
		// First, try to find an existing connection with enough capacity
		for (const [connId, info] of this.connections) {
			if (info.instrumentCount + instrumentCount <= this.maxInstrumentsPerConnection) {
				return connId;
			}
		}

		// If no existing connection has capacity, create a new one
		if (this.connections.size < this.maxConnections) {
			const newConnectionId = this.connectionCounter++;
			this.connections.set(newConnectionId, {
				ws: null,
				reconnectAttempts: 0,
				reconnectTimeout: null,
				pingInterval: null,
				subscribedBatches: new Map(),
				connectionState: "disconnected",
				isIntentionalClose: false,
				instrumentCount: 0,
				connectionId: `${this.instanceId}_${newConnectionId}`,
			});
			return newConnectionId;
		}

		throw new Error(`Cannot accommodate ${instrumentCount} instruments. Maximum connections (${this.maxConnections}) reached and no connection has sufficient capacity.`);
	}

	/**
	 * Subscribe to instruments with automatic batching and connection management
	 */
	async subscribe(instruments: Instrument[], requestCode: number): Promise<void> {
		// Validate inputs
		if (!instruments || instruments.length === 0) {
			const error = this.createDhanApiError("DataApi", DataApiErrorCode.INVALID_REQUEST, "No instruments provided for subscription");
			this.emit("error", { connectionId: -1, error });
			throw new Error("No instruments provided for subscription");
		}

		// Validate request code
		const validRequestCodes = [
			FeedRequestCode.SUBSCRIBE_TICKER,
			FeedRequestCode.SUBSCRIBE_QUOTE,
			FeedRequestCode.SUBSCRIBE_FULL,
			FeedRequestCode.SUBSCRIBE_MARKET_DEPTH,
		];
		
		if (!validRequestCodes.includes(requestCode)) {
			const error = this.createDhanApiError("DataApi", DataApiErrorCode.INVALID_REQUEST, `Invalid request code: ${requestCode}`);
			this.emit("error", { connectionId: -1, error });
			throw new Error(`Invalid request code: ${requestCode}. Valid codes: ${validRequestCodes.join(", ")}`);
		}

		// Validate instruments format
		for (let i = 0; i < instruments.length; i++) {
			const instrument = instruments[i];
			if (!Array.isArray(instrument) || instrument.length !== 2) {
				const error = this.createDhanApiError("DataApi", DataApiErrorCode.INVALID_REQUEST, `Invalid instrument format at index ${i}: ${JSON.stringify(instrument)}`);
				this.emit("error", { connectionId: -1, error });
				throw new Error(`Invalid instrument format at index ${i}. Expected [ExchangeSegment, SecurityId]`);
			}

			const [exchangeSegment, securityId] = instrument;
			if (typeof exchangeSegment !== 'number' || typeof securityId !== 'string') {
				const error = this.createDhanApiError("DataApi", DataApiErrorCode.INVALID_SECURITY_ID, `Invalid instrument data at index ${i}: exchangeSegment must be number, securityId must be string`);
				this.emit("error", { connectionId: -1, error });
				throw new Error(`Invalid instrument data at index ${i}: exchangeSegment must be number, securityId must be string`);
			}
		}

		// Check instrument limit
		if (instruments.length > (this.maxConnections * this.maxInstrumentsPerConnection)) {
			const maxAllowed = this.maxConnections * this.maxInstrumentsPerConnection;
			const error = this.createDhanApiError("DataApi", DataApiErrorCode.INSTRUMENT_LIMIT_EXCEEDED, `Requested ${instruments.length} instruments exceeds maximum limit of ${maxAllowed}`);
			this.emit("error", { connectionId: -1, error });
			throw new Error(`Requested ${instruments.length} instruments exceeds maximum limit of ${maxAllowed}`);
		}

		console.log(`Subscribing to ${instruments.length} instruments with request code ${requestCode}`);

		try {
			// Find or create a connection that can handle these instruments
			const connectionId = this.findAvailableConnection(instruments.length);
			const connection = this.connections.get(connectionId)!;

			// Split instruments into batches
			const batches = this.splitIntoBatches(instruments);
			console.log(`Split ${instruments.length} instruments into ${batches.length} batches`);

			// Store batches for this request code
			connection.subscribedBatches.set(requestCode, batches);
			connection.instrumentCount += instruments.length;

			// Ensure connection is established
			if (!connection.ws || connection.ws.readyState !== WebSocket.OPEN) {
				await this.connectToFeed(connectionId);
			}

			// Send subscription messages for each batch
			for (let i = 0; i < batches.length; i++) {
				const batch = batches[i];
				console.log(`Sending batch ${i + 1}/${batches.length} with ${batch.length} instruments`);
				
				const packet = this.createSubscriptionPacket(batch, requestCode);
				
				if (connection.ws && connection.ws.readyState === WebSocket.OPEN) {
					connection.ws.send(JSON.stringify(packet), (error) => {
						if (error) {
							console.error(`Error sending batch ${i + 1}:`, error);
							this.analyzeConnectionError(connectionId, error);
							this.emit("error", { connectionId, error });
						} else {
							console.log(`Successfully sent batch ${i + 1}/${batches.length}`);
						}
					});

					// Add small delay between batches to avoid overwhelming the server
					if (i < batches.length - 1) {
						await new Promise(resolve => setTimeout(resolve, 100));
					}
				} else {
					const error = this.createDhanApiError("DataApi", DataApiErrorCode.INTERNAL_SERVER_ERROR, `Connection ${connectionId} is not ready for subscription`);
					this.emit("error", { connectionId, error });
					throw new Error(`Connection ${connectionId} is not ready for subscription`);
				}
			}

			console.log(`Successfully subscribed to ${instruments.length} instruments across ${batches.length} batches on connection ${connectionId}`);
		} catch (error) {
			console.error("Subscription error:", error);
			if (error instanceof Error) {
				this.analyzeConnectionError(-1, error);
			}
			throw error;
		}
	}

	/**
	 * Connect to feed for a specific connection
	 */
	private async connectToFeed(connectionId: number): Promise<void> {
		const connection = this.connections.get(connectionId);
		if (!connection) {
			throw new Error(`Connection ${connectionId} not found`);
		}

		if (connection.connectionState === "connecting") {
			// Wait for ongoing connection attempt
			return new Promise((resolve, reject) => {
				const checkConnection = () => {
					if (connection.connectionState === "connected") {
						resolve();
					} else if (connection.connectionState === "disconnected") {
						reject(new Error(`Connection ${connectionId} failed to connect`));
					} else {
						setTimeout(checkConnection, 100);
					}
				};
				checkConnection();
			});
		}

		return new Promise((resolve, reject) => {
			try {
				connection.connectionState = "connecting";
				const wsUrl = this.getWebSocketUrl(connectionId);
				console.log(`Connecting to WebSocket for connection ${connectionId}: ${wsUrl}`);
				
				connection.ws = new WebSocket(wsUrl);

				const connectionTimeout = setTimeout(() => {
					if (connection.ws) {
						connection.ws.terminate();
					}
					connection.connectionState = "disconnected";
					reject(new Error(`Connection ${connectionId} timeout`));
				}, 10000);

				connection.ws.on("open", () => {
					clearTimeout(connectionTimeout);
					connection.connectionState = "connected";
					connection.reconnectAttempts = 0;
					console.log(`WebSocket connection ${connectionId} established successfully`);
					this.setupPingInterval(connectionId);
					this.emit("connect", { connectionId });
					resolve();
				});

				connection.ws.on("error", (error) => {
					clearTimeout(connectionTimeout);
					console.error(`WebSocket connection ${connectionId} error:`, error);
					connection.connectionState = "disconnected";
					
					// Check if error is related to authentication or API limits
					this.analyzeConnectionError(connectionId, error);
					
					this.handleConnectionError(connectionId, error);
					reject(error);
				});

				connection.ws.on("close", (code, reason) => {
					clearTimeout(connectionTimeout);
					connection.connectionState = "disconnected";
					console.log(`WebSocket connection ${connectionId} closed with code ${code} and reason: ${reason}`);
					this.emit("close", { connectionId, code, reason: reason.toString() });

					if (!connection.isIntentionalClose) {
						this.attemptReconnect(connectionId);
					}
				});

				connection.ws.on("message", (data: Buffer) => {
					try {
						this.handleMessage(connectionId, data);
					} catch (error) {
						console.error(`Error handling message from connection ${connectionId}:`, error);
						this.emit("error", error);
					}
				});

				connection.ws.on("pong", () => {
					// Connection is alive
					console.log(`Pong received from connection ${connectionId}`);
				});

			} catch (error) {
				connection.connectionState = "disconnected";
				reject(error);
			}
		});
	}

	/**
	 * Setup ping interval for a connection
	 */
	private setupPingInterval(connectionId: number): void {
		const connection = this.connections.get(connectionId);
		if (!connection) return;

		if (connection.pingInterval) {
			clearInterval(connection.pingInterval);
		}

		// Send ping every 30 seconds to keep connection alive
		connection.pingInterval = setInterval(() => {
			if (connection.ws?.readyState === WebSocket.OPEN) {
				connection.ws.ping();
			}
		}, 30000);
	}

	/**
	 * Handle connection errors
	 */
	private handleConnectionError(connectionId: number, error: Error): void {
		console.error(`Connection ${connectionId} error:`, error);
		this.emit("error", { connectionId, error });
	}

	/**
	 * Attempt to reconnect a specific connection
	 */
	private attemptReconnect(connectionId: number): void {
		const connection = this.connections.get(connectionId);
		if (!connection) return;

		if (connection.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error(`Max reconnection attempts reached for connection ${connectionId}`);
			this.emit("maxReconnectAttemptsReached", { connectionId });
			return;
		}

		connection.reconnectAttempts++;
		connection.connectionState = "reconnecting";
		
		const delay = this.getReconnectDelay(connection.reconnectAttempts);
		console.log(`Attempting to reconnect connection ${connectionId} in ${delay}ms (attempt ${connection.reconnectAttempts}/${this.maxReconnectAttempts})`);

		// Clear any existing timeout
		if (connection.reconnectTimeout) {
			clearTimeout(connection.reconnectTimeout);
		}

		connection.reconnectTimeout = setTimeout(async () => {
			try {
				this.cleanupConnection(connectionId, false);
				await this.connectToFeed(connectionId);

				// Resubscribe all batches
				if (connection.ws?.readyState === WebSocket.OPEN) {
					await this.resubscribeConnection(connectionId);
					console.log(`Successfully reconnected connection ${connectionId}`);
				}
			} catch (error) {
				console.error(`Reconnection attempt failed for connection ${connectionId}:`, error);
				this.handleConnectionError(connectionId, error as Error);
			}
		}, delay);
	}

	/**
	 * Resubscribe all instruments for a connection
	 */
	private async resubscribeConnection(connectionId: number): Promise<void> {
		const connection = this.connections.get(connectionId);
		if (!connection || !connection.ws || connection.ws.readyState !== WebSocket.OPEN) {
			return;
		}

		const subscriptions = Array.from(connection.subscribedBatches.entries());

		for (const [requestCode, batches] of subscriptions) {
			for (let i = 0; i < batches.length; i++) {
				const batch = batches[i];
				const packet = this.createSubscriptionPacket(batch, requestCode);
				
				connection.ws.send(JSON.stringify(packet), (error) => {
					if (error) {
						console.error(`Error resubscribing batch ${i + 1} for connection ${connectionId}:`, error);
					}
				});

				// Add delay between resubscriptions
				if (i < batches.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}

			// Add delay between different request codes
			await new Promise(resolve => setTimeout(resolve, 200));
		}
	}

	/**
	 * Get reconnection delay with exponential backoff
	 */
	private getReconnectDelay(attempts: number): number {
		const exponentialDelay = Math.min(this.baseReconnectDelay * Math.pow(2, attempts), this.maxReconnectDelay);
		const jitter = exponentialDelay * (0.75 + Math.random() * 0.5);
		return Math.floor(jitter);
	}

	/**
	 * Handle incoming messages
	 */
	private handleMessage(connectionId: number, data: Buffer): void {
		const responseCode = data.readUInt8(0);
		let parsedData: LiveFeedResponse | null = null;

		switch (responseCode) {
			case FeedResponseCode.TICKER:
				parsedData = this.parseTickerPacket(data);
				break;
			case FeedResponseCode.QUOTE:
				parsedData = this.parseQuotePacket(data);
				break;
			case FeedResponseCode.OI:
				parsedData = this.parseOIDataPacket(data);
				break;
			case FeedResponseCode.PREV_CLOSE:
				parsedData = this.parsePrevClosePacket(data);
				break;
			case FeedResponseCode.FULL:
				parsedData = this.parseFullMarketDataPacket(data);
				break;
			case FeedResponseCode.MARKET_STATUS:
				parsedData = this.parseMarketStatusPacket(data);
				break;
			case FeedResponseCode.FEED_DISCONNECT:
				const disconnectionData = this.parseDisconnectionPacket(data);
				this.handleFeedDisconnection(connectionId, disconnectionData);
				return;
			default:
				// Check if it's a JSON error response
				try {
					const jsonString = data.toString('utf8');
					const jsonData = JSON.parse(jsonString);
					
					// Handle JSON error responses
					if (jsonData.error || jsonData.errorCode) {
						this.handleJsonErrorResponse(connectionId, jsonData);
						return;
					}
				} catch (e) {
					// Not JSON, continue with binary error handling
				}

				// Handle binary error responses
				if (data.length >= 4) {
					const potentialErrorCode = data.readUInt16LE(2);
					if (potentialErrorCode >= 800 && potentialErrorCode <= 814) {
						this.handleDataApiError(connectionId, potentialErrorCode);
						return;
					}
				}

				console.warn(`Connection ${connectionId}: Unknown response code: ${responseCode}, data length: ${data.length}`);
				this.handleUnknownResponse(connectionId, responseCode, data);
				return;
		}

		if (parsedData) {
			this.emit("message", { connectionId, data: parsedData });
		}
	}

	/**
	 * Handle JSON error responses
	 */
	private handleJsonErrorResponse(connectionId: number, jsonData: any): void {
		const errorCode = jsonData.errorCode || jsonData.error?.code;
		const errorMessage = jsonData.errorMessage || jsonData.error?.message || jsonData.message;
		
		console.error(`Connection ${connectionId} JSON Error Response:`, jsonData);

		// Create error response
		const errorResponse: FeedErrorResponse = {
			type: "error",
			errorCode: errorCode || 0,
			errorMessage: errorMessage || "Unknown error",
			connectionId: connectionId.toString(),
			timestamp: Date.now(),
		};

		// Handle based on error code
		if (typeof errorCode === 'number' && errorCode >= 800 && errorCode <= 814) {
			this.handleDataApiError(connectionId, errorCode, jsonData);
		} else if (typeof errorCode === 'string' && errorCode.startsWith('DH-')) {
			this.handleTradingApiError(connectionId, errorCode, jsonData);
		} else {
			// Generic error handling
			this.emit("error", { connectionId, error: errorResponse });
		}

		this.emit("message", { connectionId, data: errorResponse });
	}

	/**
	 * Handle feed disconnection
	 */
	private handleFeedDisconnection(connectionId: number, disconnectionData: DisconnectionResponse): void {
		const feedDisconnection: FeedDisconnectionResponse = {
			type: "disconnection",
			errorCode: disconnectionData.errorCode,
			reason: disconnectionData.reason,
			connectionId: connectionId.toString(),
			timestamp: Date.now(),
		};

		console.warn(`Connection ${connectionId} Feed Disconnection [${disconnectionData.errorCode}]: ${disconnectionData.reason}`);

		// Handle specific disconnection error codes
		if (disconnectionData.errorCode >= 800 && disconnectionData.errorCode <= 814) {
			this.handleDataApiError(connectionId, disconnectionData.errorCode);
		}

		this.emit("disconnection", { connectionId, ...disconnectionData });
		this.emit("message", { connectionId, data: feedDisconnection });
	}

	/**
	 * Handle unknown responses
	 */
	private handleUnknownResponse(connectionId: number, responseCode: number, data: Buffer): void {
		const errorResponse: FeedErrorResponse = {
			type: "error",
			errorCode: responseCode,
			errorMessage: `Unknown response code: ${responseCode}`,
			connectionId: connectionId.toString(),
			timestamp: Date.now(),
		};

		this.emit("message", { connectionId, data: errorResponse });
	}

	/**
	 * Create subscription packet
	 */
	private createSubscriptionPacket(instruments: Instrument[], requestCode: number): object {
		return {
			RequestCode: requestCode,
			InstrumentCount: instruments.length,
			InstrumentList: instruments.map(([exchangeSegment, securityId]) => ({
				ExchangeSegment: exchangeSegment, // Use the enum value directly
				SecurityId: securityId,
			})),
		};
	}

	/**
	 * Unsubscribe from instruments
	 */
	async unsubscribe(instruments: Instrument[], requestCode?: number): Promise<void> {
		// Default to ticker unsubscribe if no request code provided
		const unsubscribeCode = requestCode || FeedRequestCode.UNSUBSCRIBE_TICKER;
		
		// Validate request code
		const validUnsubscribeCodes = [
			FeedRequestCode.UNSUBSCRIBE_TICKER,
			FeedRequestCode.UNSUBSCRIBE_QUOTE,
			FeedRequestCode.UNSUBSCRIBE_FULL,
			FeedRequestCode.UNSUBSCRIBE_MARKET_DEPTH,
		];
		
		if (!validUnsubscribeCodes.includes(unsubscribeCode)) {
			const error = this.createDhanApiError("DataApi", DataApiErrorCode.INVALID_REQUEST, `Invalid unsubscribe request code: ${unsubscribeCode}`);
			this.emit("error", { connectionId: -1, error });
			throw new Error(`Invalid unsubscribe request code: ${unsubscribeCode}. Valid codes: ${validUnsubscribeCodes.join(", ")}`);
		}

		// Find which connections have these instruments and unsubscribe
		for (const [connectionId, connection] of this.connections) {
			if (connection.ws?.readyState === WebSocket.OPEN) {
				const batches = this.splitIntoBatches(instruments);
				
				for (const batch of batches) {
					const packet = this.createSubscriptionPacket(batch, unsubscribeCode);
					connection.ws.send(JSON.stringify(packet), (error) => {
						if (error) {
							console.error(`Error unsubscribing from connection ${connectionId}:`, error);
							this.analyzeConnectionError(connectionId, error);
						}
					});
				}
			}
		}

		// Remove from stored subscriptions (simplified - you might want more sophisticated tracking)
		for (const [connectionId, connection] of this.connections) {
			connection.subscribedBatches.clear();
			connection.instrumentCount = 0;
		}
	}

	/**
	 * Close all connections
	 */
	close(): void {
		console.log("Closing all WebSocket connections");
		for (const [connectionId, connection] of this.connections) {
			connection.isIntentionalClose = true;
			this.cleanupConnection(connectionId, true);
		}
		this.connections.clear();
	}

	/**
	 * Cleanup a specific connection
	 */
	private cleanupConnection(connectionId: number, removeFromMap: boolean = false): void {
		const connection = this.connections.get(connectionId);
		if (!connection) return;

		if (connection.ws) {
			connection.ws.removeAllListeners();
			if (connection.ws.readyState === WebSocket.OPEN) {
				connection.ws.close();
			}
			connection.ws = null;
		}

		if (connection.reconnectTimeout) {
			clearTimeout(connection.reconnectTimeout);
			connection.reconnectTimeout = null;
		}

		if (connection.pingInterval) {
			clearInterval(connection.pingInterval);
			connection.pingInterval = null;
		}

		connection.connectionState = "disconnected";

		if (removeFromMap) {
			this.connections.delete(connectionId);
		}
	}

	/**
	 * Get connection status
	 */
	getConnectionStatus(): Array<{ connectionId: number; state: string; instrumentCount: number; connectionIdString: string }> {
		return Array.from(this.connections.entries()).map(([id, info]) => ({
			connectionId: id,
			state: info.connectionState,
			instrumentCount: info.instrumentCount,
			connectionIdString: info.connectionId,
		}));
	}

	// Parsing methods (same as in LiveFeed)
	private parseTickerPacket(data: Buffer): TickerResponse {
		return {
			type: "ticker",
			exchangeSegment: data.readUInt8(3),
			securityId: data.readUInt32LE(4),
			lastTradedPrice: data.readFloatLE(8),
			lastTradedTime: data.readUInt32LE(12),
		};
	}

	private parseQuotePacket(data: Buffer): QuoteResponse {
		return {
			type: "quote",
			exchangeSegment: data.readUInt8(3),
			securityId: data.readUInt32LE(4),
			lastTradedPrice: data.readFloatLE(8),
			lastTradedQuantity: data.readUInt16LE(12),
			lastTradedTime: data.readUInt32LE(14),
			averageTradePrice: data.readFloatLE(18),
			volumeTraded: data.readUInt32LE(22),
			totalSellQuantity: data.readUInt32LE(26),
			totalBuyQuantity: data.readUInt32LE(30),
			openPrice: data.readFloatLE(34),
			closePrice: data.readFloatLE(38),
			highPrice: data.readFloatLE(42),
			lowPrice: data.readFloatLE(46),
		};
	}

	private parseOIDataPacket(data: Buffer): OiDataResponse {
		return {
			type: "oi_data",
			exchangeSegment: data.readUInt8(3),
			securityId: data.readUInt32LE(4),
			openInterest: data.readUInt32LE(8),
		};
	}

	private parsePrevClosePacket(data: Buffer): PrevCloseResponse {
		return {
			type: "prev_close",
			exchangeSegment: data.readUInt8(3),
			securityId: data.readUInt32LE(4),
			previousClosePrice: data.readFloatLE(8),
			previousOpenInterest: data.readUInt32LE(12),
		};
	}

	private parseFullMarketDataPacket(data: Buffer): FullMarketDataResponse {
		// Parse market depth (5 levels, 20 bytes each)
		const buyDepth: DepthLevel[] = [];
		const sellDepth: DepthLevel[] = [];
		
		for (let i = 0; i < 5; i++) {
			const offset = 62 + (i * 20);
			const buyLevel: DepthLevel = {
				quantity: data.readUInt32LE(offset),
				orders: data.readUInt16LE(offset + 8),
				price: data.readFloatLE(offset + 12),
			};
			const sellLevel: DepthLevel = {
				quantity: data.readUInt32LE(offset + 4),
				orders: data.readUInt16LE(offset + 10),
				price: data.readFloatLE(offset + 16),
			};
			buyDepth.push(buyLevel);
			sellDepth.push(sellLevel);
		}

		return {
			type: "full",
			exchangeSegment: data.readUInt8(3),
			securityId: data.readUInt32LE(4),
			lastTradedPrice: data.readFloatLE(8),
			lastTradedQuantity: data.readUInt16LE(12),
			lastTradedTime: data.readUInt32LE(14),
			averageTradePrice: data.readFloatLE(18),
			volumeTraded: data.readUInt32LE(22),
			totalSellQuantity: data.readUInt32LE(26),
			totalBuyQuantity: data.readUInt32LE(30),
			openInterest: data.readUInt32LE(34),
			openInterestDayHigh: data.readUInt32LE(38),
			openInterestDayLow: data.readUInt32LE(42),
			openPrice: data.readFloatLE(46),
			closePrice: data.readFloatLE(50),
			highPrice: data.readFloatLE(54),
			lowPrice: data.readFloatLE(58),
			marketDepth: {
				buy: buyDepth,
				sell: sellDepth,
			},
		};
	}

	private parseMarketStatusPacket(data: Buffer): MarketStatusResponse {
		const statusCode = data.readUInt8(8);
		return {
			type: "market_status",
			status: statusCode === 7 ? "open" : "closed",
		};
	}

	private parseDisconnectionPacket(data: Buffer): DisconnectionResponse {
		return {
			errorCode: data.readUInt16LE(8),
			reason: `Disconnection code: ${data.readUInt16LE(8)}`,
		};
	}

	/**
	 * Create a Dhan API error object
	 */
	private createDhanApiError(
		errorType: "TradingApi" | "DataApi",
		code: string | number,
		message: string,
		details?: any
	): DhanApiError {
		return {
			errorType,
			code,
			message,
			details,
		};
	}

	/**
	 * Get error message for Trading API error codes
	 */
	private getTradingApiErrorMessage(code: string): string {
		switch (code) {
			case TradingApiErrorCode.INVALID_AUTHENTICATION:
				return "Client ID or user generated access token is invalid or expired.";
			case TradingApiErrorCode.INVALID_ACCESS:
				return "User has not subscribed to Data APIs or does not have access to Trading APIs. Kindly subscribe to Data APIs to be able to fetch Data.";
			case TradingApiErrorCode.USER_ACCOUNT:
				return "Errors related to User's Account. Check if the required segments are activated or other requirements are met.";
			case TradingApiErrorCode.RATE_LIMIT:
				return "Too many requests on server from single user breaching rate limits. Try throttling API calls.";
			case TradingApiErrorCode.INPUT_EXCEPTION:
				return "Missing required fields, bad values for parameters etc.";
			case TradingApiErrorCode.ORDER_ERROR:
				return "Incorrect request for order and cannot be processed.";
			case TradingApiErrorCode.DATA_ERROR:
				return "System is unable to fetch data due to incorrect parameters or no data present.";
			case TradingApiErrorCode.INTERNAL_SERVER_ERROR:
				return "Server was not able to process API request. This will only occur rarely.";
			case TradingApiErrorCode.NETWORK_ERROR:
				return "Network error where the API was unable to communicate with the backend system.";
			case TradingApiErrorCode.OTHERS:
				return "Error originating from other reasons.";
			default:
				return `Unknown Trading API error: ${code}`;
		}
	}

	/**
	 * Get error message for Data API error codes
	 */
	private getDataApiErrorMessage(code: number): string {
		switch (code) {
			case DataApiErrorCode.INTERNAL_SERVER_ERROR:
				return "Internal Server Error";
			case DataApiErrorCode.INSTRUMENT_LIMIT_EXCEEDED:
				return "Requested number of instruments exceeds limit";
			case DataApiErrorCode.TOO_MANY_REQUESTS:
				return "Too many requests or connections. Further requests may result in the user being blocked.";
			case DataApiErrorCode.DATA_APIS_NOT_SUBSCRIBED:
				return "Data APIs not subscribed";
			case DataApiErrorCode.ACCESS_TOKEN_EXPIRED:
				return "Access token is expired";
			case DataApiErrorCode.AUTHENTICATION_FAILED:
				return "Authentication Failed - Client ID or Access Token invalid";
			case DataApiErrorCode.ACCESS_TOKEN_INVALID:
				return "Access token is invalid";
			case DataApiErrorCode.CLIENT_ID_INVALID:
				return "Client ID is invalid";
			case DataApiErrorCode.INVALID_EXPIRY_DATE:
				return "Invalid Expiry Date";
			case DataApiErrorCode.INVALID_DATE_FORMAT:
				return "Invalid Date Format";
			case DataApiErrorCode.INVALID_SECURITY_ID:
				return "Invalid SecurityId";
			case DataApiErrorCode.INVALID_REQUEST:
				return "Invalid Request";
			default:
				return `Unknown Data API error: ${code}`;
		}
	}

	/**
	 * Handle Data API errors based on error codes
	 */
	private handleDataApiError(connectionId: number, errorCode: number, details?: any): void {
		const message = this.getDataApiErrorMessage(errorCode);
		const error = this.createDhanApiError("DataApi", errorCode, message, details);
		
		console.error(`Connection ${connectionId} Data API Error [${errorCode}]: ${message}`);
		
		// Handle critical errors that require connection closure
		if ([
			DataApiErrorCode.ACCESS_TOKEN_EXPIRED,
			DataApiErrorCode.AUTHENTICATION_FAILED,
			DataApiErrorCode.ACCESS_TOKEN_INVALID,
			DataApiErrorCode.CLIENT_ID_INVALID,
			DataApiErrorCode.DATA_APIS_NOT_SUBSCRIBED,
		].includes(errorCode)) {
			console.error(`Critical error for connection ${connectionId}. Closing connection.`);
			this.cleanupConnection(connectionId, false);
		}

		// Handle rate limiting
		if (errorCode === DataApiErrorCode.TOO_MANY_REQUESTS) {
			console.warn(`Rate limit exceeded for connection ${connectionId}. Implementing backoff strategy.`);
			const connection = this.connections.get(connectionId);
			if (connection) {
				connection.reconnectAttempts += 2; // Increase backoff
			}
		}

		this.emit("error", { connectionId, error });
	}

	/**
	 * Handle Trading API errors
	 */
	private handleTradingApiError(connectionId: number, errorCode: string, details?: any): void {
		const message = this.getTradingApiErrorMessage(errorCode);
		const error = this.createDhanApiError("TradingApi", errorCode, message, details);
		
		console.error(`Connection ${connectionId} Trading API Error [${errorCode}]: ${message}`);
		
		// Handle critical errors
		if ([
			TradingApiErrorCode.INVALID_AUTHENTICATION,
			TradingApiErrorCode.INVALID_ACCESS,
		].includes(errorCode as TradingApiErrorCode)) {
			console.error(`Critical error for connection ${connectionId}. Closing connection.`);
			this.cleanupConnection(connectionId, false);
		}

		// Handle rate limiting
		if (errorCode === TradingApiErrorCode.RATE_LIMIT) {
			console.warn(`Rate limit exceeded for connection ${connectionId}. Implementing backoff strategy.`);
			const connection = this.connections.get(connectionId);
			if (connection) {
				connection.reconnectAttempts += 3; // Aggressive backoff for rate limiting
			}
		}

		this.emit("error", { connectionId, error });
	}

	/**
	 * Analyze connection error to determine if it's API-related
	 */
	private analyzeConnectionError(connectionId: number, error: Error): void {
		const errorMessage = error.message.toLowerCase();
		
		// Check for authentication errors
		if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
			this.handleTradingApiError(connectionId, TradingApiErrorCode.INVALID_AUTHENTICATION);
		}
		// Check for access token expiry
		else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
			this.handleDataApiError(connectionId, DataApiErrorCode.ACCESS_TOKEN_EXPIRED);
		}
		// Check for rate limiting
		else if (errorMessage.includes('429') || errorMessage.includes('too many')) {
			this.handleDataApiError(connectionId, DataApiErrorCode.TOO_MANY_REQUESTS);
		}
		// Check for server errors
		else if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
			this.handleDataApiError(connectionId, DataApiErrorCode.INTERNAL_SERVER_ERROR);
		}
		// Check for network errors
		else if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('econnreset')) {
			this.handleTradingApiError(connectionId, TradingApiErrorCode.NETWORK_ERROR);
		}
	}
}
