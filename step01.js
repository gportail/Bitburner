import { deepscan } from "deepscan.js";
import { execScriptMaxThread } from "/modules/helper.js";
import { unlock } from "/modules/unlock.js";
import { installScriptOn } from "/modules/installScriptOn.js";

let theScripts = ['simple_grow.js', 'simple_hack.js', '/modules/helper.js'];
let growScript = 'simple_grow.js';
let hackScript = 'simple_hack.js';

export async function main(ns) {
	var host = ns.getHostname();
	var servers = deepscan(host, ns);

	ns.tprint("Unlock les serveurs trouvé.")
	while (true) {
		for (var i = 0; i < servers.length; i++) {
			var s = servers[i];
			if (s.hostname == 'home') continue;
			if (!s.rooted) {
				if (await unlock(s.hostname, ns)) {
					ns.tprint(s.hostname + " ROOTED");
				};
			}
			if (s.rooted) {
				if (!ns.fileExists(growScript, s.hostname)) {
					//killScript(execScript, s.hostname, ns);			
					ns.killall(s.hostname);
					installScriptOn(theScripts, s.hostname, ns);
				}
				if (s.maxMoney > 0) {
					if (s.isHackable) {
						if (!ns.isRunning(hackScript, s.hostname)) {
							ns.killall(s.hostname);
							execScriptMaxThread(hackScript, s.hostname, ns);
						}
					} else {
						if ((!ns.isRunning(growScript, s.hostname)) && (!ns.isRunning(hackScript, s.hostname))) {
							ns.killall(s.hostname);
							execScriptMaxThread(growScript, s.hostname, ns);
						}
					}
				}
				ns.sleep(3000);
			}
		}
		await ns.sleep(30000);
	}
	// ns.spawn('step01.js', 1);
}