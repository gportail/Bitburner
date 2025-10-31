export let config = {};

export function loadConfig(ns) {
  config = JSON.parse(ns.read("./config.json"));
}

export function saveConfig(ns) {
  ns.write("config.json", JSON.stringify(config, null, 3), "w");
}