import {deepscan} from "deepscan.js";

export async function main(ns) {
	//var servers = deepscan(ns.getHostname(), ns);
	var host = ns.getHostname();
	var servers = deepscan(host, ns);

	var sort = ns.args[0];
	if (sort == undefined) {
		sort = "hackLvl";
	}
	ns.tprint("Sort by " + sort);

	switch (sort) {
		case "hackLvl":
			/**
			 * Sort by hackLvl 
			 */
			ns.tprint("Sorting by " + sort);
			servers.SortByHackLevel();
			break;
		case "maxMoney":
			/**
			 * Sort by maxMoney
			 */
			ns.tprint("Sorting by " + sort);
			servers.SortByMaxMoney();
			break;
		case "maxRam":
			/**
			 * Sort by maxRam
			 */
			ns.tprint("Sorting by " + sort);
			servers.SortByMaxRam();
			break;
	}

	//ns.tprint("servers.length = " + servers.length);
	var padChr = '=';
	var fmt = "%-20s|%5s|%4s|%2s|%4s|%10s|%10s|%6s|%6s|%6s|%6s|%7s|%7s|%6s|";
	var s = ns.sprintf(fmt,
		'Serveur',
		'root',
		'RAM',
		'Pt',
		'Hack',
		'Max $  ',
		'Curr.$  ',
		' % $ ',
		'Grow',
		'Hack',
		'Weak',
		'Sec Lvl',
		'Min Sec',
		'Hack%');
	ns.tprint(s);
	s = ns.sprintf(fmt,
		''.padStart(20, padChr),
		''.padStart(5, padChr),
		''.padStart(3, padChr),
		''.padStart(2, padChr),
		''.padStart(4, padChr),
		''.padStart(10, padChr),
		''.padStart(10, padChr),
		''.padStart(6, padChr),
		''.padStart(6, padChr),
		''.padStart(6, padChr),
		''.padStart(6, padChr),
		''.padStart(7, padChr),
		''.padStart(7, padChr),
		''.padStart(6, padChr)
		);
	ns.tprint(s);

	for (var i = 0; i < servers.length; i++) {
		s = servers[i];
		if ((s.hackLvl <= ns.getHackingLevel()) || (s.rooted)) {
			ns.tprint(ns.sprintf("%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|",
				s.fhostname,
				s.frooted,
				s.fmaxRam,
				s.fports,
				s.fhackLvl,
				s.fmaxMoney,
				s.fmoney,
				s.fpctMoney,
				s.fgrowTime,
				s.fhackTime,
				s.fweakenTime,
				s.fsecurityLvl,
				s.fminSecurityLvl,
				s.fhackChance
				));
		}
	}
	//ns.tprint(servers);
}