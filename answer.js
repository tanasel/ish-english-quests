(function () {
  "use strict";

  function normalizeAns(s, opts) {
    opts = opts || {};
    let t = String(s == null ? "" : s).trim().replace(/\s+/g, " ");
    if (!opts.caseSensitive) t = t.toLowerCase();
    if (opts.ignorePunctuation) t = t.replace(/[^\p{L}\p{N}\s|]/gu, "");
    if (opts.stripArticles) t = t.replace(/^(a|an|the)\s+/i, "");
    return t.replace(/\s+/g, " ").trim();
  }

  function acceptedFor(station) {
    const list = station && Array.isArray(station.acceptedAnswers) && station.acceptedAnswers.length
      ? station.acceptedAnswers
      : [station && station.answer];
    return list.filter((x) => x != null && String(x).trim() !== "");
  }

  function checkAnswer(input, station) {
    const m = (station && station.match) || "normalized";
    const accept = acceptedFor(station);
    const opt = {
      caseSensitive: false,
      ignorePunctuation: m !== "exact",
      stripArticles: false,
    };
    const norm = (x) => normalizeAns(x, opt);

    if (m === "set") {
      const got = new Set((Array.isArray(input) ? input : String(input).split(/[,|]/)).map(norm).filter(Boolean));
      const want = new Set(accept.map(norm));
      return want.size > 0 && got.size === want.size && Array.from(want).every((w) => got.has(w));
    }
    if (m === "contains") return accept.some((a) => norm(input).includes(norm(a)));
    return accept.some((a) => norm(input) === norm(a));
  }

  function levenshtein(a, b) {
    a = normalizeAns(a, { caseSensitive: false, ignorePunctuation: true });
    b = normalizeAns(b, { caseSensitive: false, ignorePunctuation: true });
    const alen = a.length;
    const blen = b.length;
    if (alen === 0) return blen;
    if (blen === 0) return alen;
    const prev = new Array(blen + 1);
    const curr = new Array(blen + 1);
    for (let j = 0; j <= blen; j += 1) prev[j] = j;
    for (let i = 1; i <= alen; i += 1) {
      curr[0] = i;
      for (let j = 1; j <= blen; j += 1) {
        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      for (let j = 0; j <= blen; j += 1) prev[j] = curr[j];
    }
    return prev[blen];
  }

  function closestDistance(input, station) {
    return acceptedFor(station).reduce((best, ans) => Math.min(best, levenshtein(input, ans)), Infinity);
  }

  window.QuestAnswer = {
    normalizeAns,
    checkAnswer,
    levenshtein,
    closestDistance,
  };
})();
