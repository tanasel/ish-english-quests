"use strict";

// Self-contained acceptance tests for "Quest Forge".
//
// The app modules are browser IIFEs that hang their public API off a `window`
// global and reference `window` / `document` / `LZString` / `localStorage`.
// We cannot `require()` them. Instead we build a sandbox object, point
// `window` at itself, stub the few browser APIs the modules touch at load
// time, read each source file with `fs`, and execute it with `vm`.
//
// Run from the english-quests directory:
//   node --test tests/quest.test.cjs

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// ---------------------------------------------------------------------------
// Sandbox construction
// ---------------------------------------------------------------------------

const APP_ROOT = path.resolve(__dirname, "..");

// Files in load order. lz-string first (defines LZString), then schema (defines
// QuestSchema + DOM helpers), answer (QuestAnswer), share (QuestShare uses
// window.LZString), data (QUEST_SEEDS).
const LOAD_ORDER = [
  "vendor/lz-string.min.js",
  "schema.js",
  "answer.js",
  "share.js",
  "data.js",
];

// Minimal element stub: every property the modules touch at module-eval / call
// time must be a no-op or a benign value so executing the IIFEs never throws.
function makeElementStub() {
  const node = {
    style: {},
    className: "",
    textContent: "",
    value: "",
    hidden: false,
    tabIndex: 0,
    dataset: {},
    children: [],
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() {
        return false;
      },
    },
    setAttribute() {},
    getAttribute() {
      return null;
    },
    removeAttribute() {},
    appendChild(child) {
      node.children.push(child);
      return child;
    },
    removeChild() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    focus() {},
    click() {},
  };
  return node;
}

function makeDocumentStub() {
  return {
    createElement() {
      return makeElementStub();
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    getElementById() {
      return null;
    },
    addEventListener() {},
    removeEventListener() {},
    documentElement: makeElementStub(),
    body: makeElementStub(),
    activeElement: null,
  };
}

function makeLocalStorageStub() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(String(key), String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
  };
}

// Build the sandbox, load every app file into it, and return it.
function loadSandbox() {
  const sandbox = {};
  // window.X = ... assignments inside the IIFEs land on the sandbox.
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = makeDocumentStub();
  sandbox.localStorage = makeLocalStorageStub();
  sandbox.matchMedia = function matchMedia() {
    return { matches: false, addEventListener() {}, removeEventListener() {} };
  };
  sandbox.console = console;
  // Guard against the lz-string UMD tail poking at these.
  sandbox.define = undefined;
  sandbox.angular = undefined;

  vm.createContext(sandbox);

  for (const rel of LOAD_ORDER) {
    const full = path.join(APP_ROOT, rel);
    let code;
    try {
      code = fs.readFileSync(full, "utf8");
    } catch (err) {
      throw new Error(`Could not read app source file "${rel}": ${err.message}`);
    }
    try {
      vm.runInContext(code, sandbox, { filename: rel });
    } catch (err) {
      throw new Error(`Failed to evaluate "${rel}" in the sandbox: ${err.stack || err.message}`);
    }
  }

  return sandbox;
}

// Load once and share across tests (the modules are stateless after load).
let SANDBOX;
try {
  SANDBOX = loadSandbox();
} catch (err) {
  // Surface a clear message before any test runs.
  console.error("\n[setup] " + err.message + "\n");
  throw err;
}

// Pull globals off the sandbox with a helpful failure if one is missing.
function requireGlobal(name) {
  const value = SANDBOX[name];
  assert.ok(
    value != null,
    `Expected global "${name}" to be defined after loading the app modules, ` +
      `but it was ${value}. Check load order and that ${name} is assigned to window.`
  );
  return value;
}

const QuestAnswer = requireGlobal("QuestAnswer");
const QuestSchema = requireGlobal("QuestSchema");
const QuestShare = requireGlobal("QuestShare");
const QUEST_SEEDS = requireGlobal("QUEST_SEEDS");
const LZString = requireGlobal("LZString");

// ---------------------------------------------------------------------------
// Sanity: every public API surface we test against actually exists.
// ---------------------------------------------------------------------------

