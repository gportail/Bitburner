import { loadConfig, config } from "./BN1/libs/config.js";

/** @param {NS} ns */
export async function main(ns) {
  //let config = JSON.parse(ns.read("./config.json"));
  loadConfig(ns);
  ns.tprint(config);
  for (let s of config.DeployScripts) {
    ns.tprint(s + "\n");
  }
} 