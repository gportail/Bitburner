/** @param {NS} ns */
export async function main(ns) {
  ns.nuke("n00dles");
  while (true) {
    await ns.hack("n00dles", { threads: ns.self.threads });
    await ns.grow("n00dles", { threads: ns.self.threads });
    await ns.weaken("n00dles", { threads: ns.self.threads });
  }
}
