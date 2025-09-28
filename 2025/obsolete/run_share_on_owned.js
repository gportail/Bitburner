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

  const shareScript = 'shareRam.js';
  const runShareScript = 'run_share.js';
  const host = ns.getHostname();

  let owned = ns.getPurchasedServers();
  for (let s of owned) {
    if (killShare) {
      ns.kill(shareScript, s);
      continue;
    }
    ns.scp([shareScript, runShareScript], s, 'home');
    await ns.sleep(500);
    ns.exec(runShareScript, s, 1);
  }
}
