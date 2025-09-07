import {DhanHqClient} from "../src";
import {KillSwitchStatus} from "../src/types";

export async function demoTradersControl(dhanClient: DhanHqClient) {
	console.log("\nDemonstrating Traders Control API:");

	// Set kill switch
	const killSwitchResponse = await dhanClient.tradersControl.setKillSwitch(KillSwitchStatus.ACTIVATE);
	console.log("Kill switch response:", killSwitchResponse);
}