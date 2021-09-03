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