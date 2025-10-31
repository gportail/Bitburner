/** @param {NS} ns */
export async function main(ns) {
  const sfList = ns.singularity.getOwnedSourceFiles();

  const sf4 = sfList.find(sf => sf.n === 4);

  if (sf4) {
    ns.tprint(`✅ Tu as la Source-File 4 au niveau ${sf4.lvl}.`);
  } else {
    ns.tprint("❌ Tu n'as pas la Source-File 4.");
  }

  const info = ns.getResetInfo();
  ns.tprint(info.currentNode);
  ns.tprint(info.ownedSF.get(4));
  ns.tprint(info.ownedSF.get(1));
  ns.tprint(info.ownedSF.get(2));



  // const info = ns.getResetInfo();
  // if (info.currentNode == 4) return true;
  // if (info.ownedSF.find(sf => sf.n === 4)) return true;

  // let config = require("./test.json");
  let config = JSON.parse(ns.read("./test.json"));
  ns.tprint(config);
  ns.tprint(typeof config);
  ns.tprint(config.moneyFactor);
  ns.tprint(Object.entries(config));
  for (let ent of Object.entries(config)){
    ns.tprint(ent[0] + " = " + ent[1]);
  } 
  let prop = "moneyFactor";
  // ns.tprint(config.${prop}   );
} 