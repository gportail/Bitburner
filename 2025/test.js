/** @param {NS} ns */
export async function main(ns) {
  // run w_and_g.js -c max-hardware; run w.js max-hardware -t 100; run g.js max-hardware -t 100
  // ns.run('w_and_g.js',1,'-c',ns.args[0]);
  // ns.run('w.js',100,ns.args[0],'-i');
  // ns.run('g.js',100,ns.args[0]);
  ns.tprint(ns.hacknet.maxNumNodes());
}
