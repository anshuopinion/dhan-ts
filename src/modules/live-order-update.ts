import WebSocket from "ws";
import { LiveOrderUpdateConfig, LiveOrderUpdate } from "../types";

export class LiveOrderUpdateManager {
  private ws: WebSocket | null = null;
  private readonly config: LiveOrderUpdateConfig;

  constructor(config: LiveOrderUpdateConfig) {
    this.config = config;
  }

  connect(): void {
    const url = `wss://api-order-update.dhan.co`;
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("WebSocket connection established");
      this.sendAuthorizationMessage();
      if (this.config.onConnect) {
        this.config.onConnect();
      }
    });

    this.ws.on("message", (data: WebSocket.Data) => {
      try {
        const update = JSON.parse(data.toString()) as LiveOrderUpdate;
        if (this.config.onOrderUpdate) {
          this.config.onOrderUpdate(update);
        }
      } catch (error) {
        console.error("Error parsing order update:", error);
      }
    });

    this.ws.on("close", (code: number, reason: string) => {
      console.log(`WebSocket connection closed: ${code} - ${reason}`);
      if (this.config.onDisconnect) {
        this.config.onDisconnect(code, reason);
      }
    });

    this.ws.on("error", (error: Error) => {
      console.error("WebSocket error:", error);
      if (this.config.onError) {
        this.config.onError(error);
      }
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

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
