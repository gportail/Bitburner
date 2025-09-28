/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    await ns.share();
    //ns.sleep(10000);
    //ns.tprint(ns.getSharePower());
  }
}
