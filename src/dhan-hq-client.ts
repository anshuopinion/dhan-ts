import axios, { AxiosInstance } from "axios";
import { DhanConfig } from "./types";
import { Orders } from "./modules/orders";
import { Portfolio } from "./modules/portfolio";
import { Funds } from "./modules/funds";
import { EDIS } from "./modules/edis";
import { MarketData } from "./modules/market-data";
import { ForeverOrders } from "./modules/forever-orders";
import { TradersControl } from "./modules/traders-control";
import { Statements } from "./modules/statements";

export class DhanHqClient {
  private readonly axiosInstance: AxiosInstance;
  public readonly orders: Orders;
  public readonly portfolio: Portfolio;
  public readonly funds: Funds;
  public readonly edis: EDIS;
  public readonly marketData: MarketData;
  public readonly foreverOrders: ForeverOrders;
  public readonly tradersControl: TradersControl;
  public readonly statements: Statements;

  constructor(config: DhanConfig) {
    const baseURL =
      config.env === "PROD" ? "https://api.dhan.co" : "https://api.dhan.co";

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "access-token": config.accessToken,
        "client-id": config.clientId,
      },
    });

    this.orders = new Orders(this.axiosInstance);
    this.portfolio = new Portfolio(this.axiosInstance);
    this.funds = new Funds(this.axiosInstance);
    this.edis = new EDIS(this.axiosInstance);
    this.marketData = new MarketData(this.axiosInstance);
    this.foreverOrders = new ForeverOrders(this.axiosInstance);
    this.tradersControl = new TradersControl(this.axiosInstance);
    this.statements = new Statements(this.axiosInstance);
  }
}
