export function killScript(script, hostname, ns) {
	var processes = ns.ps(hostname);
	for (let i = 0; i < processes.length; ++i) {
		if (processes[i].filename == script) {
			ns.kill(processes[i].pid);
			ns.tprint("Kill process " + processes[i].pid + " - " + processes[i].filename);
		}
	}
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