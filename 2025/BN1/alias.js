import { runCommand } from "./libs/lib.js";

const alias = [
  "alias co='run BN1/connect.js '",
  "alias s='run BN1/stats.js'",
  "alias sa='cls; run BN1/stats.js -a -o'",
  "alias witch='run BN1/witch.js'",
  "alias so='cls; run BN1/stats.js -o'",
  "alias clearlog='rm -r logs/'",
  "alias -g h='home'",
  "alias -g l='ls'",
  "alias -g nuke='run NUKE.exe'",
  "alias -g brutessh='run BrusteSSH.exe'",
  "alias -g s3='scan-analyze 3'",
  "alias -g s5='scan-analyze 5'",
  "alias -g s10='scan-analyze 10'",
]
/** @param {NS} ns */
export async function main(ns) {
  for (let cmd of alias) {
    runCommand(cmd);
  }
} 