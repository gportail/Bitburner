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

	}
	if (ns.hasRootAccess(hostname)) {
		// ns.tprint(hostname + " ROOTED")
		return true;
	} else {
		// ns.tprint("FAILED : " + hostname + " NOT ROOTED")
		return false;
	}
}

export function killScript(script, hostname, ns) {
	var processes = ns.ps(hostname);
	for (let i = 0; i < processes.length; ++i) {
		if (processes[i].filename == script) {
			ns.kill(processes[i].pid);
			ns.tprint("Kill process " + processes[i].pid + " - " + processes[i].filename);
		}
	}
}

/**
 * script string|array
 */
export function installScriptOn(script, hostname, ns) {
	var aScripts = new Array();
	if (typeof script === "string") {
		aScripts.push(script);
	} else {
		aScripts = [...script]
	}
	for (let i = 0; i < aScripts.length; i++) {
		if (ns.fileExists(aScripts[i], hostname)) {
			ns.rm(aScripts[i], hostname);
		}
	}
	ns.scp(aScripts, "home", hostname);
}

export function execScriptMaxThread(script, hostname, ns) {
	// calcul du nombre de thread possible en fonction de la ram
	var ramNeeded = ns.getScriptRam(script);
	var ramAvailable = ns.getServerMaxRam(hostname);
	if (ramAvailable > 0) {
		var thread = Math.floor(ramAvailable / ramNeeded);
		if (thread > 0) {
			ns.exec(script, hostname, thread);
		}
	}
}

export function main(ns) {

}