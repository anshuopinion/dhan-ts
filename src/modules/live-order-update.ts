import WebSocket from "ws";
import { EventEmitter } from "events";
import { LiveOrderUpdateConfig, LiveOrderUpdate } from "../types";

export class LiveOrderUpdateManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly config: LiveOrderUpdateConfig;

  constructor(config: LiveOrderUpdateConfig) {
    super();
    this.config = config;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `wss://api-order-update.dhan.co`;
      this.ws = new WebSocket(url);

      this.ws.on("open", () => {
        console.log("WebSocket connection established for order updates");
        this.sendAuthorizationMessage();
        resolve();
      });

      this.ws.on("message", (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing order update message:", error);
          this.emit("error", error);
        }
      });

      this.ws.on("close", (code: number, reason: string) => {
        console.log(`WebSocket connection closed: ${code} - ${reason}`);
        this.emit("disconnected", { code, reason });
      });

      this.ws.on("error", (error: Error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
        reject(error);
      });
    });
  }

  private sendAuthorizationMessage(): void {
    if (!this.ws) return;

    const authMessage = {
      LoginReq: {
        MsgCode: "42",
        ClientId: this.config.clientId,
        Token: this.config.accessToken,
      },
      UserType: "SELF",
    };

    this.ws.send(JSON.stringify(authMessage));
  }

  private handleMessage(message: any): void {
    if (message.Type === "order_alert") {
      const update = message.Data as LiveOrderUpdate;
      this.emit("orderUpdate", update);
    } else if (message.Type === "auth_response") {
      this.handleAuthResponse(message);
    } else {
      console.log("Received unknown message type:", message.Type);
    }
  }

  private handleAuthResponse(message: any): void {
    if (message.Status === "success") {
      console.log("Authentication successful for order updates");
      this.emit("authenticated");
    } else {
      console.error("Authentication failed for order updates:", message.Reason);
      this.emit("authError", new Error(message.Reason));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
