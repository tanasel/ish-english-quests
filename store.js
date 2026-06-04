(function () {
  "use strict";

  const S = window.QuestSchema || {};
  const PREF_KEY = "ishQuest.prefs.v1";
  const SAVED_KEY = "ishQuest.saved.v1";
  const PROGRESS_PREFIX = "ishQuest.progress.v1::";
  const memory = {};

  function readRaw(key) {
    try {
      const value = window.localStorage.getItem(key);
      return value == null ? memory[key] : value;
    } catch {
      return memory[key];
    }
  }

  function writeRaw(key, value) {
    memory[key] = value;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function removeRaw(key) {
    delete memory[key];
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function readJson(key, fallback) {
    try {
      const raw = readRaw(key);
      if (!raw) return fallback;
      const data = JSON.parse(raw);
      return data == null ? fallback : data;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      return writeRaw(key, JSON.stringify(value));
    } catch {
      return false;
    }
  }

  function systemTheme() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  function defaultPrefs() {
    return {
      theme: systemTheme(),
      font: "standard",
      contrast: false,
      sound: false,
      biggerText: false,
    };
  }

  function normalizePrefs(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    const d = defaultPrefs();
    return {
      theme: raw.theme === "dark" || raw.theme === "light" ? raw.theme : d.theme,
      font: raw.font === "dyslexic" ? "dyslexic" : "standard",
      contrast: Boolean(raw.contrast),
      sound: Boolean(raw.sound),
      biggerText: Boolean(raw.biggerText),
    };
  }

  function getPrefs() {
    return normalizePrefs(readJson(PREF_KEY, null));
  }

  function applyPrefs(prefs) {
    const p = normalizePrefs(prefs || getPrefs());
    const root = document.documentElement;
    root.dataset.theme = p.theme;
    root.dataset.font = p.font;
    root.dataset.contrast = p.contrast ? "high" : "normal";
    root.dataset.size = p.biggerText ? "big" : "normal";
    root.dataset.sound = p.sound ? "on" : "off";
    return p;
  }

  function savePrefs(prefs) {
    const p = normalizePrefs(prefs);
    writeJson(PREF_KEY, p);
    applyPrefs(p);
    try { window.dispatchEvent(new CustomEvent("quest:prefs", { detail: p })); } catch { /* ignore */ }
    return p;
  }

  function setPrefs(partial) {
    return savePrefs(Object.assign({}, getPrefs(), partial || {}));
  }

  function progressKey(packId) {
    return PROGRESS_PREFIX + String(packId || "unknown");
  }

  function defaultProgress(pack) {
    const now = S.nowSeconds ? S.nowSeconds() : Math.floor(Date.now() / 1000);
    const id = pack && pack.meta ? pack.meta.id : "unknown";
    const mode = pack && pack.meta ? pack.meta.mode : "escape";
    return {
      version: 1,
      packId: id,
      mode,
      solvedById: {},
      fragments: {},
      hintsUsed: {},
      score: pack && pack.settings ? Number(pack.settings.startScore) || 100 : 100,
      startedAt: now,
      updatedAt: now,
      finished: false,
    };
  }

  function loadProgress(pack) {
    const fresh = defaultProgress(pack);
    const id = fresh.packId;
    const raw = readJson(progressKey(id), null);
    if (!raw || raw.version !== 1 || raw.packId !== id || raw.mode !== fresh.mode) return fresh;
    return {
      version: 1,
      packId: id,
      mode: fresh.mode,
      solvedById: raw.solvedById && typeof raw.solvedById === "object" ? raw.solvedById : {},
      fragments: raw.fragments && typeof raw.fragments === "object" ? raw.fragments : {},
      hintsUsed: raw.hintsUsed && typeof raw.hintsUsed === "object" ? raw.hintsUsed : {},
      score: Number.isFinite(Number(raw.score)) ? Number(raw.score) : fresh.score,
      startedAt: Number.isFinite(Number(raw.startedAt)) ? Number(raw.startedAt) : fresh.startedAt,
      updatedAt: Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : fresh.updatedAt,
      finished: Boolean(raw.finished),
    };
  }

  function saveProgress(pack, progress) {
    const next = Object.assign(defaultProgress(pack), progress || {});
    next.updatedAt = S.nowSeconds ? S.nowSeconds() : Math.floor(Date.now() / 1000);
    writeJson(progressKey(next.packId), next);
    return next;
  }

  function clearProgress(packOrId) {
    const id = typeof packOrId === "string" ? packOrId : (packOrId && packOrId.meta && packOrId.meta.id);
    return removeRaw(progressKey(id));
  }

  function getSavedQuests() {
    const saved = readJson(SAVED_KEY, []);
    return Array.isArray(saved) ? saved.filter((p) => p && typeof p === "object") : [];
  }

  function saveSavedQuests(list) {
    return writeJson(SAVED_KEY, Array.isArray(list) ? list : []);
  }

  function upsertSavedQuest(pack) {
    if (!pack || !pack.meta) return false;
    const list = getSavedQuests().filter((p) => p && p.meta && p.meta.id !== pack.meta.id);
    list.unshift(pack);
    return saveSavedQuests(list.slice(0, 50));
  }

  function deleteSavedQuest(id) {
    return saveSavedQuests(getSavedQuests().filter((p) => !(p && p.meta && p.meta.id === id)));
  }

  function exportPackJson(pack) {
    return JSON.stringify(pack, null, 2);
  }

  applyPrefs(getPrefs());

  window.QuestStore = {
    getPrefs,
    savePrefs,
    setPrefs,
    applyPrefs,
    loadProgress,
    saveProgress,
    clearProgress,
    getSavedQuests,
    upsertSavedQuest,
    deleteSavedQuest,
    exportPackJson,
    _readJson: readJson,
    _writeJson: writeJson,
  };
})();
