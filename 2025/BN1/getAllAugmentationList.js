const factions = [
  "Aevum", "Bachman & Associates", "BitRunners", "Bladeburners", "Blade Industries",
  "Chongqing", "Church of the Machine God", "Clarke Incorporated", "CyberSec",
  "Daedalus", "ECorp", "Four Sigma", "Fulcrum Secret Technologies", "Illuminati",
  "Ishima", "KuaiGong International", "MegaCorp", "Netburners", "New Tokyo",
  "NiteSec", "NWO", "OmniTek Incorporated", "Sector-12", "Shadows of Anarchy",
  "Silhouette", "Slum Snakes", "Speakers for the Dead", "Tetrads", "The Black Hand",
  "The Covenant", "The Dark Army", "The Syndicate", "Tian Di Hui", "Volhaven"];

const statistiques = [
  "agility_exp", "agility", "bladeburner_analysis", "bladeburner_max_stamina",
  "bladeburner_stamina_gain", "bladeburner_success_chance", "charisma_exp",
  "charisma", "company_rep", "crime_money", "crime_success", "defense_exp",
  "defense", "dexterity_exp", "dexterity", "faction_rep", "hacking_chance",
  "hacking_exp", "hacking_grow", "hacking_money", "hacking_speed", "hacking",
  "hacknet_node_core_cost", "hacknet_node_level_cost", "hacknet_node_money",
  "hacknet_node_purchase_cost", "hacknet_node_ram_cost", "strength_exp",
  "strength", "work_money"
]

/** @param {NS} ns */
export async function main(ns) {
  ns.write('stats.txt', "faction;augmentation;reputation;prix;stat;valeur\n", 'w');
  for (let f of factions) {
    let augments = ns.singularity.getAugmentationsFromFaction(f);
    for (let aug of augments) {
      let stats = ns.singularity.getAugmentationStats(aug);
      let repu = ns.singularity.getAugmentationRepReq(aug);
      let price = ns.singularity.getAugmentationPrice(aug)
      for (let st of statistiques) {
        let s = f + ";" + aug + ";" + repu + ";" + price + ";" + st + ";" + stats[st];
        if (stats[st] != 1) {
          ns.tprintf(s, []);
          ns.write('stats.txt', s + "\n", 'a');
        }
      }
    }
  }
} 