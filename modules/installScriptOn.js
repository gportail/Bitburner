export function installScriptOn(script, hostname, ns) {
	var aScripts = new Array();
	if (typeof script === "string") {
		aScripts.push(script);
	} else {
		aScripts = script;
	}
	for (let i = 0; i < aScripts.length; i++) {
		if (ns.fileExists(aScripts[i], hostname)) {
			ns.rm(aScripts[i], hostname);
		}
		ns.sleep(1000);
		ns.tprint("Copie de " + aScripts[i]);
		ns.scp(aScripts[i], "home", hostname);
	}
}