test("all required globals and methods are present", () => {
  for (const fn of ["normalizeAns", "checkAnswer", "levenshtein", "closestDistance"]) {
    assert.strictEqual(typeof QuestAnswer[fn], "function", `QuestAnswer.${fn} should be a function`);
  }
  for (const fn of ["normalizeQuest", "normalizeStation", "validatePackText"]) {
    assert.strictEqual(typeof QuestSchema[fn], "function", `QuestSchema.${fn} should be a function`);
  }
  for (const c of ["PUZZLE_TYPES", "MODES", "THEMES"]) {
    assert.ok(Array.isArray(QuestSchema[c]), `QuestSchema.${c} should be an array`);
  }
  for (const fn of ["encodePack", "decodePack", "packSizeInfo"]) {
    assert.strictEqual(typeof QuestShare[fn], "function", `QuestShare.${fn} should be a function`);
  }
  assert.ok(Array.isArray(QUEST_SEEDS) && QUEST_SEEDS.length >= 2, "QUEST_SEEDS should hold the demo packs");
  assert.strictEqual(typeof LZString.compressToEncodedURIComponent, "function", "LZString must be loaded");
});

// ---------------------------------------------------------------------------
// §17 — checkAnswer (the shared matcher)
// ---------------------------------------------------------------------------

test("checkAnswer: normalized match forgives trailing punctuation and case", () => {
  const station = { answer: "lady macbeth", match: "normalized" };
  assert.strictEqual(
    QuestAnswer.checkAnswer("Lady Macbeth.", station),
    true,
    "'Lady Macbeth.' should match {answer:'lady macbeth', match:'normalized'}"
  );
});

test("checkAnswer: normalized match forgives case for an upper-case answer", () => {
  const station = { answer: "VERSE", match: "normalized" };
  assert.strictEqual(
    QuestAnswer.checkAnswer("verse", station),
    true,
    "'verse' should match {answer:'VERSE', match:'normalized'}"
  );
});

test("checkAnswer: exact match rejects a misspelling", () => {
  const station = { answer: "tragedy", match: "exact" };
  assert.strictEqual(
    QuestAnswer.checkAnswer("tradegy", station),
    false,
    "'tradegy' should NOT match {answer:'tragedy', match:'exact'}"
  );
  // And the correctly-spelled word still passes (exact is case-insensitive).
  assert.strictEqual(QuestAnswer.checkAnswer("Tragedy", station), true, "exact should still accept the right word, any case");
});

test("checkAnswer: set match accepts accepted answers in any order", () => {
  const station = { answer: "imagery", match: "set", acceptedAnswers: ["imagery", "simile", "metaphor"] };
  // Pipe-joined, reordered.
  assert.strictEqual(
    QuestAnswer.checkAnswer("metaphor|imagery|simile", station),
    true,
    "set match should accept all targets in any order"
  );
  // Array input, reordered.
  assert.strictEqual(
    QuestAnswer.checkAnswer(["simile", "metaphor", "imagery"], station),
    true,
    "set match should accept an array of targets in any order"
  );
  // Missing one of the required targets -> fail.
  assert.strictEqual(
    QuestAnswer.checkAnswer("imagery|simile", station),
    false,
    "set match should fail when a required target is missing"
  );
});

test("checkAnswer: ordered (pipe-joined) match works", () => {
  const items = ["arrival", "puppy", "barn", "river"];
  const station = { answer: items.join("|"), match: "ordered", acceptedAnswers: [items.join("|")] };
  assert.strictEqual(
    QuestAnswer.checkAnswer("arrival|puppy|barn|river", station),
    true,
    "ordered match should accept the exact pipe-joined order"
  );
  assert.strictEqual(
    QuestAnswer.checkAnswer("puppy|arrival|barn|river", station),
    false,
    "ordered match should reject a wrong order"
  );
});

test("closestDistance: Levenshtein distance of a 1-transposition misspelling", () => {
  assert.strictEqual(
    QuestAnswer.closestDistance("tradegy", { answer: "tragedy" }),
    2,
    "closestDistance('tradegy', {answer:'tragedy'}) should be 2"
  );
});

// ---------------------------------------------------------------------------
// §6 — validatePackText (auto-repair pipeline)
// ---------------------------------------------------------------------------

