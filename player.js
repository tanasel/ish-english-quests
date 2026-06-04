(function () {
  "use strict";

  const S = window.QuestSchema;
  const Store = window.QuestStore;
  const Answer = window.QuestAnswer;
  const Puzzles = window.QuestPuzzles;
  const Share = window.QuestShare;
  const el = S.el;

  function solvedIds(progress) {
    return Object.keys(progress.solvedById || {}).filter((id) => progress.solvedById[id]);
  }

  function stationIsSolved(progress, station) {
    return Boolean(progress.solvedById && progress.solvedById[station.id]);
  }

  function seededOrder(stations, seedText) {
    const out = stations.slice();
    let seed = Math.abs(S.hashStr(seedText || "quest")) || 1;
    for (let i = out.length - 1; i > 0; i -= 1) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      const j = seed % (i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function formatElapsed(start, end) {
    const seconds = Math.max(0, Math.floor(Number(end || 0) - Number(start || 0)));
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    if (minutes <= 0) return rest + " seconds";
    return minutes + " min " + rest + " sec";
  }

  function makeIconLock(open) {
    const span = el("span", open ? "lock lock--open" : "lock");
    span.setAttribute("aria-hidden", "true");
    span.textContent = open ? "🔓" : "🔒";
    return span;
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

  function copyText(text, success) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => S.toast(success || "Copied")).catch(() => S.toast("Select the text and press Ctrl/Cmd-C."));
      return;
    }
    S.toast("Select the text and press Ctrl/Cmd-C.");
  }

  function mount(root, pack, options) {
    options = options || {};
    const normalized = S.normalizeQuest(pack || {});
    pack = normalized.pack;
    let progress = Store.loadProgress(pack);
    let currentId = options.stationId || "";
    let openHuntId = "";

    function save() {
      progress = Store.saveProgress(pack, progress);
    }

    function firstUnsolvedIndex() {
      const i = pack.stations.findIndex((station) => !stationIsSolved(progress, station));
      return i < 0 ? pack.stations.length : i;
    }

    function allSolved() {
      return pack.stations.length > 0 && pack.stations.every((station) => stationIsSolved(progress, station));
    }

    function scoreText() {
      return "Score " + (Number(progress.score) || 0) + " · " + solvedIds(progress).length + "/" + pack.stations.length + " solved";
    }

    function renderControls() {
      const prefs = Store.getPrefs();
      const controls = el("div", "quest-controls");
      controls.setAttribute("aria-label", "Quest controls");

      function prefButton(label, pressed, fn) {
        const b = el("button", "btn btn--ghost control-btn", label);
        b.type = "button";
        b.setAttribute("aria-pressed", pressed ? "true" : "false");
        b.addEventListener("click", fn);
        controls.appendChild(b);
        return b;
      }

      prefButton(prefs.theme === "dark" ? "Light" : "Dark", prefs.theme === "dark", () => {
        Store.setPrefs({ theme: Store.getPrefs().theme === "dark" ? "light" : "dark" });
        render();
      });
      prefButton("Easy-reading", prefs.font === "dyslexic", () => {
        const p = Store.getPrefs();
        Store.setPrefs({ font: p.font === "dyslexic" ? "standard" : "dyslexic" });
        render();
      });
      prefButton("Bigger text", prefs.biggerText, () => {
        Store.setPrefs({ biggerText: !Store.getPrefs().biggerText });
        render();
      });
      prefButton("High contrast", prefs.contrast, () => {
        Store.setPrefs({ contrast: !Store.getPrefs().contrast });
        render();
      });
      prefButton("Sound", prefs.sound, () => {
        Store.setPrefs({ sound: !Store.getPrefs().sound });
        render();
      });
      const reset = el("button", "btn btn--danger control-btn", "Reset quest");
      reset.type = "button";
      reset.addEventListener("click", () => {
        if (!window.confirm("Reset progress for this quest on this device?")) return;
        const before = progress;
        Store.clearProgress(pack);
        progress = Store.loadProgress(pack);
        render();
        S.toast("Progress reset", {
          label: "Undo",
          fn: () => {
            progress = Store.saveProgress(pack, before);
            render();
          },
        });
      });
      controls.appendChild(reset);
      return controls;
    }

    function renderHeader() {
      const head = el("header", "quest-head");
      const nav = el("nav", "top-links");
      const home = el("a", "top-link", "Quest library");
      home.href = "index.html";
      const build = el("a", "top-link", "Build a quest");
      build.href = "build.html";
      nav.append(home, build);
      const brandPlate = el("div", "brand-plate");
      const brandLogo = el("img", "brand-plate__img");
      brandLogo.src = "assets/ish-logo.png";
      brandLogo.alt = "The International School of The Hague";
      brandPlate.appendChild(brandLogo);
      const kicker = el("p", "kicker", pack.meta.mode === "hunt" ? "Treasure hunt" : "Escape room");
      const h = el("h1", "wordmark quest-title", pack.meta.title);
      const meta = el("p", "lede", [pack.meta.unit, pack.meta.year, pack.meta.subject].filter(Boolean).join(" · "));
      const score = el("p", "score-line", scoreText());
      score.id = "scoreLine";
      score.setAttribute("aria-live", "polite");
      head.append(nav, brandPlate, kicker, h, meta, score, renderControls());
      return head;
    }

    function renderIntro() {
      const intro = el("section", "scroll-card intro-card");
      if (pack.story.introTitle) intro.appendChild(el("h2", "section-title", pack.story.introTitle));
      intro.appendChild(el("p", "story-text", pack.story.intro));
      return intro;
    }

    function hintArea(station) {
      const wrap = el("div", "hint-area");
      wrap.setAttribute("aria-live", "polite");
      const used = Math.min(progress.hintsUsed[station.id] || 0, station.hints.length);
      const list = el("ol", "hint-list");
      for (let i = 0; i < used; i += 1) {
        const li = el("li", "", station.hints[i]);
        list.appendChild(li);
      }
      if (used) wrap.appendChild(list);
      if (pack.settings.hints !== "off" && used < station.hints.length) {
        const b = el("button", "btn btn--ghost hint-btn", used ? "Show next hint" : "Show a hint");
        b.type = "button";
        b.addEventListener("click", () => {
          const before = progress.hintsUsed[station.id] || 0;
          progress.hintsUsed[station.id] = before + 1;
          if (pack.settings.hints === "costed") progress.score = Math.max(0, (Number(progress.score) || 0) - (Number(pack.settings.hintPenalty) || 0));
          save();
          render();
        });
        wrap.appendChild(b);
      }
      return wrap;
    }

    function disablePuzzle(host) {
      Array.from(host.querySelectorAll("input, textarea, button, select")).forEach((node) => {
        node.disabled = true;
      });
    }

    function renderPuzzlePanel(station, opts) {
      opts = opts || {};
      const solved = stationIsSolved(progress, station);
      const panel = el("section", "station-panel scroll-card");
      panel.dataset.stationId = station.id;
      const h = el("h2", "section-title station-title");
      h.id = "station-title-" + station.id;
      const icon = station.icon ? station.icon + " " : "";
      h.textContent = icon + station.name;
      panel.appendChild(h);
      if (station.narrative) panel.appendChild(el("p", "story-text", station.narrative));
      if (station.__unusable) {
        const bad = el("p", "form-error", "This station cannot be played: " + (station.__reason || "missing content"));
        panel.appendChild(bad);
        return panel;
      }

      const puzzleHost = el("div", "puzzle-host");
      const renderer = Puzzles[station.type];
      if (renderer && typeof renderer.render === "function") renderer.render(puzzleHost, station, { mode: pack.meta.mode });
      else puzzleHost.appendChild(el("p", "form-error", "This puzzle type is not available."));
      panel.appendChild(puzzleHost);

      const feedback = el("p", "feedback");
      feedback.setAttribute("aria-live", "polite");
      panel.appendChild(feedback);

      if (solved || opts.viewOnly) {
        disablePuzzle(puzzleHost);
        const reveal = el("div", "reveal-box");
        reveal.append(makeIconLock(true), el("p", "", station.reveal || "Solved."));
        panel.appendChild(reveal);
        if (pack.meta.mode === "hunt" && progress.fragments[station.id]) {
          panel.appendChild(el("p", "fragment-earned", "Collected fragment: " + progress.fragments[station.id]));
        }
        return panel;
      }

      panel.appendChild(hintArea(station));
      const actions = el("div", "station-actions");
      const check = el("button", "btn btn--primary", "Check");
      check.type = "button";
      check.addEventListener("click", () => {
        const input = renderer && renderer.getInput ? renderer.getInput(puzzleHost) : "";
        if (Answer.checkAnswer(input, station)) {
          progress.solvedById[station.id] = true;
          progress.score = (Number(progress.score) || 0) + (Number(station.points) || 0);
          if (pack.meta.mode === "hunt" && station.reward && station.reward.fragment) progress.fragments[station.id] = station.reward.fragment;
          if (pack.meta.mode === "escape" && allSolved()) progress.finished = true;
          save();
          feedback.textContent = "Correct. " + (station.reveal || "");
          if (typeof opts.onSolved === "function") opts.onSolved(station);
          else render();
        } else {
          const almost = (station.type === "spelling-lock" || station.type === "anagram") && Answer.closestDistance(input, station) <= 1;
          feedback.textContent = almost ? "Almost! Check one letter and try again." : "Not yet. Read the clue once more and try again.";
        }
      });
      actions.appendChild(check);
      panel.appendChild(actions);
      return panel;
    }

    function renderEscape(main) {
      const wrap = el("section", "play-layout play-layout--escape");
      const nav = el("aside", "corridor scroll-card");
      nav.appendChild(el("h2", "filter-group__title", "Locks"));
      const list = el("ol", "corridor-list");
      const first = firstUnsolvedIndex();
      if (!currentId) currentId = pack.stations[Math.min(first, pack.stations.length - 1)] ? pack.stations[Math.min(first, pack.stations.length - 1)].id : "";
      if (first < pack.stations.length && pack.stations.findIndex((s) => s.id === currentId) > first) currentId = pack.stations[first].id;
      pack.stations.forEach((station, i) => {
        const li = el("li", "corridor-item");
        const b = el("button", "corridor-lock");
        b.type = "button";
        const solved = stationIsSolved(progress, station);
        const locked = i > first;
        b.append(makeIconLock(solved || !locked), el("span", "", station.name));
        b.setAttribute("aria-current", station.id === currentId ? "step" : "false");
        if (locked) {
          b.disabled = true;
          b.setAttribute("aria-disabled", "true");
        } else {
          b.addEventListener("click", () => {
            currentId = station.id;
            render();
          });
        }
        li.appendChild(b);
        list.appendChild(li);
      });
      nav.appendChild(list);
      const panelWrap = el("div", "station-wrap");
      if (progress.finished || first >= pack.stations.length) {
        progress.finished = true;
        save();
        panelWrap.appendChild(renderWin());
      } else {
        const station = pack.stations.find((s) => s.id === currentId) || pack.stations[first];
        panelWrap.appendChild(renderPuzzlePanel(station, {
          viewOnly: stationIsSolved(progress, station),
          onSolved: () => {
            const next = firstUnsolvedIndex();
            if (next >= pack.stations.length) {
              progress.finished = true;
              save();
              render();
              return;
            }
            currentId = pack.stations[next].id;
            render();
            const heading = S.$("#station-title-" + currentId, root);
            if (heading) {
              heading.tabIndex = -1;
              heading.focus();
            }
          },
        }));
      }
      wrap.append(nav, panelWrap);
      main.appendChild(wrap);
    }

    function fragmentWord() {
      const sep = pack.settings.finalCode ? pack.settings.finalCode.separator || "" : "";
      return pack.stations.map((station) => progress.fragments[station.id] || "").join(sep);
    }

    function expectedFinalCode() {
      const fc = pack.settings.finalCode || {};
      return fc.value || fragmentWord();
    }

    function openStationDialog(station) {
      openHuntId = station.id;
      render();
      const dlg = S.$("#stationDialog", root);
      if (dlg) S.openDialog(dlg, ".station-title");
    }

    function renderHuntDialog(station) {
      const dlg = el("dialog", "modal station-dialog");
      dlg.id = "stationDialog";
      dlg.setAttribute("aria-labelledby", "station-title-" + station.id);
      const body = el("div", "modal__form");
      const top = el("div", "modal__head");
      const title = el("h2", "modal__title", "Map marker");
      const close = el("button", "icon-btn", "×");
      close.type = "button";
      close.setAttribute("aria-label", "Close station");
      close.addEventListener("click", () => S.closeDialog(dlg));
      top.append(title, close);
      body.appendChild(top);
      body.appendChild(renderPuzzlePanel(station, {
        onSolved: () => {
          render();
          const nextDlg = S.$("#stationDialog", root);
          if (nextDlg) S.openDialog(nextDlg, ".reveal-box");
        },
      }));
      dlg.appendChild(body);
      dlg.addEventListener("cancel", (e) => {
        e.preventDefault();
        S.closeDialog(dlg);
      });
      return dlg;
    }

    function renderHunt(main) {
      const wrap = el("section", "hunt-layout");
      const tray = el("section", "fragment-tray scroll-card");
      tray.setAttribute("aria-live", "polite");
      tray.appendChild(el("h2", "filter-group__title", "Fragments"));
      const slots = el("div", "fragment-slots");
      pack.stations.forEach((station, i) => {
        const slot = el("span", progress.fragments[station.id] ? "fragment-slot is-filled" : "fragment-slot");
        slot.textContent = progress.fragments[station.id] || String(i + 1);
        slots.appendChild(slot);
      });
      tray.appendChild(slots);
      tray.appendChild(el("p", "field__hint", "Collected word so far: " + (fragmentWord() || "—")));
      wrap.appendChild(tray);

      const map = el("section", "map-card scroll-card");
      map.appendChild(el("h2", "section-title", "Quest map"));
      const grid = el("div", "map-grid");
      const stations = pack.settings.shuffleHunt ? seededOrder(pack.stations, pack.meta.id) : pack.stations.slice();
      stations.forEach((station, i) => {
        const card = el("button", stationIsSolved(progress, station) ? "map-node is-solved" : "map-node");
        card.type = "button";
        card.style.setProperty("--node-i", String(i));
        const icon = el("span", "map-node__icon", station.icon || "✕");
        const name = el("span", "map-node__name", station.name);
        const status = el("span", "map-node__status", stationIsSolved(progress, station) ? "Collected" : "Open");
        card.append(icon, name, status);
        card.addEventListener("click", () => openStationDialog(station));
        grid.appendChild(card);
      });
      map.appendChild(grid);
      wrap.appendChild(map);

      const final = el("section", "final-code scroll-card");
      final.appendChild(el("h2", "section-title", "Treasure word"));
      final.appendChild(el("p", "story-text", (pack.settings.finalCode && pack.settings.finalCode.label) || "Enter the treasure word."));
      const form = el("form", "final-form");
      const input = el("input", "answer-input");
      input.type = "text";
      input.autocomplete = "off";
      input.setAttribute("aria-label", "Final code");
      const b = el("button", "btn btn--primary", "Unlock treasure");
      b.type = "submit";
      const feedback = el("p", "feedback");
      feedback.setAttribute("aria-live", "polite");
      form.append(input, b);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const got = Answer.normalizeAns(input.value, { caseSensitive: false, ignorePunctuation: true });
        const want = Answer.normalizeAns(expectedFinalCode(), { caseSensitive: false, ignorePunctuation: true });
        if (got && got === want) {
          progress.finished = true;
          save();
          render();
        } else {
          feedback.textContent = allSolved() ? "Not quite. Check the order of your fragments." : "You can try now, or collect every marker first.";
        }
      });
      final.append(form, feedback);
      if (progress.finished) final.appendChild(renderWin());
      wrap.appendChild(final);
      if (openHuntId) {
        const station = pack.stations.find((s) => s.id === openHuntId);
        if (station) wrap.appendChild(renderHuntDialog(station));
      }
      main.appendChild(wrap);
    }

    function renderWin() {
      const win = el("section", "win-screen scroll-card");
      win.appendChild(el("p", "kicker", pack.meta.mode === "hunt" ? "Treasure found" : "Escaped"));
      win.appendChild(el("h2", "section-title", pack.meta.mode === "hunt" ? "The chest opens" : "The final latch lifts"));
      win.appendChild(el("p", "story-text", pack.story.outro));
      win.appendChild(el("p", "score-line", scoreText() + " · elapsed " + formatElapsed(progress.startedAt, progress.updatedAt)));
      if (pack.settings.certificate) {
        const cert = el("section", "certificate");
        const certLogo = el("img", "certificate__logo");
        certLogo.src = "assets/ish-logo.png";
        certLogo.alt = "The International School of The Hague";
        cert.appendChild(certLogo);
        cert.appendChild(el("p", "certificate__kicker", "International School of The Hague · English Quest"));
        cert.appendChild(el("h2", "certificate__title", "Quest Certificate"));
        const label = el("label", "field certificate__name");
        label.append(el("span", "field__legend", "Student name"), el("input", "answer-input"));
        cert.appendChild(label);
        cert.appendChild(el("p", "certificate__body", "completed " + pack.meta.title + " with " + solvedIds(progress).length + " solved stations."));
        cert.appendChild(el("p", "certificate__score", scoreText()));
        const print = el("button", "btn btn--primary no-print", "Print certificate");
        print.type = "button";
        print.addEventListener("click", () => window.print());
        win.append(cert, print);
      }
      return win;
    }

    function render() {
      root.textContent = "";
      const shell = el("div", "quest-shell");
      shell.appendChild(renderHeader());
      const main = el("main", "quest-main");
      main.id = "main";
      main.appendChild(renderIntro());
      if (pack.meta.mode === "hunt") renderHunt(main);
      else renderEscape(main);
      shell.appendChild(main);
      root.appendChild(shell);
      if (options.onRender) options.onRender(pack, progress);
    }

    render();
    return {
      pack,
      getProgress: () => progress,
      render,
    };
  }

  function renderStationPreview(host, station) {
    host.textContent = "";
    const out = S.normalizeStation(station, 0, []);
    const panel = el("section", "station-panel preview-panel");
    panel.appendChild(el("h3", "section-title", out.name));
    const puzzle = el("div", "puzzle-host");
    if (Puzzles[out.type]) Puzzles[out.type].render(puzzle, out, {});
    else puzzle.appendChild(el("p", "form-error", "Unknown puzzle type."));
    Array.from(puzzle.querySelectorAll("input, textarea, button, select")).forEach((node) => {
      node.disabled = true;
    });
    panel.appendChild(puzzle);
    host.appendChild(panel);
  }

  function findSeed(id) {
    const seeds = Array.isArray(window.QUEST_SEEDS) ? window.QUEST_SEEDS : [];
    return seeds.find((pack) => pack && pack.meta && pack.meta.id === id) || null;
  }

  async function loadById(id) {
    const seed = findSeed(id);
    if (seed) return seed;
    try {
      const res = await fetch("quests/index.json?v=1");
      if (!res.ok) return null;
      const manifest = await res.json();
      const row = Array.isArray(manifest) ? manifest.find((item) => item.id === id) : null;
      if (!row || !row.file) return null;
      const packRes = await fetch("quests/" + encodeURIComponent(row.file) + "?v=1");
      if (!packRes.ok) return null;
      return await packRes.json();
    } catch {
      return null;
    }
  }

  function renderImport(root, message) {
    root.textContent = "";
    const wrap = el("main", "quest-shell import-shell");
    const card = el("section", "scroll-card import-card");
    card.appendChild(el("p", "kicker", "Open a quest"));
    card.appendChild(el("h1", "wordmark quest-title", "Quest Forge"));
    if (message) card.appendChild(el("p", "form-error", message));
    const pasteLabel = el("label", "field");
    const paste = el("textarea", "answer-input");
    paste.rows = 10;
    pasteLabel.append(el("span", "field__legend", "Paste quest JSON"), paste);
    const open = el("button", "btn btn--primary", "Open pasted quest");
    open.type = "button";
    const file = el("input");
    file.type = "file";
    file.accept = "application/json,.json";
    const status = el("p", "feedback");
    status.setAttribute("aria-live", "polite");
    open.addEventListener("click", () => {
      const result = S.validatePackText(paste.value);
      if (result.pack && result.pack.stations.length) mount(root, result.pack);
      else status.textContent = result.error || "That quest could not be opened.";
    });
    file.addEventListener("change", () => {
      const selected = file.files && file.files[0];
      if (!selected) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const result = S.validatePackText(reader.result || "");
        if (result.pack && result.pack.stations.length) mount(root, result.pack);
        else status.textContent = result.error || "That file could not be opened.";
      });
      reader.readAsText(selected);
    });
    card.append(pasteLabel, open, file, status);
    wrap.appendChild(card);
    root.appendChild(wrap);
  }

  async function initPage() {
    const root = S.$("#playerRoot");
    if (!root) return;
    let pack = null;
    const hash = String(window.location.hash || "");
    if (hash.startsWith("#q=")) {
      pack = Share.decodePack(hash.slice(3));
      if (!pack) {
        renderImport(root, "The share link could not be decoded.");
        return;
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) pack = await loadById(id);
    }
    if (!pack) {
      renderImport(root, "Choose a quest file or paste a quest pack.");
      return;
    }
    const normalized = S.normalizeQuest(pack);
    if (!normalized.pack.stations.length) {
      renderImport(root, "This quest has no playable stations.");
      return;
    }
    mount(root, normalized.pack);
  }

  window.QuestPlayer = {
    mount,
    renderStationPreview,
    loadById,
    initPage,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPage);
  else initPage();
})();
