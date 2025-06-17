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
		if (instruments.length === 0) {
			throw new Error("No instruments provided for subscription");
		}

		console.log(`Subscribing to ${instruments.length} instruments with request code ${requestCode}`);

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
						this.emit("error", error);
					} else {
						console.log(`Successfully sent batch ${i + 1}/${batches.length}`);
					}
				});

				// Add small delay between batches to avoid overwhelming the server
				if (i < batches.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			} else {
				throw new Error(`Connection ${connectionId} is not ready for subscription`);
			}
		}

		console.log(`Successfully subscribed to ${instruments.length} instruments across ${batches.length} batches on connection ${connectionId}`);
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
			case 2:
				parsedData = this.parseTickerPacket(data);
				break;
			case 4:
				parsedData = this.parseQuotePacket(data);
				break;
			case 5:
				parsedData = this.parseOIDataPacket(data);
				break;
			case 6:
				parsedData = this.parsePrevClosePacket(data);
				break;
			case 8:
				parsedData = this.parseFullMarketDataPacket(data);
				break;
			case 7:
				parsedData = this.parseMarketStatusPacket(data);
				break;
			case 50:
				const disconnectionData = this.parseDisconnectionPacket(data);
				this.emit("disconnection", { connectionId, ...disconnectionData });
				return;
			default:
				console.warn(`Unknown response code: ${responseCode}`);
				return;
		}

		if (parsedData) {
			this.emit("message", { connectionId, data: parsedData });
		}
	}

	/**
	 * Create subscription packet
	 */
	private createSubscriptionPacket(instruments: Instrument[], requestCode: number): object {
		return {
			RequestCode: requestCode,
			InstrumentCount: instruments.length,
			InstrumentList: instruments.map(([exchangeSegment, securityId]) => ({
				ExchangeSegment: ExchangeSegment[exchangeSegment],
				SecurityId: securityId,
			})),
		};
	}

	/**
	 * Unsubscribe from instruments
	 */
	async unsubscribe(instruments: Instrument[]): Promise<void> {
		// Find which connections have these instruments and unsubscribe
		for (const [connectionId, connection] of this.connections) {
			if (connection.ws?.readyState === WebSocket.OPEN) {
				const batches = this.splitIntoBatches(instruments);
				
				for (const batch of batches) {
					const packet = this.createSubscriptionPacket(batch, 16); // Unsubscribe request code
					connection.ws.send(JSON.stringify(packet), (error) => {
						if (error) {
							console.error(`Error unsubscribing from connection ${connectionId}:`, error);
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
}
