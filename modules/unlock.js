export async function unlock(hostname, ns) {
	if (ns.fileExists("BruteSSH.exe", "home")) {
		await ns.brutessh(hostname);
	}
	if (ns.fileExists("FTPCrack.exe", "home")) {
		await ns.ftpcrack(hostname);
	}
	if (ns.fileExists("relaySMTP.exe", "home")) {
		await ns.relaysmtp(hostname);
	}
	if (ns.fileExists("HTTPWorm.exe", "home")) {
		await ns.httpworm(hostname);
	}
	if (ns.fileExists("SQLInject.exe", "home")) {
		await ns.sqlinject(hostname);
	}

	try {
		ns.nuke(hostname);
	} catch {
		ns.tprint("Impossible de NUKE " + hostname);
	}
	if (ns.hasRootAccess(hostname)) {
		// ns.tprint(hostname + " ROOTED")
		return true;
	} else {
		// ns.tprint("FAILED : " + hostname + " NOT ROOTED")
		return false;
	}
}
export async function main(ns) {
	await unlock(ns.args[0], ns)
}