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
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 60000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isIntentionalDisconnect = false;

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
        const url = "wss://api-order-update.dhan.co";

        this.cleanup();
        this.ws = new WebSocket(url, {
          handshakeTimeout: 10000,
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        });

        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            const error = new Error("Connection timeout");
            this.handleError(error);
            reject(error);
          }
        }, 10000);

        this.ws.on("open", () => {
          clearTimeout(connectionTimeout);
          console.log("WebSocket connection established for order updates");
          this.setupPingInterval();
          this.sendAuthorizationMessage();
          this.reconnectAttempts = 0;

          if (this.config.onConnect) {
            this.config.onConnect();
          }

          resolve();
        });

        this.ws.on("message", (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());

            this.handleMessage(message);
            if (!this.isIntentionalDisconnect) {
              this.attemptReconnect();
            }
          } catch (error) {
            console.error("Error parsing order update message:", error);
            this.emit(
              "error",
              error instanceof Error ? error : new Error(String(error))
            );
          }
        });

        this.ws.on("close", (code: number, reason: string) => {
          clearTimeout(connectionTimeout);
          const reasonStr = reason.toString();
          console.log(`WebSocket connection closed: ${code} - ${reasonStr}`);

          this.emit("disconnected", { code, reason: reasonStr });

          if (this.config.onDisconnect) {
            this.config.onDisconnect(code, reasonStr);
          }

          if (!this.isIntentionalDisconnect) {
            this.attemptReconnect();
          }
        });

        this.ws.on("error", (error: Error) => {
          clearTimeout(connectionTimeout);
          this.handleError(error);
          reject(error);
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private sendAuthorizationMessage(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const authMessage: AuthMessage = {
      LoginReq: {
        MsgCode: 42,
        ClientId: this.config.clientId,
        Token: this.config.accessToken,
      },
      UserType: "SELF",
    };

    this.ws.send(JSON.stringify(authMessage));
  }

  private handleMessage(message: any): void {
    // Handle login response
    if (message.LoginResp) {
      this.handleAuthResponse(message.LoginResp);
      return;
    }

    console.log(message);

    // Handle order updates
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
      this.emit("authenticated", undefined);
    } else {
      const error = new Error(
        `Authentication failed: ${response.Reason || "Unknown reason"}`
      );
      console.error(error.message);
      this.emit("authError", error);
    }
  }

  private handleError(error: Error): void {
    console.error("WebSocket error:", error);
    this.emit("error", error);

    if (this.config.onError) {
      this.config.onError(error);
    }

    if (!this.isIntentionalDisconnect) {
      this.attemptReconnect();
    }
  }

  private async attemptReconnect(): Promise<void> {
    if (
      this.isIntentionalDisconnect ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      console.log(
        "Max reconnection attempts reached or intentional disconnect"
      );
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error("Reconnection attempt failed:", error);
      }
    }, this.reconnectDelay);
  }

  private setupPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000);
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
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
