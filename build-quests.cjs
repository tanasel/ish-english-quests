#!/usr/bin/env node
/*
 * Regenerate quests/index.json and data.js from the pack files in quests/.
 * To add a quest: drop a valid <id>.json into quests/ (id must match the
 * filename), then run:  node build-quests.cjs
 * Order below controls how quests appear on the launcher; any pack not listed
 * is appended alphabetically.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "quests");
const ORDER = [
  "omam-locked-bunkhouse",
  "poets-lost-map",
  "orators-sealed-archive",
  "romeo-and-juliet-escape",
  "punctuation-power-hunt",
  "gothic-writing-escape",
];

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "index.json");
const byId = {};
for (const f of files) {
  const pack = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (!pack.meta || !pack.meta.id) throw new Error("missing meta.id in " + f);
  if (f !== pack.meta.id + ".json") console.warn("WARN: filename !== meta.id:", f, "vs", pack.meta.id);
  byId[pack.meta.id] = pack;
}

const ids = [
  ...ORDER.filter((id) => byId[id]),
  ...Object.keys(byId).filter((id) => !ORDER.includes(id)).sort(),
];
const packs = ids.map((id) => byId[id]);

const index = packs.map((p) => ({
  id: p.meta.id,
  title: p.meta.title,
  unit: p.meta.unit || "",
  grade: p.meta.year || "",
  mode: p.meta.mode,
  theme: p.meta.theme || "",
  file: p.meta.id + ".json",
}));
fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify(index, null, 2) + "\n");

const seeds = JSON.stringify(packs, null, 2)
  .split("\n")
  .map((line) => "  " + line)
  .join("\n");
const data = '(function () {\n  "use strict";\n\n  window.QUEST_SEEDS =\n' + seeds + ";\n})();\n";
fs.writeFileSync(path.join(__dirname, "data.js"), data);

console.log("Wrote quests/index.json (" + index.length + " entries) and data.js (" + packs.length + " packs):");
console.log("  " + ids.join("\n  "));
