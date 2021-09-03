let ns;

export default class classServer {
	constructor(hostname, lns) {
		this.hostname = hostname;
		ns = lns;
	}

	get rooted() { return ns.hasRootAccess(this.hostname); }
	get maxRam() { return ns.getServerMaxRam(this.hostname); }
	get maxMoney() { return ns.getServerMaxMoney(this.hostname); }
	get money() { return ns.getServerMoneyAvailable(this.hostname); }
	get growTime() { return ns.getGrowTime(this.hostname); }
	get securityLvl() { return ns.getServerSecurityLevel(this.hostname); }
	get minSecurityLvl() { return ns.getServerMinSecurityLevel(this.hostname); }
	get hackLvl() { return ns.getServerRequiredHackingLevel(this.hostname); }
	get ports() { return ns.getServerNumPortsRequired(this.hostname); }
	get hackChance() { return ns.hackChance(this.hostname); }
	get hackTime() { return ns.getHackTime(this.hostname); }
	get weakenTime() { return ns.getWeakenTime(this.hostname); }
	scan() { return ns.scan(this.hostname); }
	pctMoney() { return this.money / this.maxMoney; }

	// version formate des proprietes
	get fhostname() { return ns.sprintf("%-20s", this.hostname); }
	get frooted() { return ns.sprintf("%5t", this.rooted); }
	get fmaxRam() { return ns.sprintf("%3d", this.maxRam); }
	get fmaxMoney() { return ns.sprintf("%10s", ns.nFormat(this.maxMoney, "    0.00a")); }
	get fmoney() { return ns.sprintf("%10s", ns.nFormat(this.money, "    0.00a")); }
	get fpctMoney() { return ns.sprintf("%6s", ns.nFormat(this.pctMoney(), "0.00%")); }
	get fgrowTime() { return ns.sprintf("%6s", ns.nFormat(this.growTime, "    0") + "s"); }
	get fsecurityLvl() { return ns.sprintf("%7s", ns.nFormat(this.securityLvl, "0.00")); }
	get fminSecurityLvl() { return ns.sprintf("%7s", ns.nFormat(this.minSecurityLvl, "0.00")); }
	get fhackLvl() { return ns.sprintf("%4d", this.hackLvl); }
	get fports() { return ns.sprintf("%2d", this.ports); }
	get fhackChance() { return ns.sprintf("%6s", ns.nFormat(this.hackChance, "0.00%")); }
	get fhackTime() {return ns.sprintf("%6s", ns.nFormat(this.hackTime, "    0") + "s"); }
	get fweakenTime() {return ns.sprintf("%6s", ns.nFormat(this.weakenTime, "    0") + "s"); }
}