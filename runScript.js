import { killScript, installScriptOn, execScriptMaxThread } from "/modules/helper.js";

let theScript = 'simple_hack.js';
let hostname = "n00dles";

export async function main(ns) {
	killScript(theScript, hostname, ns);
	installScriptOn(theScript, hostname, ns);
	installScriptOn("/modules/helper.js", hostname, ns);
	execScriptMaxThread(theScript, hostname, ns);
}