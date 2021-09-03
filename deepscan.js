import classServer from "/modules/classServer.js";

let servers = new Array();

function isInServerList(server) {
	for (var i = 0; i < servers.length; i++) {
		if (servers[i].hostname === server) {
			return true;
		}
	}
	return false;
}

function readServer(server, ns) {
	//ns.tprint("readServer : server = " + server);
	var srv = new classServer(server, ns);
	servers.push(srv);
	var targets = srv.scan();
	for (var i = 0; i < targets.length; i++) {
		var target = targets[i];
		if (isInServerList(target) === false) {
			readServer(target, ns);
		}
	}
}

export function deepscan(fromServer, ns) {
	var srv = new classServer(fromServer, ns);
	servers = new Array();
	servers.push(srv);

	var targets = srv.scan();
	for (var i = 0; i < targets.length; i++) {
		var target = targets[i];
		readServer(target, ns);
		ns.sleep(1000);
	}
	return servers;
}

export async function main(ns) {
	ns.tprint(deepscan(ns.getHostname(), ns));
}