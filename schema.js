(function () {
  "use strict";

  const PUZZLE_TYPES = [
    "cipher",
    "vocab-lock",
    "attribution",
    "sequence",
    "fill-blank",
    "anagram",
    "comprehension",
    "hidden-word",
    "riddle",
    "spelling-lock",
    "odd-one-out",
  ];
  const MODES = ["escape", "hunt"];
  const THEMES = ["castle", "pirate", "detective", "library", "space", "plain"];
  const MATCHES = ["normalized", "exact", "contains", "set", "ordered"];
  const CIPHER_TYPES = ["caesar", "atbash", "reverse", "a1z26"];

  const typeSet = new Set(PUZZLE_TYPES);
  const modeSet = new Set(MODES);
  const themeSet = new Set(THEMES);
  const matchSet = new Set(MATCHES);
  const cipherSet = new Set(CIPHER_TYPES);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = String(text);
    return n;
  };
  const toText = (value) => (value == null ? "" : String(value)).trim();
  const clamp = (value, max) => {
    const t = toText(value).replace(/\s+/g, " ");
    return t.length > max ? t.slice(0, max).trim() : t;
  };
  const listFrom = (value) => {
    if (Array.isArray(value)) return value.map((x) => clamp(x, 700)).filter(Boolean);
    if (typeof value === "string") return value.split(",").map((x) => clamp(x, 700)).filter(Boolean);
    return [];
  };

  function safeHref(url) {
    const value = toText(url);
    if (!/^https?:\/\//i.test(value)) return null;
    try {
      const u = new URL(value);
      return (u.protocol === "http:" || u.protocol === "https:") ? u.href : null;
    } catch {
      return null;
    }
  }

  function hashStr(s) {
    s = String(s == null ? "" : s);
    let h = 0;
    for (let i = 0; i < s.length; i += 1) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

  function kebab(s, fallback) {
    const base = String(s == null ? "" : s)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70);
    return base || fallback || "quest";
  }

  function nowSeconds() {
    try { return Math.floor(Date.now() / 1000); } catch { return 0; }
  }

  function toast(msg, action) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = "";
    const span = el("span", "toast__msg", msg);
    t.appendChild(span);
    if (action && action.label && typeof action.fn === "function") {
      const b = el("button", "toast__action", action.label);
      b.type = "button";
      b.addEventListener("click", () => {
        t.classList.remove("show");
        t.hidden = true;
        action.fn();
      });
      t.appendChild(b);
    }
    const close = el("button", "toast__close", "Close");
    close.type = "button";
    close.addEventListener("click", () => {
      t.classList.remove("show");
      t.hidden = true;
    });
    t.appendChild(close);
    t.hidden = false;
    t.classList.add("show");
  }

  function openDialog(dlg, focusSel) {
    if (!dlg) return null;
    const returnFocus = document.activeElement;
    dlg.__returnFocus = returnFocus && typeof returnFocus.focus === "function" ? returnFocus : null;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    const target = focusSel ? $(focusSel, dlg) : $("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])", dlg);
    if (target && typeof target.focus === "function") target.focus();
    return dlg.__returnFocus;
  }

  function closeDialog(dlg) {
    if (!dlg) return;
    if (dlg.open && typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
    const target = dlg.__returnFocus;
    if (target && typeof target.focus === "function") target.focus();
  }

  function radioOpts(container) {
    return Array.from(container.querySelectorAll('[role="radio"]'));
  }

  function initRoving(container) {
    const opts = radioOpts(container);
    const checked = opts.find((o) => o.getAttribute("aria-checked") === "true") || opts[0];
    opts.forEach((o) => { o.tabIndex = o === checked ? 0 : -1; });
  }

  function selectRadio(container, value) {
    radioOpts(container).forEach((o) => {
      const on = String(o.dataset.value) === String(value);
      o.setAttribute("aria-checked", on ? "true" : "false");
      o.tabIndex = on ? 0 : -1;
    });
  }

  function wireRadioKeys(container, onChange) {
    initRoving(container);
    container.addEventListener("keydown", (e) => {
      const opts = radioOpts(container);
      const i = opts.indexOf(document.activeElement);
      if (i < 0) return;
      let j = i;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % opts.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + opts.length) % opts.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = opts.length - 1;
      else return;
      e.preventDefault();
      opts[j].click();
      opts[j].focus();
      if (onChange) onChange(opts[j].dataset.value);
    });
  }

  function clampContent(value, depth) {
    if (depth > 4) return "";
    if (Array.isArray(value)) return value.slice(0, 40).map((v) => clampContent(v, depth + 1));
    if (value && typeof value === "object") {
      const out = {};
      Object.keys(value).slice(0, 60).forEach((k) => {
        const key = clamp(k, 80);
        if (key) out[key] = clampContent(value[k], depth + 1);
      });
      return out;
    }
    if (typeof value === "number" || typeof value === "boolean") return value;
    return clamp(value, 1800);
  }

  function addUnique(arr, value) {
    const v = toText(value);
    if (!v) return;
    if (!arr.some((x) => toText(x).toLowerCase() === v.toLowerCase())) arr.push(v);
  }

  function lettersOnly(s) {
    return toText(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").split("").sort().join("");
  }

  function normalizeStation(raw, i, notes) {
    notes = Array.isArray(notes) ? notes : [];
    const src = raw && typeof raw === "object" ? raw : {};
    const content = clampContent(src.content && typeof src.content === "object" ? src.content : {}, 0);
    const name = clamp(src.name, 120) || "Station " + (i + 1);
    const type = typeSet.has(toText(src.type)) ? toText(src.type) : "riddle";
    let match = matchSet.has(toText(src.match)) ? toText(src.match) : "normalized";
    let answer = clamp(src.answer, 700);
    const hints = listFrom(src.hints).slice(0, 3);
    const acceptedAnswers = listFrom(src.acceptedAnswers).slice(0, 20);
    const station = {
      id: kebab(src.id || name, "s" + (i + 1)) || ("s" + (i + 1)),
      name,
      icon: clamp(src.icon, 20),
      narrative: clamp(src.narrative, 600),
      type,
      content,
      answer,
      acceptedAnswers,
      match,
      hints,
      reveal: clamp(src.reveal, 800),
      reward: src.reward && typeof src.reward === "object" ? { fragment: clamp(src.reward.fragment, 40) } : {},
      points: Math.max(0, Math.min(100, Number.isFinite(Number(src.points)) ? Number(src.points) : 10)),
    };

    if (station.hints.length === 0) {
      station.hints.push("Look back at the clue and try one careful step.");
      notes.push("Station " + (i + 1) + " had no hints — added a placeholder you can edit.");
    }

    let reason = "";
    if (type === "cipher") {
      content.cipherType = cipherSet.has(toText(content.cipherType)) ? toText(content.cipherType) : "caesar";
      content.shift = Math.max(-25, Math.min(25, parseInt(content.shift, 10) || 0));
      content.plaintext = clamp(content.plaintext, 220);
      if (!content.plaintext) reason = "cipher needs plaintext";
      if (!station.answer && content.plaintext) station.answer = content.plaintext;
    } else if (type === "vocab-lock") {
      content.definition = clamp(content.definition, 500);
      content.sentence = clamp(content.sentence, 500);
      content.firstLetter = clamp(content.firstLetter, 5);
      content.length = Number.isFinite(Number(content.length)) ? Math.max(0, Math.min(80, Number(content.length))) : undefined;
      if (!content.definition) reason = "vocab-lock needs a definition";
    } else if (type === "attribution") {
      content.quote = clamp(content.quote, 700);
      content.work = clamp(content.work, 160);
      content.options = listFrom(content.options).slice(0, 8);
      if (!content.quote) reason = "attribution needs a quote";
    } else if (type === "sequence") {
      content.prompt = clamp(content.prompt, 400);
      content.items = listFrom(content.items).slice(0, 12);
      if (content.items.length < 2) reason = "sequence needs at least two items";
      station.answer = content.items.join("|");
      station.match = "ordered";
    } else if (type === "fill-blank") {
      content.text = clamp(content.text, 800);
      content.blankLabel = clamp(content.blankLabel, 100);
      content.wordBank = listFrom(content.wordBank).slice(0, 12);
      if (!content.text || !content.text.includes("____")) reason = "fill-blank needs text containing ____";
    } else if (type === "anagram") {
      content.scrambled = clamp(content.scrambled, 120);
      content.clue = clamp(content.clue, 400);
      if (!content.scrambled) reason = "anagram needs scrambled letters";
      if (content.scrambled && station.answer && lettersOnly(content.scrambled) !== lettersOnly(station.answer)) {
        notes.push("Station " + (i + 1) + " anagram letters do not exactly match the answer.");
      }
    } else if (type === "comprehension") {
      content.passage = clamp(content.passage, 1000);
      content.question = clamp(content.question, 500);
      content.options = listFrom(content.options).slice(0, 8);
      if (!content.question || content.options.length < 2) reason = "comprehension needs a question and at least two options";
    } else if (type === "hidden-word") {
      content.instruction = clamp(content.instruction, 400);
      content.grid = listFrom(content.grid).map((row) => row.replace(/\s+/g, " ").toUpperCase()).slice(0, 12);
      content.targets = listFrom(content.targets).slice(0, 12);
      if (content.targets.length && !station.answer) station.answer = content.targets[0];
      station.match = "set";
      if (!content.grid.length || !content.targets.length) reason = "hidden-word needs a grid and targets";
    } else if (type === "riddle") {
      content.riddle = clamp(content.riddle, 700);
      content.prompt = clamp(content.prompt, 300);
      if (!content.riddle) reason = "riddle needs riddle text";
    } else if (type === "spelling-lock") {
      content.definition = clamp(content.definition, 500);
      content.hintLetters = clamp(content.hintLetters, 120);
      content.audioText = clamp(content.audioText, 120);
      station.match = "exact";
      if (!content.definition) reason = "spelling-lock needs a definition";
    } else if (type === "odd-one-out") {
      content.prompt = clamp(content.prompt, 400);
      content.items = listFrom(content.items).slice(0, 12);
      if (content.items.length < 2) reason = "odd-one-out needs at least two items";
    }

    if (!station.answer) reason = reason || "station needs an answer";
    if (reason) {
      station.__unusable = true;
      station.__reason = reason;
    }

    if (station.type === "sequence") {
      station.acceptedAnswers = station.acceptedAnswers.length ? station.acceptedAnswers : [station.answer];
      addUnique(station.acceptedAnswers, station.answer);
    } else if (station.type === "hidden-word") {
      station.acceptedAnswers = content.targets && content.targets.length ? content.targets.slice() : station.acceptedAnswers;
      addUnique(station.acceptedAnswers, station.answer);
    } else {
      addUnique(station.acceptedAnswers, station.answer);
    }

    if (station.type === "comprehension" && Array.isArray(content.options) && content.options.length) {
      const idx = content.options.findIndex((opt) => opt.toLowerCase() === station.answer.toLowerCase());
      if (idx >= 0) addUnique(station.acceptedAnswers, String.fromCharCode(97 + idx));
    }

    return station;
  }

  function normalizeQuest(raw) {
    const notes = [];
    const unusable = [];
    const src = raw && typeof raw === "object" ? raw : {};
    const schema = toText(src.schema);
    if (!schema || !schema.startsWith("ish-quest@1")) {
      notes.push("Schema was missing or not version 1 — set it to ish-quest@1.");
    }
    const metaSrc = src.meta && typeof src.meta === "object" ? src.meta : {};
    const settingsSrc = src.settings && typeof src.settings === "object" ? src.settings : {};
    const storySrc = src.story && typeof src.story === "object" ? src.story : {};
    let mode = toText(metaSrc.mode);
    if (!modeSet.has(mode)) {
      mode = "escape";
      notes.push("Mode was missing or unknown — using escape mode.");
    }
    let theme = toText(metaSrc.theme) || "library";
    if (!themeSet.has(theme)) {
      notes.push("Theme was not one of the built-in themes — using library.");
      theme = "library";
    }
    const title = clamp(metaSrc.title, 140) || "Untitled Quest";
    const pack = {
      schema: "ish-quest@1",
      meta: {
        id: kebab(metaSrc.id || title, "quest-" + Math.abs(hashStr(title)).toString(36)),
        title,
        unit: clamp(metaSrc.unit, 220),
        subject: clamp(metaSrc.subject, 160) || "English: Language & Literature",
        year: clamp(metaSrc.year, 80) || "Year group",
        mode,
        theme,
        author: clamp(metaSrc.author, 100),
        createdAt: Number.isFinite(Number(metaSrc.createdAt)) ? Number(metaSrc.createdAt) : 0,
      },
      story: {
        introTitle: clamp(storySrc.introTitle, 120),
        intro: clamp(storySrc.intro, 1200) || "A quest waits for you. Solve each station carefully.",
        outro: clamp(storySrc.outro, 1200) || "You solved the quest.",
      },
      settings: {
        hints: ["off", "free", "costed"].includes(toText(settingsSrc.hints)) ? toText(settingsSrc.hints) : "free",
        hintPenalty: Math.max(0, Math.min(50, Number.isFinite(Number(settingsSrc.hintPenalty)) ? Number(settingsSrc.hintPenalty) : 5)),
        startScore: Math.max(0, Math.min(500, Number.isFinite(Number(settingsSrc.startScore)) ? Number(settingsSrc.startScore) : 100)),
        shuffleHunt: Boolean(settingsSrc.shuffleHunt),
        showProgress: settingsSrc.showProgress !== false,
        timer: false,
        certificate: settingsSrc.certificate !== false,
        fontDefault: toText(settingsSrc.fontDefault) === "dyslexic" ? "dyslexic" : "standard",
      },
      stations: [],
    };

    if (mode === "hunt") {
      const fc = settingsSrc.finalCode && typeof settingsSrc.finalCode === "object" ? settingsSrc.finalCode : {};
      pack.settings.finalCode = {
        type: ["join", "word", "free"].includes(toText(fc.type)) ? toText(fc.type) : "join",
        value: clamp(fc.value, 120),
        separator: clamp(fc.separator, 10),
        label: clamp(fc.label, 160) || "Enter the treasure word",
      };
    }

    const rawStations = Array.isArray(src.stations) ? src.stations : (src.stations && typeof src.stations === "object" ? [src.stations] : []);
    if (!Array.isArray(src.stations) && src.stations && typeof src.stations === "object") {
      notes.push("Stations was a single object — wrapped it in a list.");
    }
    rawStations.forEach((stationRaw, i) => {
      if (!stationRaw || typeof stationRaw !== "object" || Array.isArray(stationRaw)) {
        notes.push("Station " + (i + 1) + " was not an object — skipped it.");
        return;
      }
      const station = normalizeStation(stationRaw, pack.stations.length, notes);
      pack.stations.push(station);
    });
    if (!pack.stations.length) notes.push("No usable station objects were found.");

    const seen = new Map();
    pack.stations.forEach((station, i) => {
      let id = station.id || ("s" + (i + 1));
      if (seen.has(id)) id = id + "-" + (i + 1);
      seen.set(id, true);
      station.id = id;
      if (station.__unusable) unusable.push({ index: i, id: station.id, name: station.name, reason: station.__reason || "cannot render" });
    });

    return { pack, notes, unusable };
  }

  function stripCodeFences(text, notes) {
    let t = text.trim();
    const before = t;
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    if (t !== before) notes.push("Removed Markdown code fences around the JSON.");
    return t;
  }

  function largestBalancedObject(text) {
    let inString = false;
    let escape = false;
    let depth = 0;
    let start = -1;
    let best = "";
    for (let i = 0; i < text.length; i += 1) {
      const ch = text.charAt(i);
      if (inString) {
        if (escape) escape = false;
        else if (ch === "\\") escape = true;
        else if (ch === "\"") inString = false;
        continue;
      }
      if (ch === "\"") {
        inString = true;
        continue;
      }
      if (ch === "{") {
        if (depth === 0) start = i;
        depth += 1;
      } else if (ch === "}") {
        if (depth > 0) depth -= 1;
        if (depth === 0 && start >= 0) {
          const block = text.slice(start, i + 1);
          if (block.length > best.length) best = block;
          start = -1;
        }
      }
    }
    return best || text;
  }

  function stripComments(text) {
    let out = "";
    let inString = false;
    let escape = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text.charAt(i);
      const next = text.charAt(i + 1);
      if (inString) {
        out += ch;
        if (escape) escape = false;
        else if (ch === "\\") escape = true;
        else if (ch === "\"") inString = false;
        continue;
      }
      if (ch === "\"") {
        inString = true;
        out += ch;
      } else if (ch === "/" && next === "/") {
        while (i < text.length && text.charAt(i) !== "\n") i += 1;
        out += "\n";
      } else if (ch === "/" && next === "*") {
        i += 2;
        while (i < text.length && !(text.charAt(i) === "*" && text.charAt(i + 1) === "/")) i += 1;
        i += 1;
      } else {
        out += ch;
      }
    }
    return out;
  }

  function conservativeFix(text) {
    return stripComments(text)
      .replace(/[\u201c\u201d]/g, "\"")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/,\s*([}\]])/g, "$1");
  }

  function validatePackText(rawText) {
    const notes = [];
    let text = String(rawText == null ? "" : rawText).trim();
    if (!text) return { ok: false, notes, unusable: [], error: "Paste the JSON reply first." };
    text = stripCodeFences(text, notes);
    const extracted = largestBalancedObject(text);
    if (extracted !== text) {
      text = extracted.trim();
      notes.push("Removed text the AI added around the JSON.");
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (firstErr) {
      const fixed = conservativeFix(text);
      if (fixed !== text) notes.push("Cleaned smart quotes, comments, or trailing commas and tried again.");
      try {
        parsed = JSON.parse(fixed);
      } catch (secondErr) {
        return { ok: false, notes, unusable: [], error: secondErr.message || firstErr.message || "The JSON could not be parsed." };
      }
    }
    if (parsed && typeof parsed === "object" && parsed.stations && !Array.isArray(parsed.stations) && typeof parsed.stations === "object") {
      parsed.stations = [parsed.stations];
      notes.push("Stations was a single object — wrapped it in a list.");
    }
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.stations)) {
      const before = parsed.stations.length;
      parsed.stations = parsed.stations.filter((s) => s && typeof s === "object" && !Array.isArray(s));
      if (parsed.stations.length !== before) notes.push("Removed station entries that were not objects.");
    }
    const out = normalizeQuest(parsed);
    return {
      ok: out.unusable.length === 0 && out.pack.stations.length > 0,
      pack: out.pack,
      notes: notes.concat(out.notes),
      unusable: out.unusable,
      error: out.unusable.length ? "Some stations need fixing before students can play." : "",
    };
  }

  window.QuestSchema = {
    PUZZLE_TYPES,
    MODES,
    THEMES,
    normalizeQuest,
    normalizeStation,
    validatePackText,
    $,
    $$,
    el,
    toText,
    safeHref,
    hashStr,
    kebab,
    nowSeconds,
    toast,
    openDialog,
    closeDialog,
    initRoving,
    selectRadio,
    wireRadioKeys,
  };
})();
