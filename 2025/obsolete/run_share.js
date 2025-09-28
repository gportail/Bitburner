/** @param {NS} ns */
export async function main(ns) {
  const shareScript = 'shareRam.js';
  const host = ns.getHostname();
  ns.kill(shareScript);
  let availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  let th = Math.floor(availableRam / ns.getScriptRam(shareScript, host)) - 4;  // on garde 4 fois la ram de shareRam.js de dispo
  if (th > 0) ns.run(shareScript, th);
}
