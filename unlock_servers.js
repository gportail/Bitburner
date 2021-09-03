import {deepscan} from "deepscan.js";
import {unlock} from "/modules/unlock.js";

export async function main(ns) {
	var servers = deepscan(ns.getHostname(), ns);

	servers.sort(function(a, b) {
		if (a.hackLvl < b.hackLvl) return -1;
		if (a.hackLvl > b.hackLvl) return 1;
		return 0;
	});

	for (var i = 0; i < servers.length; i++) {
		s = servers[i];
		await unlock(s, ns);
	}
}