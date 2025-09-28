/**
 * Gestion des processus. Permet de créer/lire si un fichier de kill.
 * Si le fichier de kill existe alors le script doit s'arrêter.
 */

/**
 * Renvoie le nom du fichier killFlag
 * @param {NS} ns 
 * @param {integer} pid Id du processus
 * @returns {String} nom du fichier killFlag
 */
export function killFilename(ns, pid = 0) {
  if (pid == 0) pid = ns.pid;
  return '/run/kill_' + pid + '.txt';
}
/**
 * Renvoie true si le fichier de kill existe sur 'home'
 * @param {NS} ns 
 * @returns {Boolean} 
 */
export function killFlagExists(ns) {
  let killflag = killFilename(ns);
  let res = ns.fileExists(killflag, 'home');
  ns.rm(killflag, 'home');
  return res;
}

/**
 * Création du fichier de kill, doit être executer sur 'home'
 * @param {NS} ns 
 * @param {integer} pid Id du processus a tuer
 */
export function createKillFlag(ns, pid) {
  let killflag = killFilename(ns, pid);
  ns.write(killflag, '', 'w');
} 
