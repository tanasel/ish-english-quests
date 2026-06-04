(function () {
  "use strict";

  const DIFFICULTY = {
    gentle: "- GENTLE: shorter words, more scaffolding, hint 1 already supportive, single-step puzzles; recycle key vocabulary.",
    standard: "- STANDARD: grade-level vocabulary and 1–2 step reasoning; mix recall and inference.",
    challenge: "- CHALLENGE: stretch with analysis/evaluation, multi-step ciphers, subtler inference and richer vocabulary — but keep answers unambiguous and hints progressive.",
  };
  const DYSLEXIA_LINE = "- Favour meaning over surface spelling: on non-spelling puzzles, add common misspellings of the answer to acceptedAnswers. Keep cipher/anagram strings short (a few words). Prefer decodable words; avoid letter grids larger than 6x6. One task per station. Short sentences, no walls of text.";

  function txt(v, fallback) {
    const t = String(v == null ? "" : v).trim();
    return t || fallback;
  }

  function buildPrompt(inputs) {
    inputs = inputs || {};
    const mode = inputs.mode === "hunt" ? "hunt" : "escape";
    const difficulty = ["gentle", "standard", "challenge"].includes(inputs.difficulty) ? inputs.difficulty : "standard";
    const types = Array.isArray(inputs.puzzleTypes) && inputs.puzzleTypes.length
      ? inputs.puzzleTypes.join("|")
      : "AI chooses — pick a varied, level-appropriate mix";
    const n = Math.max(3, Math.min(8, parseInt(inputs.stationCount, 10) || 5));
    const subject = txt(inputs.subject, "English: Language & Literature");
    const year = txt(inputs.year, "Year 8 or 9");
    const theme = txt(inputs.theme, "library");
    const topic = txt(inputs.topic, "[none provided]");
    const sourceText = txt(inputs.sourceText, "[no source text provided]");
    const mustInclude = txt(inputs.mustInclude, "[none provided]");

    return `You are an expert English teacher and instructional designer for the International School of The Hague
(ISH). You create "quest packs": short escape-room or treasure-hunt games made of English-skills puzzles
that students play solo.

TASK: Create ONE quest pack as a single JSON object, valid against the SCHEMA below, from the brief.

TEACHER BRIEF
- Unit or topic: ${topic}
- Source text the puzzles must draw on (may be empty):
${sourceText}
- Subject strand: ${subject}
- Target year / level: ${year}   (treat as the reading and challenge level)
- Mode: ${mode}    (escape = unlock a final lock in order; hunt = collect a letter from each station to spell a treasure word)
- Number of stations: ${n}
- Difficulty: ${difficulty}    (gentle | standard | challenge)
- Puzzle types to use: ${types}
- Tone / theme: ${theme}
- Must-include vocabulary or quotations (use if present):
${mustInclude}

OUTPUT RULES
1. Return ONLY the JSON object. No markdown, no code fences, no commentary. First char "{", last char "}".
2. Use ONLY the exact field names and enum values in the SCHEMA. Do not invent or omit required fields.
3. Every string is plain text (no HTML/markdown).
4. Produce exactly ${n} stations.
5. If mode is "hunt", give every station a reward.fragment of ONE letter, and set settings.finalCode so
   the fragments spell a real word (type "join", separator ""); put that word in finalCode.value too.
6. Double-check the JSON parses (balanced braces/brackets, quoted keys, no trailing commas).

CONTENT-QUALITY RULES
- Age-appropriate for ${year}.
- Every puzzle assesses a REAL English skill (decoding, vocabulary, inference, sequencing, attribution,
  spelling, comprehension) — not trivia, not "guess what the teacher is thinking".
- Each answer is UNAMBIGUOUS and machine-checkable: a short word, phrase, letter, or ordered list. Put
  every acceptable variation (capitalisation, British/US spelling, with/without article) in acceptedAnswers.
- Hints are PROGRESSIVE: hint 1 a gentle nudge, hint 2 a strategy, hint 3 almost the answer. Hint 1 never
  gives it away. Exactly 3 hints per station.
- Vary the puzzle types; do not repeat one type back-to-back unless only one type was requested.
- Build a Bloom progression: remember/understand early, apply/analyse/evaluate later.
- Quote at most ~25 words of any copyrighted text. Prefer public-domain works, the teacher's SOURCE TEXT,
  or your own original sentences. Never reproduce long extracts.
- Keep narrative and clue sentences short, concrete, present tense where natural (dyslexia-friendly).
${DIFFICULTY[difficulty]}
${DYSLEXIA_LINE}

SCHEMA (return JSON of exactly this shape)
{ "schema":"ish-quest@1",
  "meta":{ "id":"kebab-case","title":"","unit":"","subject":"${subject}","year":"${year}","mode":"${mode}","theme":"${theme}","author":"" },
  "story":{ "intro":"","outro":"" },
  "settings":{ "hints":"free","showProgress":true,"timer":false,"certificate":true,
               "finalCode":{ "type":"join","separator":"","value":"","label":"Enter the treasure word" } },
  "stations":[
    { "id":"s1","name":"","icon":"","narrative":"","type":"<one of: cipher|vocab-lock|attribution|sequence|fill-blank|anagram|comprehension|hidden-word|riddle|spelling-lock|odd-one-out>",
      "content":{ /* shape depends on type — see TYPES */ },
      "answer":"","acceptedAnswers":[""],"hints":["","",""],"reveal":"","reward":{ "fragment":"" } }
  ] }

TYPES (what "content" must contain for each puzzleType)
- cipher: { cipherType:"caesar"|"atbash"|"reverse"|"a1z26", shift:<int for caesar>, plaintext:"<the decoded text>" } ; answer = plaintext
- vocab-lock: { definition:"", sentence:"<optional context using the word>", firstLetter:"" } ; answer = the word
- attribution: { quote:"", work:"", options:["",""] (optional) } ; answer = the speaker/author
- sequence: { prompt:"", items:["<in CORRECT order>", ...] } ; answer = items joined by "|"
- fill-blank: { text:"<contains ____>", wordBank:["",""] (optional) } ; answer = the missing word
- anagram: { scrambled:"", clue:"" } ; answer = the unscrambled word (its letters must match scrambled)
- comprehension: { passage:"", question:"", options:["","","",""] } ; answer = the exact correct option text
- hidden-word: { grid:["ROW1","ROW2", ...], targets:["",""], instruction:"" } ; answer = first target (acceptedAnswers = all targets)
- riddle: { riddle:"" } ; answer = the solution (list many synonyms in acceptedAnswers)
- spelling-lock: { definition:"", hintLetters:"e _ l _ g _" } ; answer = the word
- odd-one-out: { items:["","","",""], prompt:"" } ; answer = the item that does not belong

FEW-SHOT (one good station — match this quality, do not copy it)
{ "id":"s2","name":"Crooks's Word","icon":"📖","narrative":"A brass plate asks you to prove you know the word that guards it.","type":"vocab-lock","content":{ "definition":"Set apart or alone; kept away from others.","sentence":"Forced to sleep apart, Crooks lived an ____ life.","firstLetter":"i" },"answer":"isolated","acceptedAnswers":["isolated","alone","set apart"],"hints":["The sentence says he sleeps apart from everyone.","It describes being kept away from others.","It means set apart — it begins with 'i'."],"reveal":"Yes — 'isolated' means set apart or alone. Crooks is isolated by racism as well as distance.","reward":{ "fragment":"" } }

Now produce the quest pack for the brief above. Remember: ONLY the JSON object.`;
  }

  window.QuestPrompt = {
    buildPrompt,
    DYSLEXIA_LINE,
    DIFFICULTY,
  };
})();
