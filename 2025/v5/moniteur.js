import * as cl from "../libs/colors.js";
import { secLvlFactor, moneyFactor } from "../libs/constantes.js";
import { logf, log, logFile } from "../libs/logs.js";
import { clServer } from "../libs/classServer";


let serveurs = new Array();
let quiet = false;
let loopNb = 0;
let hackServerWithNoRamTargets = new Array();

const DureeCycle = 15;  // durée d'un cycle en s
const ScriptBuyProgram = 'buy-programs4.js';
const ScriptAutoHack = 'autohack4.js';
const ScriptDeploy = 'deploy4.js';
const ScriptSingleWG = 'single_w_and_g4.js';
const ScriptG = 'loop_g3.js';
const ScriptW = 'loop_w3.js';
const ScriptH = 'loop_h3.js';
const ScriptBasic = 'basic_hack4.js';
const ScriptKillOwned = 'kill-all-scripts-on-owned.js';

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['q', false], //execution silencieuse
    ['1', false], //un seul run (debug)
  ]);

  if (params['h']) {
    help(ns);
  }

  quiet = params['q'];
  let oneRun = params['1'];

  logf(ns, "Debut du script %s", [ns.getScriptName()], quiet);
  ns.disableLog('ALL');



  ns.enableLog('ALL');
  logf(ns, "Fin du script %s", [ns.getScriptName()], quiet);
}
