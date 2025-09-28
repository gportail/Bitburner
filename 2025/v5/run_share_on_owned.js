import * as C from "./libs/constantes.js";

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['k', false],  //kill du share
  ]);

  if (params['h']) {
    help(ns);
  }

  let killShare = params['k'];

  // const shareScript = 'shareRam.js';
  // const runShareScript = 'run_share.js';
  
  let owned = ns.getPurchasedServers();
  for (let s of owned) {
    if (killShare) {
      ns.kill(C.ScriptShare, s);
      continue;
    }
    ns.scp([C.ScriptShare, C.ScriptRunShare], s, 'home');
    await ns.sleep(500);
    ns.exec(C.ScriptRunShare, s, 1);
  }
}
