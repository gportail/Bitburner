import {unlock} from "/modules/unlock.js";

export async function main(ns) {
	var target = ns.args[0];
	if (target == undefined) {
		target = ns.getHostname();
	}
	ns.tprint("Target = " + target);
	if (!ns.hasRootAccess(target)) {
		await unlock(target, ns);
	}

	var script = ns.getRunningScript();
	var maxMoney = ns.getServerMaxMoney(target);
	var minSecLvl = ns.getServerMinSecurityLevel(target);

	var availableMoney;
	var secLvl;

	if (maxMoney == 0) { ns.exit(); }
	while (true) {
		secLvl = ns.getServerSecurityLevel(target);
		availableMoney = ns.getServerMoneyAvailable(target);

		if (secLvl > minSecLvl * 1.25) {
			await ns.weaken(target,{ threads: script.thread });
		} else if (availableMoney < maxMoney * 0.5) {
			await ns.grow(target,{ threads: script.thread });
		} else {
			await ns.hack(target,{ threads: script.thread });
		}
		ns.sleep(3000);
	}
}