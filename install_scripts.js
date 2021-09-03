export async function main(ns) {
	// liste des serveur accessibles
	var targets = ns.scan(ns.getHostname());
	ns.tprint(targets);
	// pour chaque serveur
	for (var i = 0; i < targets.length; i++) {
		var target = targets[i];
		if (target === "home") { continue; }
		// niveau de hacking necessaire
		var hl = ns.getServerRequiredHackingLevel(target);
		// si on a le niveau necessaire
		if (hl <= ns.getHackingLevel()) {
			// si on n'a pas l'acces root
			if (ns.hasRootAccess(target) === false) {
				// nombre de port devant etre ouvert
				var ports = ns.getServerNumPortsRequired(target);
				if (ports >= 1) { ns.brutessh(target); }
				if (ports >= 2) { ns.ftpcrack(target); }
				if (ports >= 3) { ns.ftpcrack(target); }
				if (ports >= 4) { ns.ftpcrack(target); }
				if (ports >= 5) { ns.ftpcrack(target); }
				// on crack le serveur
				ns.nuke(target);
				ns.tprint(target + " is rooted");
			}
			// si on a l'acces root
			if (ns.hasRootAccess(target)) {
				ns.tprint("will kill all script");
				// on kill tout les scripts
				ns.killall(target);
				// on met à jour les scripts sur le serveur
				if (ns.fileExists('simple_hack.js', target)) { ns.rm('simple_hack.js', target); }
				if (ns.fileExists('install_scripts.js', target)) { ns.rm('install_scripts.js', target); }
				ns.scp('simple_hack.js', 'home', target);
				ns.scp('install_scripts.js', 'home', target);
				// on lance le script d'installation sur le serveur
				// ns.exec('install_scripts.js', target);
				// calcul du nombre de thread possible en fonction de la ram
				var ramNeeded = ns.getScriptRam('simple_hack.js');
				var ramAvailable = ns.getServerMaxRam(target);
				if (ramAvailable > 0) {
					var thread = Math.floor(ramAvailable / ramNeeded);
					if (thread > 0) {
						// ns.spawn('simple_hack.js', thread)
						ns.exec('simple_hack.js', target, thread);
					}
				}
			}
		}
		ns.sleep(3000);
	}
}