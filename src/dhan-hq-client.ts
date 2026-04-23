import https from "node:https";
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
import { Scanner } from "./modules/scanner-feed";
import { Authentication } from "./modules/authentication";
import { SuperOrders } from "./modules/super-orders";
import { OptionChain } from "./modules/option-chain";
import { ExpiredOptionData } from "./modules/expired-option-data";

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
  public readonly scanner: Scanner;
  public readonly authentication: Authentication;
  public readonly superOrders: SuperOrders;
  public readonly optionChain: OptionChain;
  public readonly expiredOptionData: ExpiredOptionData;

  constructor(config: DhanConfig) {
    const baseURL =
      config.env === "PROD"
        ? "https://api.dhan.co"
        : "https://sandbox.dhan.co/v2";

    this.axiosInstance = axios.create({
      baseURL,
      // Force IPv4. DHAN's API-IP whitelist is IPv4-only; letting Node fall
      // back to IPv6 produces DH-905 "Invalid IP" errors.
      httpsAgent: new https.Agent({ keepAlive: true, family: 4 } as https.AgentOptions),
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
    this.marketData = new MarketData(this.axiosInstance, config);
    this.foreverOrders = new ForeverOrders(this.axiosInstance);
    this.tradersControl = new TradersControl(this.axiosInstance);
    this.statements = new Statements(this.axiosInstance);
    this.scanner = new Scanner();
    this.authentication = new Authentication(this.axiosInstance);
    this.superOrders = new SuperOrders(this.axiosInstance);
    this.optionChain = new OptionChain(this.axiosInstance);
    this.expiredOptionData = new ExpiredOptionData(this.axiosInstance);
  }
}
