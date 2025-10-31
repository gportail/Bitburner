import { ScriptShare } from "./libs/constantes.js";

/** @param {NS} ns */
export async function main(ns) {
  // const shareScript = 'shareRam.js';
  var params = ns.flags([
    ['h', false], // aide
    ['k', false],  //kill du share
  ]);

  if (params['h']) {
    help(ns);
  }

  let killShare = params['k'];
  const host = ns.getHostname();
  if (killShare) {
    ns.kill(ScriptShare);
  } else {
    let availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host) - 32; // on garde toujour 32Go de libre
    let th = Math.floor(availableRam / ns.getScriptRam(ScriptShare, host)) - 4;  // on garde 4 fois la ram de shareRam.js de dispo
    if (th > 0) ns.run(ScriptShare, th);
  }
}
