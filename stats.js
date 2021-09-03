import {deepscan} from "deepscan.js";

export async function main(ns) {
	var servers = deepscan(ns.getHostname(), ns);

	servers.sort(function(a, b) {
		if (a.hackLvl < b.hackLvl) return -1;
		if (a.hackLvl > b.hackLvl) return 1;
		return 0;
	});
	//ns.tprint("servers.length = " + servers.length);
	var padChr = '=';
	var fmt = "%-20s|%5s|%3s|%2s|%4s|%10s|%10s|%6s|%6s|%6s|%6s|%7s|%7s|%6s|";
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
		if (s.hackLvl <= ns.getHackingLevel()) {
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