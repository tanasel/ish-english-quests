(function () {
  "use strict";

  const S = window.QuestSchema;
  const Store = window.QuestStore;
  const Share = window.QuestShare;
  const el = S.el;

  const state = {
    manifest: [],
  };

  let root = null;

  function allQuestRows() {
    const rows = [];
    const seen = new Set();
    const seeds = Array.isArray(window.QUEST_SEEDS) ? window.QUEST_SEEDS : [];
    seeds.forEach((pack) => {
      if (!pack || !pack.meta || seen.has(pack.meta.id)) return;
      seen.add(pack.meta.id);
      rows.push({
        id: pack.meta.id,
        title: pack.meta.title,
        unit: pack.meta.unit,
        grade: pack.meta.year,
        mode: pack.meta.mode,
        theme: pack.meta.theme,
        stations: (pack.stations || []).length,
        seed: true,
      });
    });
    state.manifest.forEach((item) => {
      if (!item || !item.id || seen.has(item.id)) return;
      seen.add(item.id);
      rows.push(item);
    });
    return rows;
  }

  function readingControls() {
    const prefs = Store.getPrefs();
    const controls = el("div", "quest-controls");
    function pref(label, pressed, fn) {
      const b = el("button", "btn btn--ghost control-btn", label);
      b.type = "button";
      b.setAttribute("aria-pressed", pressed ? "true" : "false");
      b.addEventListener("click", fn);
      controls.appendChild(b);
    }
    pref(prefs.theme === "dark" ? "Light" : "Dark", prefs.theme === "dark", () => {
      Store.setPrefs({ theme: Store.getPrefs().theme === "dark" ? "light" : "dark" });
      render();
    });
    pref("Easy-reading", prefs.font === "dyslexic", () => {
      const p = Store.getPrefs();
      Store.setPrefs({ font: p.font === "dyslexic" ? "standard" : "dyslexic", biggerText: p.font !== "dyslexic" ? true : p.biggerText });
      render();
    });
    pref("High contrast", prefs.contrast, () => {
      Store.setPrefs({ contrast: !Store.getPrefs().contrast });
      render();
    });
    return controls;
  }

  function card(row) {
    const li = el("li", "card quest-card");
    const meta = el("div", "card__meta");
    meta.append(el("span", "badge", row.mode || "quest"), el("span", "tag-field", row.theme || "library"));
    li.appendChild(meta);
    li.appendChild(el("h3", "card__title", row.title || "Untitled quest"));
    li.appendChild(el("p", "card__source", [row.grade, row.stations ? row.stations + " stations" : ""].filter(Boolean).join(" · ")));
    if (row.unit) li.appendChild(el("p", "card__note", row.unit));
    const foot = el("div", "card__foot");
    const play = el("a", "card__open", "Open quest");
    play.href = "play.html?id=" + encodeURIComponent(row.id);
    const copy = el("button", "card__del", "Copy link");
    copy.type = "button";
    copy.addEventListener("click", () => {
      const href = new URL(play.getAttribute("href"), window.location.href).href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(href).then(() => S.toast("Link copied")).catch(() => S.toast("Open the quest and copy the address."));
      } else {
        S.toast("Open the quest and copy the address.");
      }
    });
    foot.append(play, copy);
    li.appendChild(foot);
    return li;
  }

  function openImportDialog() {
    const old = S.$("#importDialog");
    if (old) old.remove();
    const dlg = el("dialog", "modal");
    dlg.id = "importDialog";
    const form = el("div", "modal__form");
    const head = el("div", "modal__head");
    head.appendChild(el("h2", "modal__title", "Open a quest"));
    const close = el("button", "icon-btn", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", () => S.closeDialog(dlg));
    head.appendChild(close);
    form.appendChild(head);
    const pasteLabel = el("label", "field");
    const paste = el("textarea", "answer-input");
    paste.rows = 10;
    pasteLabel.append(el("span", "field__legend", "Paste quest JSON"), paste);
    const file = el("input");
    file.type = "file";
    file.accept = "application/json,.json";
    const status = el("p", "feedback");
    status.setAttribute("aria-live", "polite");
    const openPaste = el("button", "btn btn--primary", "Open pasted quest");
    openPaste.type = "button";
    openPaste.addEventListener("click", () => {
      const result = S.validatePackText(paste.value);
      if (result.pack && result.pack.stations.length) window.location.href = "play.html#q=" + Share.encodePack(result.pack);
      else status.textContent = result.error || "That quest could not be opened.";
    });
    file.addEventListener("change", () => {
      const selected = file.files && file.files[0];
      if (!selected) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const result = S.validatePackText(reader.result || "");
        if (result.pack && result.pack.stations.length) window.location.href = "play.html#q=" + Share.encodePack(result.pack);
        else status.textContent = result.error || "That file could not be opened.";
      });
      reader.readAsText(selected);
    });
    form.append(pasteLabel, openPaste, el("p", "field__hint", "Or choose a JSON file from this device."), file, status);
    dlg.appendChild(form);
    document.body.appendChild(dlg);
    S.openDialog(dlg, "textarea");
  }

  function savedSection() {
    const saved = Store.getSavedQuests();
    const section = el("section", "saved-section");
    section.appendChild(el("h2", "section-title", "Saved on this device"));
    if (!saved.length) {
      section.appendChild(el("p", "empty__hint", "No saved quests yet. Builder saves stay in this browser."));
      return section;
    }
    const list = el("ul", "grid");
    saved.forEach((pack) => {
      const normalized = S.normalizeQuest(pack).pack;
      const row = {
        id: normalized.meta.id,
        title: normalized.meta.title,
        unit: normalized.meta.unit,
        grade: normalized.meta.year,
        mode: normalized.meta.mode,
        theme: normalized.meta.theme,
        stations: normalized.stations.length,
      };
      const li = card(row);
      const play = li.querySelector(".card__open");
      play.href = "play.html#q=" + Share.encodePack(normalized);
      list.appendChild(li);
    });
    section.appendChild(list);
    return section;
  }

  function render() {
    root.textContent = "";
    const shell = el("div", "launcher-shell");
    const head = el("header", "masthead launcher-head");
    const inner = el("div", "masthead__inner");
    const brand = el("div", "masthead__brand");
    const logoPlate = el("div", "brand-plate");
    const logoImg = el("img", "brand-plate__img");
    logoImg.src = "assets/ish-logo.png";
    logoImg.alt = "The International School of The Hague";
    logoPlate.appendChild(logoImg);
    brand.append(logoPlate, el("p", "kicker", "ISH English Department"), el("h1", "wordmark", "Quest Forge"), el("p", "lede", "Build and play curriculum quest packs: escape rooms and treasure hunts that run offline in a browser."));
    const actions = el("div", "masthead__actions");
    const build = el("a", "btn btn--primary wax-btn", "Build a quest");
    build.href = "build.html";
    const open = el("button", "btn btn--ghost", "Open a quest");
    open.type = "button";
    open.addEventListener("click", openImportDialog);
    const howto = el("a", "btn btn--ghost", "How to build");
    howto.href = "how-to.html";
    actions.append(build, open, howto, readingControls());
    inner.append(brand, actions);
    head.appendChild(inner);
    shell.appendChild(head);

    const main = el("main", "layout launcher-layout");
    main.id = "main";
    const section = el("section", "results");
    const top = el("div", "results__head");
    top.appendChild(el("p", "results__count", allQuestRows().length + " ready-to-play quests"));
    section.appendChild(top);
    const list = el("ul", "grid");
    allQuestRows().forEach((row) => list.appendChild(card(row)));
    section.appendChild(list);
    main.appendChild(section);
    shell.appendChild(main);
    shell.appendChild(savedSection());
    root.appendChild(shell);
  }

  async function loadManifest() {
    try {
      const res = await fetch("quests/index.json?v=1");
      if (!res.ok) return;
      const data = await res.json();
      state.manifest = Array.isArray(data) ? data : [];
      render();
    } catch {
      state.manifest = [];
    }
  }

  function init() {
    root = S.$("#launcherRoot");
    if (!root) return;
    render();
    loadManifest();
  }

  window.QuestLauncher = {
    render,
    state,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
