import { killScript, execScriptMaxThread } from "/modules/helper.js";
import { installScriptOn } from "/modules/installScriptOn.js";

let theScript = 'simple_grow.js';
let hostname = "fulcrumtech";

export async function main(ns) {
	killScript(theScript, hostname, ns);
	//	installScriptOn(theScript, hostname, ns);
	//	installScriptOn("/modules/helper.js", hostname, ns);
	execScriptMaxThread(theScript, hostname, ns);
}