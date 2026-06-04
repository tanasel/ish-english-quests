# Quest Forge — Handoff

**Live site:** https://tanasel.github.io/ish-english-quests/
**Repository:** https://github.com/tanasel/ish-english-quests (public)
**For:** ISH English department · **Updated:** 2026-06-04

Quest Forge turns an English unit or task into a playable **escape room** or **treasure hunt** of language puzzles. A teacher describes a unit, an AI (the teacher's own ChatGPT / Gemini / Claude) writes the puzzles, and students play a shared link in the browser. No accounts, no installs, no cost.

---

## For teachers (no technical knowledge needed)

1. Go to the **live site** and click **Build a quest**.
2. Follow the **How to build** guide (a button on the site) — or read [`BUILD-A-QUEST.md`](BUILD-A-QUEST.md).
3. In short: describe the unit → copy the prompt → paste it into your AI → paste the reply back → share the link in Google Classroom.

Six ready-made quests are already on the site to try or use straight away:

| Quest | Topic | Mode | Year |
| --- | --- | --- | --- |
| The Locked Bunkhouse | Of Mice and Men | Escape | 9 |
| The Poet's Lost Map | Poetic devices | Hunt | 8 |
| The Orator's Sealed Archive | Persuasive rhetoric | Escape | 10 |
| The Sealed Tomb of the Capulets | Romeo and Juliet | Escape | 9 |
| Punctuation Power: The Starbase Code | Punctuation & grammar | Hunt | 7 |
| The Whispering Library | Gothic / descriptive writing | Escape | 10 |

---

## For whoever maintains it

**Run locally**

```sh
node dev-server.cjs       # serves http://localhost:4180/
```

**Add a new curated quest**

1. Save a pack as `quests/<id>.json` (filename must equal the pack's `meta.id`). Easiest way to get a valid pack: build one in the app and click **Export → Download .json**.
2. `node build-quests.cjs` — regenerates `quests/index.json` and `data.js` so it shows on the launcher (online and offline). Set display order in the `ORDER` list at the top of that script.
3. `node --test tests/quest.test.cjs` — confirms all packs still normalize cleanly (should be **13 passing**).
4. Commit and push.

**Deploy**

- Hosted on **GitHub Pages**, *Deploy from a branch* → `main` / root.
- **Every push to `main` republishes** automatically (static files, no build step). Give it a minute, then refresh.
- ⚠️ The current `gh` token has no `workflow` scope, so there is **no GitHub Actions workflow** — the branch-deploy above is the method. (To switch to an Actions workflow later, run `gh auth refresh -s workflow` first.)

**Where things live**

- Pages: `index.html` (launcher), `build.html` (teacher), `play.html` (student), `how-to.html` (teacher guide).
- Logic: `schema.js` (validate/repair), `answer.js` (answer matching), `player.js` (game engine), `builder.js` (wizard), `prompt.js` (the AI prompt), `share.js` (share links). Full map in [`README.md`](README.md).
- Branding: `assets/ish-logo.png`, `assets/favicon.svg`.

---

## Good to know

- **No student data** is stored anywhere — progress and the certificate name stay in the student's own browser.
- **Pasted/shared quests are untrusted by design**: the app builds every screen with `textContent` (never `innerHTML`) and only allows `http`/`https` links, so a tampered link cannot run code.
- **Share links** carry the whole quest compressed in the URL. Very large quests should be shared as a downloaded file instead (the app tells you when).
- The app name ("Quest Forge") and repo name (`ish-english-quests`) can be changed if the department prefers.

## Possible next steps

- More curated quests for specific set texts and units.
- A shared "department quest library" (the optional Google-Sheet gallery seam already exists in `config.js`).
- A one-click "copy for ManageBac / Classroom" helper.
