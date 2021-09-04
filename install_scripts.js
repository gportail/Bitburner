import { installScriptOn } from "/modules/installScriptOn.js";

let theScripts = [
	'simple_grow.js', 
	'simple_hack.js', 
	'/modules/helper.js',
	'/modules/installScriptOn.js',
	'/modules/unlock.js',
	'/modules/classServer.js'];

export async function main(ns) {
	var target = ns.args[0];
	if (target == undefined) {
		ns.tprint("ERREUR : il manque la cible");
		return;
	}
	ns.tprint("Target = " + target);
	installScriptOn(theScripts, target, ns);
}