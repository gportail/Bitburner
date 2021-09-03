let servers = new Array();
let maxPort = 3;
let script = "simple_hack.js";

export function install(ns, onServer, fromServer) {
	servers.push(onServer);
	// installation sur le serveur cible onServer
	var hl = ns.getServerRequiredHackingLevel(onServer);
	if (hl <= ns.getHackingLevel()) {
		ns.tprint("Installation sur " + onServer);

		// si on n'a pas l'acces root
		if (ns.hasRootAccess(onServer) === false) {
			ns.exec("./modules/unlock.js",onServer);
		}

		// si on a l'acces root on lance le hack
		if (ns.hasRootAccess(onServer)) {
			ns.tprint("will kill all script");
			// on kill tout les scripts
			ns.killall(onServer);
			// on met à jour les scripts sur le serveur
			if (ns.fileExists(script, onServer)) { ns.rm(script, onServer); }
			if (ns.scp(script, 'home', onServer)===false){
				ns.tprint("        Erreur de copie de simple_hack.js");
			}
			// calcul du nombre de thread possible en fonction de la ram
			var ramNeeded = ns.getScriptRam(script);
			var ramAvailable = ns.getServerMaxRam(onServer);
			var thread = Math.floor(ramAvailable / ramNeeded);
			ns.exec(script, onServer, thread);
		}

		// si on a l'acces root on install les serveur enfant
		if (ns.hasRootAccess(onServer)) {
			// parcour des server enfants
			var targets = ns.scan(onServer);

			for (var i = 0; i < targets.length; i++) {
				var target = targets[i];
				if (servers.indexOf(target) < 0) {
					// niveau de hacking necessaire
					var hl = ns.getServerRequiredHackingLevel(target);
					// si on a le niveau necessaire on installe
					if (hl <= ns.getHackingLevel()) {
						install(ns, target, onServer);
						await await ns.sleep(3000);
					}
				}
			}
		}
	}
}

export async function main(ns) {
	// liste des serveur accessibles depuis le serveur actuel
	var targets = ns.scan(ns.getHostname());
	servers = new Array();
	servers.push(ns.getHostname());

	// pour chaque serveur
	for (var i = 0; i < targets.length; i++) {
		var target = targets[i];

		install(ns, target, ns.getHostname());
		await ns.sleep(3000);
	}
	ns.tprint(servers);
}