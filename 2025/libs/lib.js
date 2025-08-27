/**
 * Calcul le nombre de thread max spour le {script} sur le serveur {serverName}
 * @return integer
 */
export function calcNbThread(serverName, script, ns) {
  let ram = ns.getScriptRam(script);
  let srvram = ns.getServerMaxRam(serverName);
  return Math.trunc(srvram / ram);
}

/**
 * Execute le {script} avec le maximum de thread possible
 */
export function runScript(script, serverName, ns) {
  var th = calcNbThread(serverName, script, ns);
  ns.exec(script, serverName, th);
}

/**
 * Renvoie un tableau des scripts en cour d'execution sur {host}
 */
export function getScriptsRunning(host, ns) {
  let oPS = ns.ps(host);
  let scripts = [];
  for (let i = 0; i < oPS.length; i++) {
    scripts.push(oPS[i].filename);
  }
  return scripts;
}

/**
 * Format une {duree}
 * @param duree en millisecondes
 * @return string
 */
export function timeformat(duree) {
  let s = Math.floor(duree / 1000);
  let min = Math.floor(s / 60);
  s = s - min * 60;
  return min + "m" + s + "s";
}

/**
 * Calcul le gain par second en tenant compte des chance de hack
 */
export function calculGainSeconds(host, ns) {
  const wTime = ns.getWeakenTime(host);
  const gTime = ns.getGrowTime(host);
  const hTime = ns.getHackTime(host);
  const hChance = ns.hackAnalyzeChance(host);
  const totalTime = (wTime + gTime + (hTime * (2 - hChance))) / 1000; // en secondes, tiens compte du %chance de hack
  const hMoney = ns.hackAnalyze(host) * ns.getServerMoneyAvailable(host);
  const hMoneyPerSec = hMoney / totalTime;
  return hMoneyPerSec;
}

/**
 * Test si un serveur est acheté ou pas.
 */
export function isPurchasedByPlayer(server, ns) {
  let ownedServers = ns.getPurchasedServers();
  return ownedServers.includes(server);
}

/**
 * Execute une commande comme si elle etait tappé dans le terminal
 * ref : https://github.com/Corasinth/Bitburner-DirectConnections/blob/main/direct-connection.js
 */
export function runCommand(cmd) {
  const doc = eval('document');
  const terminalInput = doc.getElementById("terminal-input");
  const enterPress = new KeyboardEvent('keydown',
    {
      bubbles: true,
      cancelable: true,
      keyCode: 13
    });
  const handler = Object.keys(terminalInput)[1];
  terminalInput.value = cmd
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput.dispatchEvent(enterPress);
}

/**
 * Calcul le nombre de programme d'ouverture de port disponible
 */
export function progsAvailables(ns) {
  let progs = ["brutessh.exe", "ftpcrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
  let count = 0;
  for (let p of progs) {
    if (ns.fileExists(p, "home")) count++;
  }
  return count;
}

export function findServerWithNoRam(servers, ns){
  let result = new Array();
  for(s of servers){
    if (ns.getServerMaxRam(s) == 0) result.push(s);
  }
  return result;
}
