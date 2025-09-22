export class clServer {
  constructor(ns, name) {
    this.ns = ns;
    this.name = name;
  }

  get RootAcces() {
    return this.ns.hasRootAccess(this.name)
  }

  get SecurityLevel() {
    return this.ns.getServerSecurityLevel(this.name)
  }

  get MinSecurityLevel() {
    return this.ns.getServerMinSecurityLevel(this.name)
  }

  get RequiredHackingLevel() {
    return this.ns.getServerRequiredHackingLevel(this.name)
  }

  get NumPortsRequired() {
    return this.ns.getServerNumPortsRequired(this.name)
  }

  get MaxMoney() {
    return this.ns.getServerMaxMoney(this.name)
  }

  get MoneyAvailable() {
    return this.ns.getServerMoneyAvailable(this.name)
  }

  get PercentMoneyAvailable() {
    return this.MaxMoney > 0 ? this.MoneyAvailable / this.MaxMoney : 0;
  }

  get MaxRam() {
    return this.ns.getServerMaxRam(this.name)
  }

  get UsedRam() {
    return this.ns.getServerUsedRam(this.name)
  }

  get PercentUsedRam() {
    return this.MaxRam > 0 ? this.UsedRam / this.MaxRam : 0;
  }

  get FreeRam() {
    return this.MaxRam - this.UsedRam;
  }

  get PercentFreeRam() {
    return this.MaxRam > 0 ? this.FreeRam / this.MaxRam : 0;
  }

  get HackChance() {
    return this.ns.fileExists("Formulas.exe", 'home')
      ? this.ns.formulas.hacking.hackChance(this.ns.getServer(this.name), this.ns.getPlayer())
      : this.ns.hackAnalyzeChance(this.name)
  }

  get WeakenTime() {
    return this.ns.getWeakenTime(this.name)
  }

  get GrowTime() {
    return this.ns.getGrowTime(this.name)
  }

  get HackTime() {
    return this.ns.getHackTime(this.name)
  }

  get CycleTime() {
    return this.WeakenTime + this.GrowTime + this.HackTime;
  }

  get GainPerThread() {
    return this.ns.hackAnalyze(this.name) * this.MoneyAvailable;
  }

  /**
   * Renvoie le gain de $ par seconde
   * @return {number}  
   */
  get GainPerSecond() {
    let gPerThr = this.GainPerThread;
    let totalTime = (this.WeakenTime + this.GrowTime + (this.HackTime * (2 - this.HackChance))) / 1000
    return gPerThr / totalTime;
  }

  /**
   * Renvoie la liste des script qui s'executent sur le serveur
   * @return {Array}
   */
  get RunningScripts() {
    let oPS = this.ns.ps(this.name);
    let scripts = [];
    for (let scr of oPS) {
      scripts.push(scr.filename);
    }
    return scripts;
  }

  /**
   * Indique si le serveur a été acheté par le joueur
   * @return {boolean} 
   */
  get isPurchasedByPlayer() {
    return this.ns.getPurchasedServers().includes(this.name);
  }

  /**
   * Calcul le nombre de thread possible pour le script
   * @param {string} script Le script a executer
   * @returns {integer}
   */
  nbThread(script) {
    let ScrRam = this.ns.getScriptRam(script);
    return Math.floor(this.FreeRam / ScrRam);
  }

  /**
  * Calcul le nombre de thread de GROW pour avoir le {TargetMoney}$ sur le serveur
  * @param {number} TargetMoney Argent voulu sur le serveur
  * @returns {integer} 
  */
  calcNbGrowThread(TargetMoney) {
    if (TargetMoney < this.MoneyAvailable) return 0;
    let multiplier = Math.ceil(TargetMoney / this.MoneyAvailable); // calcul par combien il faut multiplier MoneyAvailable pour avoir TargetMoney
    let growThread = this.ns.growthAnalyze(this.name, multiplier); // calcul le nombre de thread de Grow pour obtenir TargetMoney
    return Math.ceil(growThread);
  }

  /**
   * Calcul le nombre de thread pour hack {percentMaxMoney}% du MaxMoney du serveur
   * @param {number} percentMaxMoney Le pourcentage de MaxMoney que l'on veut hacker (0..1)
   * @returns {integer}   
   */
  calcNbHackThreadPercent(percentMaxMoney) {
    let Mnt = this.MaxMoney * percentMaxMoney;
    return this.calcNbHackThreadAmount(Mnt);
  }

  /**
   * Calcul le nombre de thread pour hack {Amount}$ du serveur
   * @param {number} Amount 
   * @returns {integer}
   */
  calcNbHackThreadAmount(Amount) {
    return Math.ceil(this.ns.hackAnalyzeThreads(this.name, Amount));
  }

  /**
   * Calcul l'augmentation de SecLvl pour un hack de {threads} threads
   * @param {integer} threads 
   * @returns {number}
   */
  calcSecLvlOnHack(threads) {
    return this.ns.hackAnalyzeSecurity(threads, this.name);
  }

  /**
   * Calcul l'augmentation de SecLvl pour un grow de {threads} threads
   * @param {integer} threads 
   * @returns {number}
   */
  calcSecLvlOnGrow(threads) {
    return this.ns.growthAnalyzeSecurity(threads, this.name);
  }

  /**
   * Calcul le nombre de thread de WEAKEN pour diminuer le SecLvl de {WeakenAmount}  
   * @param {number} WeakenAmount 
   */
  calcThreadToWeaken(WeakenAmount) {
    let th = 1;
    while (this.ns.weakenAnalyze(th) < WeakenAmount) {
      th++;
    }
    return th;
  }
}


// /** 
//  * @param {NS} ns 
//  */
// export async function main(ns) {
//   let srv = new Server(ns, 'foodnstuff');
//   ns.tprintf("Serveur: %s  RootAcces %t  GainPerThread %.2f", srv.name, srv.RootAcces, srv.GainPerThread);
//   ns.tprintf("Serveur: %s  Owned %t", srv.name, srv.isPurchasedByPlayer);
//   ns.tprint(srv.RunningScripts.join());
//   srv = new Server(ns, 'SRV-1');
//   ns.tprintf("Serveur: %s  Owned %t", srv.name, srv.isPurchasedByPlayer);
// } 