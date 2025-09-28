import { ScriptShare } from "./libs/constantes.js";

/** @param {NS} ns */
export async function main(ns) {
  // const shareScript = 'shareRam.js';
  const host = ns.getHostname();
  ns.kill(ScriptShare);
  let availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host) - 32; // on garde toujour 32Go de libre
  let th = Math.floor(availableRam / ns.getScriptRam(ScriptShare, host)) - 4;  // on garde 4 fois la ram de shareRam.js de dispo
  if (th > 0) ns.run(ScriptShare, th);
}
