let maxPort = 2;

// les serveur executant simple_grow.js
let growScript = "simple_grow.js";
let growServer = ["avmnite-02h", "srv001", "srv002", "CSEC", "home"];
let growTarget;

export function install(ns, onServer) {
	// installation sur le serveur cible onServer
	var hl = ns.getServerRequiredHackingLevel(onServer);
	if (hl <= ns.getHackingLevel()) {
		ns.tprint("Installation sur " + onServer);

		// si on n'a pas l'acces root
		if (ns.hasRootAccess(onServer) === false) {
			// nombre de port devant etre ouvert
			var ports = ns.getServerNumPortsRequired(onServer);
			if (ports <= maxPort) {
				if (ports >= 1) { ns.brutessh(onServer); }
				if (ports >= 2) { ns.ftpcrack(onServer); }
				if (ports >= 3) { ns.relaysmtp(onServer); }
				if (ports >= 4) { ns.httpworm(onServer); }
				if (ports >= 5) { ns.sqlinject(onServer); }
				// on crack le serveur
				ns.nuke(onServer);
				ns.tprint(onServer + " is rooted");
			}
		}

		// si on a l'acces root on lance le hack
		if (ns.hasRootAccess(onServer)) {
			ns.tprint("will kill all script on " + onServer);
			// on kill tout les scripts
			ns.killall(onServer);
			// on met à jour les scripts sur le serveur
			if (ns.fileExists(growScript, onServer)) { ns.rm(growScript, onServer); }
			if (ns.scp(growScript, 'home', onServer) === false) {
				ns.tprint("        Erreur de copie de " + growScript);
			}
			// calcul du nombre de thread possible en fonction de la ram
			var ramNeeded = ns.getScriptRam(growScript);
			var ramAvailable = ns.getServerMaxRam(onServer);
			var thread = Math.floor(ramAvailable / ramNeeded);
			if (onServer === "home") thread = Math.max(thread - 2, 1);
			if (thread > 0) {
				ns.exec(growScript, onServer, thread, growTarget);
			}
		}
	}
}

export async function main(ns) {
	growTarget = ns.args[0];
	if (growTarget == undefined) {
		ns.tprint('Indiquer la cible du grow');
		return;
	}
	install(ns, growTarget);
	// pour chaque serveur
	for (var i = 0; i <= growServer.length; i++) {
		var target = growServer[i];
		install(ns, target);
		ns.sleep(3000);
	}
}