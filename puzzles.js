(function () {
  "use strict";

  const S = window.QuestSchema;
  const el = S.el;

  function clear(host) {
    host.textContent = "";
  }

  function addBlock(host, cls, text) {
    const p = el("p", cls, text);
    host.appendChild(p);
    return p;
  }

  function addInput(host, labelText, cls) {
    const field = el("label", "field puzzle-field");
    const span = el("span", "field__legend", labelText);
    const input = el("input", cls || "answer-input");
    input.type = "text";
    input.autocomplete = "off";
    field.append(span, input);
    host.appendChild(field);
    return input;
  }

  function addTextarea(host, labelText) {
    const field = el("label", "field puzzle-field");
    const span = el("span", "field__legend", labelText);
    const input = el("textarea", "answer-input");
    input.rows = 3;
    field.append(span, input);
    host.appendChild(field);
    return input;
  }

  function letterFor(i) {
    return String.fromCharCode(65 + i);
  }

  function renderRadio(host, label, options, selected) {
    const wrap = el("div", "choice-block");
    const lab = el("p", "field__legend", label);
    const group = el("div", "choice-group");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", label);
    options.forEach((opt, i) => {
      const btn = el("button", "choice");
      btn.type = "button";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", selected === opt ? "true" : "false");
      btn.dataset.value = opt;
      btn.dataset.letter = String.fromCharCode(97 + i);
      const badge = el("span", "choice__letter", letterFor(i));
      const text = el("span", "choice__text", opt);
      btn.append(badge, text);
      btn.addEventListener("click", () => {
        S.selectRadio(group, opt);
      });
      group.appendChild(btn);
    });
    wrap.append(lab, group);
    host.appendChild(wrap);
    S.wireRadioKeys(group);
    if (!selected && group.firstElementChild) S.selectRadio(group, group.firstElementChild.dataset.value);
    return group;
  }

  function selectedRadio(host) {
    const btn = host.querySelector('[role="radio"][aria-checked="true"]');
    return btn ? btn.dataset.value || "" : "";
  }

  function caesar(text, shift) {
    return String(text || "").replace(/[A-Za-z]/g, (ch) => {
      const base = ch >= "a" && ch <= "z" ? 97 : 65;
      const code = ch.charCodeAt(0) - base;
      return String.fromCharCode(base + ((code + shift + 26) % 26));
    });
  }

  function atbash(text) {
    return String(text || "").replace(/[A-Za-z]/g, (ch) => {
      const upper = ch >= "A" && ch <= "Z";
      const base = upper ? 65 : 97;
      return String.fromCharCode(base + (25 - (ch.charCodeAt(0) - base)));
    });
  }

  function a1z26(text) {
    return String(text || "").split(/\s+/).map((word) => {
      return word.split("").map((ch) => {
        const up = ch.toUpperCase();
        if (up >= "A" && up <= "Z") return String(up.charCodeAt(0) - 64);
        return ch;
      }).join("-");
    }).join(" / ");
  }

  function encodedCipher(content) {
    const plaintext = content.plaintext || "";
    if (content.cipherType === "atbash") return atbash(plaintext);
    if (content.cipherType === "reverse") return String(plaintext).split("").reverse().join("");
    if (content.cipherType === "a1z26") return a1z26(plaintext);
    return caesar(plaintext, parseInt(content.shift, 10) || 0);
  }

  function cipherLegend(content) {
    if (content.cipherType === "atbash") return "Atbash key: A becomes Z, B becomes Y, C becomes X.";
    if (content.cipherType === "reverse") return "Reverse key: read the characters from right to left.";
    if (content.cipherType === "a1z26") return "A1Z26 key: A=1, B=2, C=3, up to Z=26. Slashes mark spaces.";
    return "Caesar key: each letter has shifted forward by " + (parseInt(content.shift, 10) || 0) + ". Shift back to decode.";
  }

  function renderCipher(host, station) {
    clear(host);
    addBlock(host, "puzzle-prompt", station.content.prompt || "Decode the message.");
    const code = el("div", "cipher-box mono");
    code.tabIndex = 0;
    code.textContent = encodedCipher(station.content);
    host.appendChild(code);
    addBlock(host, "field__hint", cipherLegend(station.content));
    addInput(host, "Decoded message");
  }

  function renderVocab(host, station) {
    clear(host);
    addBlock(host, "puzzle-prompt", station.content.definition || "Name the word.");
    if (station.content.sentence) addBlock(host, "clue-line", station.content.sentence);
    const bits = [];
    if (station.content.firstLetter) bits.push("Starts with " + station.content.firstLetter);
    if (station.content.length) bits.push(String(station.content.length) + " letters");
    if (bits.length) addBlock(host, "field__hint", bits.join(" · "));
    addInput(host, "Answer");
  }

  function renderAttribution(host, station) {
    clear(host);
    addBlock(host, "quote-card", station.content.quote || "");
    if (station.content.work) addBlock(host, "field__hint", "Work: " + station.content.work);
    if (Array.isArray(station.content.options) && station.content.options.length >= 2) {
      renderRadio(host, "Choose who said or wrote it", station.content.options);
    } else {
      addInput(host, "Speaker or writer");
    }
  }

  function seededShuffle(items, seedText) {
    const out = items.slice();
    let seed = Math.abs(S.hashStr(seedText || "station")) || 1;
    for (let i = out.length - 1; i > 0; i -= 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    if (out.length > 1 && out.every((item, i) => item === items[i])) out.push(out.shift());
    return out;
  }

  function moveItem(arr, from, to) {
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
    const item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
    return arr;
  }

  function renderSequenceList(host, station) {
    const items = seededShuffle(station.content.items || [], station.id);
    host.__sequenceItems = items;
    const live = el("p", "sr-only");
    live.setAttribute("aria-live", "polite");
    const list = el("ol", "sequence-list");
    list.setAttribute("aria-label", "Sequence items");

    function redraw() {
      list.textContent = "";
      host.__sequenceItems.forEach((item, i) => {
        const li = el("li", "sequence-item");
        li.draggable = true;
        li.dataset.index = String(i);
        const handle = el("span", "sequence-item__text", item);
        const controls = el("span", "sequence-item__controls");
        const up = el("button", "icon-btn sequence-btn", "↑");
        const down = el("button", "icon-btn sequence-btn", "↓");
        up.type = "button";
        down.type = "button";
        up.setAttribute("aria-label", "Move " + item + " up");
        down.setAttribute("aria-label", "Move " + item + " down");
        up.disabled = i === 0;
        down.disabled = i === host.__sequenceItems.length - 1;
        up.addEventListener("click", () => {
          moveItem(host.__sequenceItems, i, i - 1);
          live.textContent = "Moved item up.";
          redraw();
        });
        down.addEventListener("click", () => {
          moveItem(host.__sequenceItems, i, i + 1);
          live.textContent = "Moved item down.";
          redraw();
        });
        li.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", String(i));
          e.dataTransfer.effectAllowed = "move";
        });
        li.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        });
        li.addEventListener("drop", (e) => {
          e.preventDefault();
          const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
          const to = parseInt(li.dataset.index, 10);
          moveItem(host.__sequenceItems, from, to);
          live.textContent = "Moved item.";
          redraw();
        });
        controls.append(up, down);
        li.append(handle, controls);
        list.appendChild(li);
      });
    }
    redraw();
    host.append(list, live);
  }

  function renderSequence(host, station) {
    clear(host);
    addBlock(host, "puzzle-prompt", station.content.prompt || "Put these in the correct order.");
    renderSequenceList(host, station);
  }

  function renderFillBlank(host, station) {
    clear(host);
    addBlock(host, "puzzle-prompt", station.content.text || "Fill the blank.");
    const input = addInput(host, station.content.blankLabel || "Missing word");
    if (Array.isArray(station.content.wordBank) && station.content.wordBank.length) {
      const bank = el("div", "word-bank");
      bank.setAttribute("role", "group");
      bank.setAttribute("aria-label", "Word bank");
      station.content.wordBank.forEach((word) => {
        const b = el("button", "chip", word);
        b.type = "button";
        b.addEventListener("click", () => {
          input.value = word;
          input.focus();
          Array.from(bank.querySelectorAll(".chip")).forEach((chip) => chip.setAttribute("aria-pressed", chip === b ? "true" : "false"));
        });
        b.setAttribute("aria-pressed", "false");
        bank.appendChild(b);
      });
      host.appendChild(bank);
    }
  }

  function renderAnagram(host, station) {
    clear(host);
    addBlock(host, "puzzle-prompt", "Unscramble the letters.");
    const letters = el("div", "cipher-box mono");
    letters.textContent = station.content.scrambled || "";
    host.appendChild(letters);
    if (station.content.clue) addBlock(host, "field__hint", station.content.clue);
    addInput(host, "Unscrambled answer");
  }

  function renderComprehension(host, station) {
    clear(host);
    if (station.content.passage) addBlock(host, "passage", station.content.passage);
    addBlock(host, "puzzle-prompt", station.content.question || "Choose the best answer.");
    renderRadio(host, "Choose one answer", station.content.options || []);
  }

  function renderHiddenWord(host, station) {
    clear(host);
    addBlock(host, "puzzle-prompt", station.content.instruction || "Find the hidden word or words, then type them below.");
    const grid = el("div", "word-grid mono");
    (station.content.grid || []).forEach((row) => {
      const line = el("div", "word-grid__row", row);
      grid.appendChild(line);
    });
    host.appendChild(grid);
    const count = Math.max(1, (station.content.targets || []).length);
    for (let i = 0; i < count; i += 1) {
      addInput(host, count === 1 ? "Found word" : "Found word " + (i + 1), "answer-input set-input");
    }
  }

  function renderRiddle(host, station) {
    clear(host);
    if (station.content.prompt) addBlock(host, "puzzle-prompt", station.content.prompt);
    addBlock(host, "riddle-card", station.content.riddle || "");
    addInput(host, "Answer");
  }

  function renderSpelling(host, station) {
    clear(host);
    addBlock(host, "puzzle-prompt", station.content.definition || "Spell the word.");
    if (station.content.hintLetters) addBlock(host, "cipher-box mono", station.content.hintLetters);
    if (station.content.audioText && "speechSynthesis" in window) {
      const b = el("button", "btn btn--ghost sound-btn", "Hear the word");
      b.type = "button";
      b.addEventListener("click", () => {
        try {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(station.content.audioText));
        } catch { /* optional */ }
      });
      host.appendChild(b);
    }
    addInput(host, "Spell it exactly");
  }

  function renderOddOneOut(host, station) {
    clear(host);
    addBlock(host, "puzzle-prompt", station.content.prompt || "Choose the odd one out.");
    renderRadio(host, "Choose the item that does not belong", station.content.items || []);
  }

  function getTextInput(host) {
    const input = host.querySelector(".answer-input");
    return input ? input.value : "";
  }

  function getSetInput(host) {
    return Array.from(host.querySelectorAll(".set-input")).map((input) => input.value);
  }

  const registry = {
    "cipher": { render: renderCipher, getInput: getTextInput },
    "vocab-lock": { render: renderVocab, getInput: getTextInput },
    "attribution": { render: renderAttribution, getInput: (host) => selectedRadio(host) || getTextInput(host) },
    "sequence": { render: renderSequence, getInput: (host) => (host.__sequenceItems || []).join("|") },
    "fill-blank": { render: renderFillBlank, getInput: getTextInput },
    "anagram": { render: renderAnagram, getInput: getTextInput },
    "comprehension": { render: renderComprehension, getInput: selectedRadio },
    "hidden-word": { render: renderHiddenWord, getInput: getSetInput },
    "riddle": { render: renderRiddle, getInput: getTextInput },
    "spelling-lock": { render: renderSpelling, getInput: getTextInput },
    "odd-one-out": { render: renderOddOneOut, getInput: selectedRadio },
  };

  Object.keys(registry).forEach((key) => {
    registry[key].collectInput = registry[key].getInput;
  });

  window.QuestPuzzles = registry;
})();
