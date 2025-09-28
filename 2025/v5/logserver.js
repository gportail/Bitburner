/** @param {NS} ns */
export async function main(ns) {

  let datas;

  while (true) {
    while (ns.peek(1) != "NULL PORT DATA") {
      datas = JSON.parse(ns.readPort(1));
      ns.tprint(datas);
      ns.tprint(datas.log);
      ns.tprint(datas.info);
    }
    await ns.sleep(500);
  }
} 