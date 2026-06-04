(function () {
  "use strict";

  const S = window.QuestSchema;
  const Store = window.QuestStore;
  const Prompt = window.QuestPrompt;
  const Share = window.QuestShare;
  const Player = window.QuestPlayer;
  const el = S.el;

  const state = {
    step: 0,
    selectedStation: 0,
    paste: "",
    result: null,
    pack: null,
    inputs: {
      topic: "",
      sourceText: "",
      subject: "English: Language & Literature",
      year: "Year 8 (MYP 3)",
      mode: "escape",
      stationCount: 5,
      difficulty: "standard",
      puzzleTypes: [],
      aiChooses: true,
      theme: "library",
      mustInclude: "",
    },
  };

  let root = null;

  function setStep(step) {
    state.step = step;
    render();
  }

  function button(cls, text, fn) {
    const b = el("button", cls || "btn", text);
    b.type = "button";
    if (fn) b.addEventListener("click", fn);
    return b;
  }

  function linkButton(href, text, cls) {
    const a = el("a", cls || "btn btn--ghost", text);
    a.href = href;
    return a;
  }

  function copyText(text, success) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => S.toast(success || "Copied")).catch(() => S.toast("Select the text and press Ctrl/Cmd-C."));
      return;
    }
    S.toast("Select the text and press Ctrl/Cmd-C.");
  }

  function downloadJson(pack) {
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = (pack.meta.id || "quest") + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function shareUrl(pack) {
    const cfg = window.QUEST_CONFIG || {};
    const rel = Share.buildPlayUrl(pack, cfg.basePath || "");
    try { return new URL(rel, window.location.href).href; } catch (e) { return rel; }
  }

  function stampPack(pack) {
    const normalized = S.normalizeQuest(pack).pack;
    if (!normalized.meta.createdAt) normalized.meta.createdAt = S.nowSeconds();
    if (!normalized.meta.id) normalized.meta.id = S.kebab(normalized.meta.title, "quest-" + Math.abs(S.hashStr(normalized.meta.title)).toString(36));
    return normalized;
  }

  function shell(title, body) {
    const wrap = el("div", "builder-shell");
    const head = el("header", "quest-head builder-head");
    const nav = el("nav", "top-links");
    nav.append(linkButton("index.html", "Quest library", "top-link"), linkButton("play.html", "Open player", "top-link"), linkButton("how-to.html", "How to", "top-link"));
    const brandPlate = el("div", "brand-plate");
    const brandLogo = el("img", "brand-plate__img");
    brandLogo.src = "assets/ish-logo.png";
    brandLogo.alt = "The International School of The Hague";
    brandPlate.appendChild(brandLogo);
    const kicker = el("p", "kicker", "Quest Forge");
    const h = el("h1", "wordmark quest-title", title);
    head.append(nav, brandPlate, kicker, h, readingControls());
    wrap.append(head, body);
    return wrap;
  }

  function readingControls() {
    const prefs = Store.getPrefs();
    const controls = el("div", "quest-controls builder-controls");
    const easy = button("btn btn--ghost control-btn", "Easy-reading", () => {
      const p = Store.getPrefs();
      Store.setPrefs({ font: p.font === "dyslexic" ? "standard" : "dyslexic", biggerText: p.font !== "dyslexic" ? true : p.biggerText });
      render();
    });
    easy.setAttribute("aria-pressed", prefs.font === "dyslexic" ? "true" : "false");
    const theme = button("btn btn--ghost control-btn", prefs.theme === "dark" ? "Light" : "Dark", () => {
      Store.setPrefs({ theme: Store.getPrefs().theme === "dark" ? "light" : "dark" });
      render();
    });
    theme.setAttribute("aria-pressed", prefs.theme === "dark" ? "true" : "false");
    const contrast = button("btn btn--ghost control-btn", "High contrast", () => {
      Store.setPrefs({ contrast: !Store.getPrefs().contrast });
      render();
    });
    contrast.setAttribute("aria-pressed", prefs.contrast ? "true" : "false");
    controls.append(easy, theme, contrast);
    return controls;
  }

  function stepCard(stepTitle) {
    const card = el("main", "builder-main");
    card.id = "main";
    const section = el("section", "scroll-card builder-card");
    section.appendChild(el("p", "kicker", state.step === 0 ? "Home" : "Step " + state.step + " of 4"));
    section.appendChild(el("h2", "section-title", stepTitle));
    card.appendChild(section);
    return { card, section };
  }

  function savedCard(pack) {
    const card = el("li", "card quest-card");
    const meta = el("p", "card__source", [pack.meta.mode, pack.meta.year, (pack.stations || []).length + " stations"].join(" · "));
    card.append(el("h3", "card__title", pack.meta.title), meta);
    if (pack.meta.unit) card.appendChild(el("p", "card__note", pack.meta.unit));
    const foot = el("div", "card__foot");
    const play = linkButton(shareUrl(pack), "Play", "card__open");
    const edit = button("card__del", "Edit", () => {
      state.pack = stampPack(pack);
      state.selectedStation = 0;
      setStep(4);
    });
    const exportBtn = button("card__del", "Export", () => downloadJson(pack));
    const del = button("card__del", "Delete", () => {
      if (!window.confirm("Delete this saved quest from this browser?")) return;
      Store.deleteSavedQuest(pack.meta.id);
      render();
      S.toast("Saved quest deleted", { label: "Undo", fn: () => { Store.upsertSavedQuest(pack); render(); } });
    });
    foot.append(play, edit, exportBtn, del);
    card.appendChild(foot);
    return card;
  }

  function renderHome() {
    const { card, section } = stepCard("Build English quest packs");
    const actions = el("div", "hero-actions");
    actions.append(
      button("btn btn--primary wax-btn", "Build a new quest", () => setStep(1)),
      linkButton("play.html", "Open a quest", "btn btn--ghost")
    );
    section.appendChild(el("p", "lede", "Create a no-login escape room or treasure hunt with a copy-paste AI bridge, then share it as a link or JSON file."));
    section.appendChild(actions);

    const strip = el("ol", "how-strip");
    ["Describe", "Paste into your AI", "Play & share"].forEach((label) => {
      const li = el("li", "how-step", label);
      strip.appendChild(li);
    });
    section.appendChild(strip);

    const saved = Store.getSavedQuests();
    const savedWrap = el("section", "saved-section");
    savedWrap.appendChild(el("h2", "section-title", "My quests"));
    if (!saved.length) {
      savedWrap.appendChild(el("p", "empty__hint", "No saved quests on this device yet."));
    } else {
      const list = el("ul", "grid");
      saved.forEach((pack) => list.appendChild(savedCard(S.normalizeQuest(pack).pack)));
      savedWrap.appendChild(list);
    }
    card.appendChild(savedWrap);
    root.appendChild(shell("Quest Forge", card));
  }

  function inputField(label, key, type) {
    const field = el("label", "field");
    const span = el("span", "field__legend", label);
    const input = type === "textarea" ? el("textarea", "answer-input") : el("input", "answer-input");
    if (type === "textarea") input.rows = 5;
    else input.type = type || "text";
    input.value = state.inputs[key] == null ? "" : String(state.inputs[key]);
    input.addEventListener("input", () => { state.inputs[key] = input.value; });
    field.append(span, input);
    return field;
  }

  function radioTiles(label, key, options) {
    const wrap = el("div", "field");
    wrap.appendChild(el("p", "field__legend", label));
    const group = el("div", "tile-group");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", label);
    options.forEach((opt) => {
      const b = el("button", "tile");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.dataset.value = opt.value;
      b.setAttribute("aria-checked", state.inputs[key] === opt.value ? "true" : "false");
      b.append(el("span", "tile__title", opt.label), el("span", "tile__desc", opt.desc || ""));
      b.addEventListener("click", () => {
        state.inputs[key] = opt.value;
        S.selectRadio(group, opt.value);
      });
      group.appendChild(b);
    });
    wrap.appendChild(group);
    S.wireRadioKeys(group);
    return wrap;
  }

  function puzzleChips() {
    const wrap = el("div", "field");
    wrap.appendChild(el("p", "field__legend", "Puzzle types"));
    const group = el("div", "filter-group__options");
    const ai = button("chip", "Let the AI choose", () => {
      state.inputs.aiChooses = !state.inputs.aiChooses;
      if (state.inputs.aiChooses) state.inputs.puzzleTypes = [];
      render();
    });
    ai.setAttribute("aria-pressed", state.inputs.aiChooses ? "true" : "false");
    group.appendChild(ai);
    S.PUZZLE_TYPES.forEach((type) => {
      const on = state.inputs.puzzleTypes.includes(type);
      const chip = button("chip", type, () => {
        state.inputs.aiChooses = false;
        if (state.inputs.puzzleTypes.includes(type)) state.inputs.puzzleTypes = state.inputs.puzzleTypes.filter((t) => t !== type);
        else state.inputs.puzzleTypes = state.inputs.puzzleTypes.concat([type]);
        render();
      });
      chip.setAttribute("aria-pressed", on ? "true" : "false");
      group.appendChild(chip);
    });
    wrap.appendChild(group);
    return wrap;
  }

  function themeSelect() {
    const field = el("label", "field");
    field.appendChild(el("span", "field__legend", "Tone / theme"));
    const select = el("select", "answer-input");
    S.THEMES.forEach((theme) => {
      const o = el("option", "", theme);
      o.value = theme;
      select.appendChild(o);
    });
    select.value = S.THEMES.includes(state.inputs.theme) ? state.inputs.theme : "library";
    select.addEventListener("change", () => { state.inputs.theme = select.value; });
    field.appendChild(select);
    return field;
  }

  function renderDescribe() {
    const { card, section } = stepCard("Describe the quest");
    section.appendChild(el("p", "lede", "Add either a unit/topic or source text. Everything else can stay at the defaults."));
    section.append(inputField("Unit or topic", "topic"), inputField("Source text", "sourceText", "textarea"));
    const row = el("div", "field-row");
    row.append(inputField("Subject strand", "subject"), inputField("Target year / level", "year"));
    section.appendChild(row);
    section.appendChild(radioTiles("Mode", "mode", [
      { value: "escape", label: "Escape room", desc: "Solve stations in order." },
      { value: "hunt", label: "Treasure hunt", desc: "Open stations freely." },
    ]));
    const count = inputField("Number of stations (3–8)", "stationCount", "number");
    const countInput = count.querySelector("input");
    countInput.min = "3";
    countInput.max = "8";
    countInput.step = "1";
    section.appendChild(count);
    section.appendChild(radioTiles("Difficulty", "difficulty", [
      { value: "gentle", label: "Gentle", desc: "Shorter and scaffolded." },
      { value: "standard", label: "Standard", desc: "Grade-level mix." },
      { value: "challenge", label: "Challenge", desc: "Richer multi-step tasks." },
    ]));
    section.append(puzzleChips(), themeSelect(), inputField("Must-include vocabulary or quotations", "mustInclude", "textarea"));
    const error = el("p", "form-error");
    error.hidden = true;
    const foot = el("div", "modal__foot");
    foot.append(button("btn btn--ghost", "Back", () => setStep(0)), button("btn btn--primary", "Next", () => {
      if (!String(state.inputs.topic || "").trim() && !String(state.inputs.sourceText || "").trim()) {
        error.textContent = "Add a topic or paste source text before continuing.";
        error.hidden = false;
        return;
      }
      state.inputs.stationCount = Math.max(3, Math.min(8, parseInt(state.inputs.stationCount, 10) || 5));
      setStep(2);
    }));
    section.append(error, foot);
    root.appendChild(shell("Build a Quest", card));
  }

  function promptText() {
    return Prompt.buildPrompt(Object.assign({}, state.inputs, {
      puzzleTypes: state.inputs.aiChooses ? [] : state.inputs.puzzleTypes,
    }));
  }

  function renderPrompt() {
    const { card, section } = stepCard("Get your AI prompt");
    const text = promptText();
    const area = el("textarea", "prompt-preview mono");
    area.readOnly = true;
    area.rows = 18;
    area.value = text;
    section.appendChild(area);
    const actions = el("div", "hero-actions");
    actions.append(
      button("btn btn--primary wax-btn", "Copy the prompt", () => {
        area.select();
        copyText(text, "Copied ✓");
      }),
      linkButton("https://chatgpt.com/", "Open ChatGPT", "btn btn--ghost"),
      linkButton("https://gemini.google.com/", "Open Gemini", "btn btn--ghost"),
      linkButton("https://claude.ai/", "Open Claude", "btn btn--ghost")
    );
    actions.querySelectorAll("a").forEach((a) => { a.target = "_blank"; a.rel = "noopener noreferrer"; });
    section.appendChild(actions);
    const strip = el("ol", "how-strip");
    ["Copy this prompt", "Paste it into your AI", "Paste the JSON reply on the next screen"].forEach((label) => strip.appendChild(el("li", "how-step", label)));
    section.appendChild(strip);
    const foot = el("div", "modal__foot");
    foot.append(button("btn btn--ghost", "Back", () => setStep(1)), button("btn btn--primary", "I have the reply", () => setStep(3)));
    section.appendChild(foot);
    root.appendChild(shell("AI Prompt", card));
  }

  function fixupPrompt(error) {
    return "Please repair the quest JSON below. Return ONLY one valid JSON object for schema ish-quest@1. Do not add markdown, comments, or prose. Keep the same educational content where possible. Error to fix: " + (error || "The pack did not validate.") + "\n\n" + state.paste;
  }

  function validatePaste() {
    state.result = S.validatePackText(state.paste);
    if (state.result.pack && state.result.pack.stations.length) state.result.pack = stampPack(state.result.pack);
  }

  function renderPasteResult(section) {
    if (!state.result) return;
    const result = state.result;
    const sealClass = result.ok ? (result.notes.length ? "seal seal--amber" : "seal seal--green") : "seal seal--red";
    const seal = el("div", sealClass, result.ok ? (result.notes.length ? "Repaired" : "Clean") : "Needs fixing");
    section.appendChild(seal);
    if (result.notes.length) {
      const list = el("ul", "note-list");
      result.notes.forEach((note) => list.appendChild(el("li", "", note)));
      section.appendChild(list);
    }
    if (result.unusable.length) {
      const list = el("ul", "note-list note-list--bad");
      result.unusable.forEach((item) => list.appendChild(el("li", "", item.name + ": " + item.reason)));
      section.appendChild(list);
    }
    if (result.ok) {
      section.appendChild(button("btn btn--primary", result.notes.length ? "Looks good — preview" : "Preview", () => {
        state.pack = result.pack;
        state.selectedStation = 0;
        setStep(4);
      }));
    } else {
      const actions = el("div", "hero-actions");
      actions.append(
        button("btn btn--ghost", "Try auto-fix again", () => { validatePaste(); render(); }),
        button("btn btn--ghost", "Copy a fix-up prompt", () => copyText(fixupPrompt(result.error), "Fix-up prompt copied")),
        button("btn btn--primary", "Edit the JSON by hand", () => {
          const area = S.$("#pasteReply");
          if (area) area.focus();
        })
      );
      section.appendChild(actions);
      if (result.error) section.appendChild(el("p", "form-error", result.error));
    }
  }

  function renderPaste() {
    const { card, section } = stepCard("Paste the AI reply");
    const label = el("label", "field");
    const area = el("textarea", "answer-input paste-area");
    area.id = "pasteReply";
    area.rows = 16;
    area.value = state.paste;
    area.addEventListener("input", () => {
      state.paste = area.value;
      state.result = null;
    });
    label.append(el("span", "field__legend", "Quest JSON"), area);
    section.appendChild(label);
    const foot = el("div", "modal__foot");
    foot.append(button("btn btn--ghost", "Back", () => setStep(2)), button("btn btn--primary wax-btn", "Build my quest", () => {
      validatePaste();
      if (state.result.ok && !state.result.notes.length) {
        state.pack = state.result.pack;
        state.selectedStation = 0;
        setStep(4);
      } else {
        render();
      }
    }));
    section.appendChild(foot);
    renderPasteResult(section);
    root.appendChild(shell("Paste Reply", card));
  }

  function saveField(station, key, value) {
    station[key] = value;
    const notes = [];
    state.pack.stations[state.selectedStation] = S.normalizeStation(station, state.selectedStation, notes);
    refreshPreview();
  }

  function editField(label, station, key, type) {
    const field = el("label", "field");
    field.appendChild(el("span", "field__legend", label));
    const input = type === "textarea" ? el("textarea", "answer-input") : el("input", "answer-input");
    if (type === "textarea") input.rows = 3;
    else input.type = "text";
    input.value = station[key] || "";
    const original = input.value;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        input.value = original;
        input.blur();
      }
    });
    input.addEventListener("blur", () => saveField(station, key, input.value));
    field.appendChild(input);
    return field;
  }

  function editContent(station) {
    const field = el("label", "field");
    field.appendChild(el("span", "field__legend", "Puzzle content JSON"));
    const input = el("textarea", "answer-input mono");
    input.rows = 8;
    input.value = JSON.stringify(station.content || {}, null, 2);
    const status = el("p", "feedback");
    status.setAttribute("aria-live", "polite");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        input.value = JSON.stringify(station.content || {}, null, 2);
        input.blur();
      }
    });
    input.addEventListener("blur", () => {
      try {
        station.content = JSON.parse(input.value);
        state.pack.stations[state.selectedStation] = S.normalizeStation(station, state.selectedStation, []);
        status.textContent = "Content saved.";
        refreshPreview();
      } catch (err) {
        status.textContent = "Content JSON is not valid: " + err.message;
      }
    });
    field.append(input, status);
    return field;
  }

  function stationList() {
    const list = el("ol", "corridor-list builder-station-list");
    state.pack.stations.forEach((station, i) => {
      const li = el("li", "corridor-item");
      const b = button("corridor-lock", "", () => {
        state.selectedStation = i;
        render();
      });
      b.textContent = "";
      const status = station.__unusable ? "Amber" : "Ready";
      b.append(el("span", "badge", station.type), el("span", "", station.name), el("span", station.__unusable ? "status-dot status-dot--bad" : "status-dot", status));
      b.setAttribute("aria-current", i === state.selectedStation ? "step" : "false");
      li.appendChild(b);
      list.appendChild(li);
    });
    return list;
  }

  function refreshPreview() {
    const host = S.$("#stationPreview");
    const station = state.pack && state.pack.stations[state.selectedStation];
    if (host && station) Player.renderStationPreview(host, station);
    const status = S.$("#stationStatus");
    if (status && station) status.textContent = station.__unusable ? "Needs fixing: " + station.__reason : "Ready to play.";
  }

  function sizeMeter(pack) {
    const info = Share.packSizeInfo(pack);
    const wrap = el("div", "size-meter size-meter--" + info.band);
    wrap.append(el("span", "", "Share link size"), el("strong", "", String(info.chars) + " chars"), el("span", "", info.band));
    return wrap;
  }

  function fauxQr(text) {
    const grid = el("div", "qr-grid");
    grid.setAttribute("aria-label", "Offline QR-style share marker");
    let seed = Math.abs(S.hashStr(text)) || 1;
    for (let i = 0; i < 121; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const cell = el("span", seed % 3 === 0 ? "is-dark" : "");
      grid.appendChild(cell);
    }
    return grid;
  }

  function openExportDialog(kind) {
    const old = S.$("#builderDialog");
    if (old) old.remove();
    const dlg = el("dialog", "modal");
    dlg.id = "builderDialog";
    const body = el("div", "modal__form");
    const head = el("div", "modal__head");
    head.appendChild(el("h2", "modal__title", kind === "share" ? "Share link" : "Export quest"));
    const close = button("icon-btn", "×", () => S.closeDialog(dlg));
    close.setAttribute("aria-label", "Close");
    head.appendChild(close);
    body.appendChild(head);
    const url = shareUrl(state.pack);
    body.appendChild(sizeMeter(state.pack));
    if (Share.packSizeInfo(state.pack).band === "red") {
      body.appendChild(el("p", "form-error", "This pack is too large for a reliable URL. Export the JSON file and share that instead."));
    } else {
      const box = el("textarea", "answer-input mono share-box");
      box.readOnly = true;
      box.rows = 4;
      box.value = url;
      body.appendChild(box);
      body.appendChild(fauxQr(url));
    }
    const actions = el("div", "modal__foot");
    actions.append(
      button("btn btn--ghost", "Download .json", () => downloadJson(state.pack)),
      button("btn btn--ghost", "Copy share link", () => copyText(url, "Share link copied")),
      button("btn btn--primary", "Copy pack JSON", () => copyText(JSON.stringify(state.pack, null, 2), "Pack JSON copied"))
    );
    body.appendChild(actions);
    dlg.appendChild(body);
    document.body.appendChild(dlg);
    S.openDialog(dlg, "textarea");
  }

  function renderPreview() {
    if (!state.pack) {
      setStep(0);
      return;
    }
    const { card, section } = stepCard("Preview & fix-ups");
    const pack = state.pack;
    const glance = el("div", "pack-glance");
    glance.append(el("p", "kicker", pack.meta.mode), el("h2", "section-title", pack.meta.title), el("p", "story-text", [pack.meta.unit, pack.meta.year, pack.stations.length + " stations"].filter(Boolean).join(" · ")));
    section.appendChild(glance);

    const layout = el("div", "builder-preview-layout");
    const left = el("aside", "scroll-card");
    left.appendChild(el("h2", "filter-group__title", "Stations"));
    left.appendChild(stationList());
    const right = el("section", "scroll-card inspector");
    const station = pack.stations[state.selectedStation] || pack.stations[0];
    if (station) {
      right.appendChild(el("h2", "section-title", station.name));
      const status = el("p", station.__unusable ? "form-error" : "feedback", station.__unusable ? "Needs fixing: " + station.__reason : "Ready to play.");
      status.id = "stationStatus";
      status.setAttribute("aria-live", "polite");
      right.appendChild(status);
      right.append(editField("Name", station, "name"), editField("Narrative", station, "narrative", "textarea"), editField("Answer", station, "answer"), editField("Reveal", station, "reveal", "textarea"), editContent(station));
      const preview = el("div", "station-preview");
      preview.id = "stationPreview";
      right.appendChild(preview);
      const danger = el("div", "hero-actions");
      danger.append(button("btn btn--ghost", "Remove station", () => {
        if (pack.stations.length <= 1) {
          S.toast("A quest needs at least one station.");
          return;
        }
        const removed = pack.stations.splice(state.selectedStation, 1)[0];
        state.selectedStation = Math.max(0, state.selectedStation - 1);
        render();
        S.toast("Station removed", { label: "Undo", fn: () => { pack.stations.splice(state.selectedStation, 0, removed); render(); } });
      }));
      right.appendChild(danger);
    }
    layout.append(left, right);
    section.appendChild(layout);

    const foot = el("div", "footer-bar");
    foot.append(
      linkButton(shareUrl(pack), "▶ Play (test)", "btn btn--primary"),
      button("btn btn--ghost", "⬇ Export", () => openExportDialog("export")),
      button("btn btn--ghost", "🔗 Share link", () => openExportDialog("share")),
      button("btn btn--ghost", "💾 Save to my quests", () => {
        Store.upsertSavedQuest(pack);
        S.toast("Saved to my quests");
      })
    );
    section.appendChild(foot);
    root.appendChild(shell("Preview Quest", card));
    refreshPreview();
  }

  function render() {
    root.textContent = "";
    if (state.step === 0) renderHome();
    else if (state.step === 1) renderDescribe();
    else if (state.step === 2) renderPrompt();
    else if (state.step === 3) renderPaste();
    else renderPreview();
  }

  function init() {
    root = S.$("#builderRoot");
    if (!root) return;
    render();
  }

  window.QuestBuilder = {
    render,
    state,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
