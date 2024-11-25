import WebSocket from "ws";
import { EventEmitter } from "events";
import { LiveOrderUpdateConfig, LiveOrderUpdate } from "../types";

interface AuthMessage {
  LoginReq: {
    MsgCode: number;
    ClientId: string;
    Token: string;
  };
  UserType: "SELF" | "PARTNER";
  Secret?: string;
}

interface BaseEventMap {
  error: Error;
  authenticated: void;
  authError: Error;
  disconnected: { code: number; reason: string };
  orderUpdate: LiveOrderUpdate;
}

export class LiveOrderUpdateManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly config: LiveOrderUpdateConfig;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10; // Increased max attempts
  private readonly reconnectDelay = 3000; // Reduced initial delay to 3 seconds
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isIntentionalDisconnect = false;
  private isAuthenticated = false;
  private lastPongReceived: number = Date.now();
  private connectionAttemptTimeout: NodeJS.Timeout | null = null;

  constructor(config: LiveOrderUpdateConfig) {
    super();
    this.config = config;
  }

  public on<K extends keyof BaseEventMap>(
    event: K,
    listener: (arg: BaseEventMap[K]) => void
  ): this {
    return super.on(event, listener);
  }

  public emit<K extends keyof BaseEventMap>(
    event: K,
    arg: BaseEventMap[K]
  ): boolean {
    return super.emit(event, arg);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws?.readyState === WebSocket.OPEN) {
          console.log("WebSocket is already connected");
          return resolve();
        }

        const url = "wss://api-order-update.dhan.co";
        this.cleanup();

        this.ws = new WebSocket(url, {
          handshakeTimeout: 10000,
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        });

        // Set a timeout for the entire connection attempt
        this.connectionAttemptTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            const error = new Error("Connection attempt timed out");
            this.handleError(error);
            this.cleanup();
            reject(error);
          }
        }, 15000); // 15 second timeout for entire connection process

        this.ws.on("open", () => {
          console.log("WebSocket connection established for order updates");
          this.initializeConnection();
          this.reconnectAttempts = 0;

          if (this.config.onConnect) {
            this.config.onConnect();
          }

          resolve();
        });

        this.ws.on("message", (data: WebSocket.Data) => {
          this.resetHeartbeat();
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing order update message:", error);
            this.emit(
              "error",
              error instanceof Error ? error : new Error(String(error))
            );
          }
        });

        this.ws.on("pong", () => {
          this.lastPongReceived = Date.now();
          this.resetHeartbeat();
        });

        this.ws.on("close", (code: number, reason: string) => {
          const reasonStr = reason.toString();
          console.log(`WebSocket connection closed: ${code} - ${reasonStr}`);

          // Clear connection attempt timeout if it exists
          if (this.connectionAttemptTimeout) {
            clearTimeout(this.connectionAttemptTimeout);
            this.connectionAttemptTimeout = null;
          }

          this.isAuthenticated = false;
          this.cleanup();

          this.emit("disconnected", { code, reason: reasonStr });

          if (this.config.onDisconnect) {
            this.config.onDisconnect(code, reasonStr);
          }

          // Handle abnormal closure specifically
          if (code === 1006 || code === 1001) {
            console.log(
              "Abnormal closure detected, initiating immediate reconnection..."
            );
            this.immediateReconnect();
          } else if (!this.isIntentionalDisconnect) {
            this.attemptReconnect();
          }
        });

        this.ws.on("error", (error: Error) => {
          this.handleError(error);
          reject(error);
        });
      } catch (error) {
        this.cleanup();
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private initializeConnection(): void {
    if (this.connectionAttemptTimeout) {
      clearTimeout(this.connectionAttemptTimeout);
      this.connectionAttemptTimeout = null;
    }

    this.setupHeartbeat();
    this.sendAuthorizationMessage();
  }

  private setupHeartbeat(): void {
    // Clear existing intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }

    // Set up heartbeat checking every 5 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();

        // Check for connection health
        const timeSinceLastPong = Date.now() - this.lastPongReceived;
        if (timeSinceLastPong > 40000) {
          // 40 seconds without pong
          console.log(
            "Connection appears dead (no pong received). Forcing reconnection..."
          );
          this.forceReconnect();
        }
      }
    }, 5000);
  }

  private resetHeartbeat(): void {
    this.lastPongReceived = Date.now();
  }

  private forceReconnect(): void {
    console.log("Forcing reconnection...");
    this.cleanup();
    this.attemptReconnect();
  }

  private immediateReconnect(): void {
    if (this.isIntentionalDisconnect) return;

    console.log("Attempting immediate reconnection...");
    this.cleanup();
    this.connect().catch((error) => {
      console.error("Immediate reconnection failed:", error);
      this.attemptReconnect(); // Fall back to regular reconnection strategy
    });
  }

  private sendAuthorizationMessage(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log("Cannot send auth message - connection not open");
      return;
    }

    const authMessage: AuthMessage = {
      LoginReq: {
        MsgCode: 42,
        ClientId: this.config.clientId,
        Token: this.config.accessToken,
      },
      UserType: "SELF",
    };

    try {
      this.ws.send(JSON.stringify(authMessage));
    } catch (error) {
      console.error("Error sending auth message:", error);
      this.handleError(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private handleMessage(message: any): void {
    if (message.LoginResp) {
      this.handleAuthResponse(message.LoginResp);
      return;
    }

    if (message.Type === "order_alert" && message.Data) {
      const update: LiveOrderUpdate = message;
      this.emit("orderUpdate", update);

      if (this.config.onOrderUpdate) {
        this.config.onOrderUpdate(update);
      }
    }
  }

  private handleAuthResponse(response: any): void {
    if (response.Status === "Ok") {
      console.log("Authentication successful for order updates");
      this.isAuthenticated = true;
      this.emit("authenticated", undefined);
    } else {
      const error = new Error(
        `Authentication failed: ${response.Reason || "Unknown reason"}`
      );
      console.error(error.message);
      this.isAuthenticated = false;
      this.emit("authError", error);

      // Attempt reconnect on auth failure
      this.attemptReconnect();
    }
  }

  private handleError(error: Error): void {
    console.error("WebSocket error:", error);
    this.emit("error", error);

    if (this.config.onError) {
      this.config.onError(error);
    }
  }

  private async attemptReconnect(): Promise<void> {
    if (
      this.isIntentionalDisconnect ||
      this.reconnectAttempts >= this.maxReconnectAttempts ||
      this.ws?.readyState === WebSocket.OPEN
    ) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log(
          "Max reconnection attempts reached. Please reinitialize the connection manually."
        );
      }
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Exponential backoff with jitter
    const baseDelay = this.reconnectDelay;
    const maxDelay = 30000; // 30 seconds max delay
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, this.reconnectAttempts - 1),
      maxDelay
    );
    const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
    const delay = exponentialDelay + jitter;

    console.log(
      `Waiting ${Math.round(
        delay / 1000
      )} seconds before next reconnection attempt...`
    );

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error("Reconnection attempt failed:", error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      }
    }, delay);
  }

  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.connectionAttemptTimeout) {
      clearTimeout(this.connectionAttemptTimeout);
      this.connectionAttemptTimeout = null;
    }

    if (this.ws) {
      try {
        this.ws.terminate();
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
      this.ws = null;
    }
  }

  disconnect(): void {
    this.isIntentionalDisconnect = true;
    this.cleanup();
  }
}