test("validatePackText: repairs a fenced + preamble + trailing-comma reply", () => {
  const escapePack = QUEST_SEEDS[0];
  const expectedCount = escapePack.stations.length;

  // Re-serialize the demo pack, then dirty it the way an AI reply would be:
  // a prose preamble, a ```json fence, and a trailing comma before a closing brace.
  let body = JSON.stringify(escapePack, null, 2);
  // Inject a trailing comma after the "schema" line (valid to strip, exercises the fixer).
  body = body.replace('"schema": "ish-quest@1",', '"schema": "ish-quest@1" ,');
  // Add a trailing comma before the final closing brace of the whole object.
  body = body.replace(/\}\s*$/, ",\n}");

  const raw = 'Here is your quest:\n\n```json\n' + body + "\n```\n\nLet me know if you want changes!";

  const result = QuestSchema.validatePackText(raw);
  assert.strictEqual(result.ok, true, "validatePackText should return ok:true for a recoverable reply");
  assert.ok(result.pack && typeof result.pack === "object", "result should carry a normalized pack");
  assert.strictEqual(
    result.pack.stations.length,
    expectedCount,
    `the repaired pack should keep all ${expectedCount} stations`
  );
  assert.ok(Array.isArray(result.notes) && result.notes.length > 0, "repairs should produce at least one friendly note");
});

test("validatePackText: rejects pure non-JSON garbage with an error", () => {
  const result = QuestSchema.validatePackText("the quick brown fox has no braces at all");
  assert.strictEqual(result.ok, false, "garbage input should return ok:false");
  assert.ok(
    typeof result.error === "string" && result.error.length > 0,
    "garbage input should carry a non-empty error message"
  );
});

// ---------------------------------------------------------------------------
// §16 / schema — every demo pack normalizes cleanly
// ---------------------------------------------------------------------------

test("normalizeQuest: every demo pack normalizes with zero unusable stations", () => {
  assert.ok(QUEST_SEEDS.length > 0, "there should be at least one demo pack");
  QUEST_SEEDS.forEach((seed, idx) => {
    const out = QuestSchema.normalizeQuest(seed);
    assert.ok(out && out.pack, `pack #${idx} should normalize to a pack`);
    assert.strictEqual(
      out.unusable.length,
      0,
      `pack #${idx} (${seed.meta && seed.meta.id}) should have zero unusable stations, got: ` +
        JSON.stringify(out.unusable)
    );
    assert.ok(out.pack.stations.length > 0, `pack #${idx} should keep its stations`);
  });
});

test("normalizeQuest: timer is forced false and meta/types are within enums", () => {
  const typeSet = new Set(QuestSchema.PUZZLE_TYPES);
  const modeSet = new Set(QuestSchema.MODES);
  QUEST_SEEDS.forEach((seed, idx) => {
    const { pack } = QuestSchema.normalizeQuest(seed);
    assert.strictEqual(pack.settings.timer, false, `pack #${idx} settings.timer must be false`);
    assert.ok(modeSet.has(pack.meta.mode), `pack #${idx} meta.mode "${pack.meta.mode}" must be a valid MODE`);
    pack.stations.forEach((st) => {
      assert.ok(
        typeSet.has(st.type),
        `pack #${idx} station "${st.id}" type "${st.type}" must be in PUZZLE_TYPES`
      );
    });
  });
});

test("normalizeQuest: each station's acceptedAnswers includes its answer (case-insensitively)", () => {
  QUEST_SEEDS.forEach((seed, idx) => {
    const { pack } = QuestSchema.normalizeQuest(seed);
    pack.stations.forEach((st) => {
      assert.ok(Array.isArray(st.acceptedAnswers), `station ${st.id} should have an acceptedAnswers array`);
      const answerNorm = String(st.answer).trim().toLowerCase();
      const has = st.acceptedAnswers.some((a) => String(a).trim().toLowerCase() === answerNorm);
      assert.ok(
        has,
        `pack #${idx} station "${st.id}" acceptedAnswers ${JSON.stringify(st.acceptedAnswers)} ` +
          `must contain its answer "${st.answer}" (case-insensitively)`
      );
    });
  });
});

// ---------------------------------------------------------------------------
// §8 — share round-trips
// ---------------------------------------------------------------------------

test("share: decodePack(encodePack(pack)) round-trips on meta.id and stations.length", () => {
  QUEST_SEEDS.forEach((pack, idx) => {
    const encoded = QuestShare.encodePack(pack);
    assert.ok(typeof encoded === "string" && encoded.length > 0, `pack #${idx} should encode to a non-empty string`);
    const decoded = QuestShare.decodePack(encoded);
    assert.ok(decoded && typeof decoded === "object", `pack #${idx} should decode back to an object`);
    assert.strictEqual(
      decoded.meta.id,
      pack.meta.id,
      `pack #${idx} meta.id should survive the encode/decode round-trip`
    );
    assert.strictEqual(
      decoded.stations.length,
      pack.stations.length,
      `pack #${idx} stations.length should survive the encode/decode round-trip`
    );
  });
});
