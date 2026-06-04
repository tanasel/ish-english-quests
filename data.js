(function () {
  "use strict";

  window.QUEST_SEEDS =
  [
    {
      "schema": "ish-quest@1",
      "meta": {
        "id": "omam-locked-bunkhouse",
        "title": "The Locked Bunkhouse",
        "unit": "Of Mice and Men — dreams, loneliness, friendship",
        "subject": "English: Language & Literature",
        "year": "Year 9 (MYP 4)",
        "mode": "escape",
        "theme": "detective",
        "author": "ISH English",
        "createdAt": 0
      },
      "story": {
        "introTitle": "Night on the ranch",
        "intro": "You are locked inside the bunkhouse. George's worn notebook holds the way out. Solve each clue to lift the final latch before the others return.",
        "outro": "The latch lifts. You step into the cool night, the dream of a little place still glowing. You read the story's heart and earned your way out."
      },
      "settings": {
        "hints": "free",
        "hintPenalty": 5,
        "startScore": 100,
        "shuffleHunt": false,
        "showProgress": true,
        "timer": false,
        "certificate": true,
        "fontDefault": "standard"
      },
      "stations": [
        {
          "id": "s1",
          "name": "The Coded Cover",
          "icon": "🔐",
          "narrative": "George's notebook is locked. Four words sit on the cover in a simple code.",
          "type": "cipher",
          "content": {
            "cipherType": "caesar",
            "shift": 3,
            "plaintext": "MICE AND MEN"
          },
          "answer": "MICE AND MEN",
          "acceptedAnswers": [
            "mice and men",
            "of mice and men"
          ],
          "match": "normalized",
          "hints": [
            "Each letter has shifted forward in the alphabet.",
            "Shift every letter back by 3 (D becomes A).",
            "P→M, L→I, F→C, H→E… read it out."
          ],
          "reveal": "Correct — 'Mice and Men'. Steinbeck took his title from a Robert Burns poem about plans going wrong.",
          "points": 10
        },
        {
          "id": "s2",
          "name": "Crooks's Word",
          "icon": "📖",
          "narrative": "A brass plate names the word that guards the next door.",
          "type": "vocab-lock",
          "content": {
            "definition": "Set apart or alone; kept away from others.",
            "sentence": "Forced to sleep apart, Crooks lived an ____ life.",
            "firstLetter": "i"
          },
          "answer": "isolated",
          "acceptedAnswers": [
            "isolated",
            "alone",
            "set apart",
            "separated"
          ],
          "match": "normalized",
          "hints": [
            "The sentence says he sleeps apart from everyone.",
            "It describes being kept away from others.",
            "It means set apart — it begins with 'i'."
          ],
          "reveal": "Yes — 'isolated' means set apart or alone. Crooks is isolated by racism as well as distance.",
          "points": 10
        },
        {
          "id": "s3",
          "name": "The Order of Things",
          "icon": "🧭",
          "narrative": "Four moments have scattered. Lay them in order to free the next bolt.",
          "type": "sequence",
          "content": {
            "prompt": "Put these events in the order they happen.",
            "items": [
              "George and Lennie reach the ranch",
              "Lennie is given a puppy",
              "Lennie kills Curley's wife in the barn",
              "George shoots Lennie by the river"
            ]
          },
          "answer": "George and Lennie reach the ranch|Lennie is given a puppy|Lennie kills Curley's wife in the barn|George shoots Lennie by the river",
          "acceptedAnswers": [
            "George and Lennie reach the ranch|Lennie is given a puppy|Lennie kills Curley's wife in the barn|George shoots Lennie by the river"
          ],
          "match": "ordered",
          "hints": [
            "Begin where the two men start the novel.",
            "The gentle moment with the puppy comes before the barn.",
            "Arrival, puppy, the barn, the river."
          ],
          "reveal": "Right order. Steinbeck moves us steadily from hope to heartbreak.",
          "points": 20
        },
        {
          "id": "s4",
          "name": "The Gatekeeper's Question",
          "icon": "🗝️",
          "narrative": "The heavy door asks a careful reader one question.",
          "type": "comprehension",
          "content": {
            "passage": "George and Lennie share a dream of a little place of their own, with rabbits and a patch of land. On the lonely ranch, the dream is the one warm thing they carry between them.",
            "question": "In the novel, the dream of 'a little place of our own' mainly represents…",
            "options": [
              "a realistic retirement plan",
              "hope and belonging in a lonely world",
              "a joke between friends",
              "Lennie's fear of mice"
            ]
          },
          "answer": "hope and belonging in a lonely world",
          "acceptedAnswers": [
            "hope and belonging in a lonely world",
            "b"
          ],
          "match": "normalized",
          "hints": [
            "Think about why the dream comforts them when times are hard.",
            "It is about more than land — it is about not being alone.",
            "Choose the option about hope and belonging."
          ],
          "reveal": "Yes — the dream stands for the hope and belonging the ranch's lonely men long for.",
          "points": 10
        },
        {
          "id": "s5",
          "name": "The Final Latch",
          "icon": "🔓",
          "narrative": "One word, spelled true, lifts the last latch.",
          "type": "spelling-lock",
          "content": {
            "definition": "The deep sadness of being without companions — a central theme of the novel.",
            "hintLetters": "l _ n _ l _ n _ s s"
          },
          "answer": "loneliness",
          "acceptedAnswers": [
            "loneliness"
          ],
          "match": "exact",
          "hints": [
            "It is the feeling shared by Candy, Crooks and Curley's wife.",
            "Ten letters, begins with 'lone'.",
            "l-o-n-e-l-i-n-e-s-s."
          ],
          "reveal": "LONELINESS — the ache at the centre of the book. The latch lifts. You are free.",
          "points": 15
        }
      ]
    },
    {
      "schema": "ish-quest@1",
      "meta": {
        "id": "poets-lost-map",
        "title": "The Poet's Lost Map",
        "unit": "Poetic devices and figurative language",
        "subject": "English: Language & Literature",
        "year": "Year 8 (MYP 3)",
        "mode": "hunt",
        "theme": "pirate",
        "author": "ISH English",
        "createdAt": 0
      },
      "story": {
        "introTitle": "Verse Island",
        "intro": "An old poet buried a chest of words on Verse Island. Five marker-stones guard it, each testing a poet's craft. Solve each to win a carved letter, then spell the treasure word.",
        "outro": "The letters fall into place and the sand gives way — the chest creaks open, full of the poet's favourite words. You read the map of poetry and found the treasure."
      },
      "settings": {
        "hints": "free",
        "hintPenalty": 5,
        "startScore": 100,
        "shuffleHunt": true,
        "showProgress": true,
        "timer": false,
        "certificate": true,
        "fontDefault": "standard",
        "finalCode": {
          "type": "join",
          "separator": "",
          "value": "VERSE",
          "label": "Spell the treasure word from your carved letters"
        }
      },
      "stations": [
        {
          "id": "s1",
          "name": "Stone of the Bold Compare",
          "icon": "🪨",
          "narrative": "The first stone hums a riddle about how poets compare.",
          "type": "riddle",
          "content": {
            "riddle": "I compare two things, but I scorn the words 'like' and 'as'. I declare the moon IS a silver coin. Name me."
          },
          "answer": "metaphor",
          "acceptedAnswers": [
            "metaphor",
            "a metaphor"
          ],
          "match": "normalized",
          "hints": [
            "I am a figure of speech.",
            "My quieter cousin, the simile, uses 'like' or 'as' — I do not.",
            "I begin with 'meta'."
          ],
          "reveal": "A METAPHOR — it says one thing IS another. You receive a carved letter: V.",
          "reward": {
            "fragment": "V"
          },
          "points": 10
        },
        {
          "id": "s2",
          "name": "Stone of Repeated Sound",
          "icon": "🪨",
          "narrative": "Wind whistles a line of verse with one word missing.",
          "type": "fill-blank",
          "content": {
            "text": "The technique where words begin with the same sound — 'wild and windy waves' — is called ____."
          },
          "answer": "alliteration",
          "acceptedAnswers": [
            "alliteration"
          ],
          "match": "normalized",
          "hints": [
            "Listen to 'wild, windy, waves' — what repeats at the start?",
            "It is the repeating of the first consonant sound.",
            "It begins with 'all' and ends with 'ation'."
          ],
          "reveal": "ALLITERATION — repeated opening sounds. You receive a carved letter: E.",
          "reward": {
            "fragment": "E"
          },
          "points": 10
        },
        {
          "id": "s3",
          "name": "Stone of Tumbled Letters",
          "icon": "🪨",
          "narrative": "Carved letters have crumbled into a heap. Restore the poet's word.",
          "type": "anagram",
          "content": {
            "scrambled": "MIESIL",
            "clue": "A comparison that DOES use 'like' or 'as' — 'brave as a lion'."
          },
          "answer": "simile",
          "acceptedAnswers": [
            "simile"
          ],
          "match": "normalized",
          "hints": [
            "The clue is the gentle cousin of the metaphor.",
            "Six letters, ends in '-ile'.",
            "Re-arrange to spell SIMILE."
          ],
          "reveal": "SIMILE — a comparison using 'like' or 'as'. You receive a carved letter: R.",
          "reward": {
            "fragment": "R"
          },
          "points": 10
        },
        {
          "id": "s4",
          "name": "Stone of Atmosphere",
          "icon": "🪨",
          "narrative": "A worn plaque defines the feeling a poem creates.",
          "type": "vocab-lock",
          "content": {
            "definition": "The overall feeling or atmosphere a poem creates for the reader.",
            "sentence": "The grey rain and silent streets gave the poem a gloomy ____.",
            "firstLetter": "m"
          },
          "answer": "mood",
          "acceptedAnswers": [
            "mood",
            "atmosphere"
          ],
          "match": "normalized",
          "hints": [
            "It is the overall feeling the rainy scene creates.",
            "Another word for the emotional 'air' of a poem.",
            "Four letters, begins with 'm'."
          ],
          "reveal": "MOOD — the atmosphere a poem creates. You receive a carved letter: S.",
          "reward": {
            "fragment": "S"
          },
          "points": 10
        },
        {
          "id": "s5",
          "name": "X Marks the Spot",
          "icon": "❌",
          "narrative": "The final stone hides one last device in its grid of letters.",
          "type": "hidden-word",
          "content": {
            "instruction": "One 7-letter poetic device is hidden in the top row, reading left to right. Find it.",
            "grid": [
              "Q W I M A G E R Y",
              "P L O T B U R N E",
              "S A N D R I V E R"
            ],
            "targets": [
              "imagery"
            ]
          },
          "answer": "imagery",
          "acceptedAnswers": [
            "imagery"
          ],
          "match": "set",
          "hints": [
            "A 7-letter word for language that paints pictures in your mind.",
            "Scan the top row carefully, left to right.",
            "It starts after the 'WI' — I-M-A-G-E-R-Y."
          ],
          "reveal": "IMAGERY — descriptive language that creates pictures. You receive the last carved letter: E.",
          "reward": {
            "fragment": "E"
          },
          "points": 10
        }
      ]
    },
    {
      "schema": "ish-quest@1",
      "meta": {
        "id": "orators-sealed-archive",
        "title": "The Orator's Sealed Archive",
        "unit": "Persuasive writing & rhetoric — ethos, pathos, logos and rhetorical devices",
        "subject": "English: Language & Literature",
        "year": "Year 10 (MYP 5)",
        "mode": "escape",
        "theme": "detective",
        "author": "ISH English",
        "createdAt": 0
      },
      "story": {
        "introTitle": "The locked reading room",
        "intro": "You are sealed inside the old debating society's archive, where the speeches of history's great persuaders are kept. The night warden has gone and the door has clicked shut. Each cabinet guards a secret of rhetoric; unlock them in turn to release the final bolt and step back into the corridor.",
        "outro": "The final bolt slides free. You have decoded the orator's craft — appeal, device, and design — and proved you can name the tools that move an audience. The archive door swings open and the corridor lights flicker on. You read the architecture of persuasion and earned your way out."
      },
      "settings": {
        "hints": "free",
        "hintPenalty": 5,
        "startScore": 100,
        "shuffleHunt": false,
        "showProgress": true,
        "timer": false,
        "certificate": true,
        "fontDefault": "standard"
      },
      "stations": [
        {
          "id": "s1",
          "name": "The Mirror Plate",
          "icon": "🪞",
          "narrative": "A brass cabinet bears one word, but every letter is engraved back-to-front, as if read in a mirror.",
          "type": "cipher",
          "content": {
            "cipherType": "reverse",
            "plaintext": "ETHOS",
            "prompt": "Read the mirrored word the right way round to name the appeal it labels."
          },
          "answer": "ETHOS",
          "acceptedAnswers": [
            "ethos",
            "ethics",
            "credibility"
          ],
          "match": "normalized",
          "hints": [
            "The word has simply been written backwards — read it from right to left.",
            "Reverse the order of the letters and a familiar rhetorical term appears.",
            "It is the appeal to trust and character — it ends in '-thos' and begins with 'e'."
          ],
          "reveal": "Correct — ETHOS. This is the appeal to the speaker's credibility and character: we believe people we judge to be trustworthy and qualified.",
          "points": 10
        },
        {
          "id": "s2",
          "name": "The Scattered Seal",
          "icon": "🔠",
          "narrative": "A wax seal has cracked and its carved letters have tumbled into a heap on the reading desk.",
          "type": "anagram",
          "content": {
            "scrambled": "HOPTAS",
            "clue": "The appeal to the audience's emotions — pity, anger, pride, fear."
          },
          "answer": "PATHOS",
          "acceptedAnswers": [
            "pathos",
            "emotion",
            "emotional appeal"
          ],
          "match": "normalized",
          "hints": [
            "The clue points to the appeal that targets feelings, not logic.",
            "Six letters; it sits beside ethos and logos as the third classical appeal.",
            "Re-arrange the letters to spell PATHOS."
          ],
          "reveal": "PATHOS — the appeal to emotion. Persuaders use vivid imagery, anecdotes and loaded words to stir how an audience feels.",
          "points": 10
        },
        {
          "id": "s3",
          "name": "The Misfiled Drawer",
          "icon": "🗄️",
          "narrative": "Four index cards have been filed together, but one device does not belong with the rest.",
          "type": "odd-one-out",
          "content": {
            "prompt": "Three of these are persuasive or rhetorical techniques. Which card has been misfiled because it does NOT belong with them?",
            "items": [
              "rhetorical question",
              "rule of three",
              "onomatopoeia",
              "direct address"
            ]
          },
          "answer": "onomatopoeia",
          "acceptedAnswers": [
            "onomatopoeia"
          ],
          "match": "normalized",
          "hints": [
            "Three cards are tools a speaker uses to persuade an audience.",
            "One card is a sound device from poetry, not a way of winning over a reader.",
            "'Buzz', 'crash' and 'hiss' are examples of the odd one out."
          ],
          "reveal": "ONOMATOPOEIA is the odd one out — it imitates sounds and belongs to poetic sound devices. Rhetorical question, rule of three and direct address are all persuasive techniques.",
          "points": 15
        },
        {
          "id": "s4",
          "name": "The Speaker's Plaque",
          "icon": "🎙️",
          "narrative": "A brass plaque engraves a line from one of history's most famous persuasive speeches. Name who delivered it.",
          "type": "attribution",
          "content": {
            "quote": "I have a dream that my four little children will one day live in a nation where they will not be judged by the colour of their skin but by the content of their character.",
            "work": "\"I Have a Dream\" speech, 1963",
            "options": [
              "Martin Luther King Jr.",
              "Winston Churchill",
              "Nelson Mandela",
              "Abraham Lincoln"
            ]
          },
          "answer": "Martin Luther King Jr.",
          "acceptedAnswers": [
            "martin luther king jr.",
            "martin luther king",
            "mlk",
            "martin luther king junior",
            "dr martin luther king"
          ],
          "match": "normalized",
          "hints": [
            "The speech was delivered during the American civil rights movement in 1963.",
            "The repeated phrase 'I have a dream' is one of the most famous uses of anaphora in English.",
            "The speaker shares his name with a major US public holiday in January."
          ],
          "reveal": "Martin Luther King Jr. delivered these words in 1963. The repetition of 'I have a dream' is anaphora — a rhetorical device that builds rhythm and emotional momentum (pathos) while his moral authority supplies ethos.",
          "points": 15
        },
        {
          "id": "s5",
          "name": "The Final Manuscript",
          "icon": "📜",
          "narrative": "The last cabinet holds a short persuasive paragraph. Read it closely; the bolt releases only for the reader who can judge how it works.",
          "type": "comprehension",
          "content": {
            "passage": "Think of the river behind our school. Think of the children who once swam there, and the herons that once fished its banks. Today it is choked with plastic. We can clean it — but only if we act now, together, before another summer is lost.",
            "question": "Which technique is the writer relying on MOST to persuade the reader?",
            "options": [
              "presenting balanced statistics from both sides",
              "appealing to emotion through vivid images and urgency",
              "using technical scientific vocabulary",
              "quoting expert scientists by name"
            ]
          },
          "answer": "appealing to emotion through vivid images and urgency",
          "acceptedAnswers": [
            "appealing to emotion through vivid images and urgency",
            "b",
            "pathos",
            "emotion"
          ],
          "match": "normalized",
          "hints": [
            "Notice the pictures the writer paints — swimming children, fishing herons, a choked river.",
            "There are no statistics or named experts here; the power comes from feeling and a sense of 'act now'.",
            "This is pathos — the appeal to emotion — built from vivid imagery and urgency."
          ],
          "reveal": "Correct — the paragraph leans on pathos: vivid emotive imagery ('children who once swam', 'herons that once fished') and urgency ('act now', 'before another summer is lost') rather than data or expert testimony. Recognising which appeal dominates is how you evaluate a persuasive text.",
          "points": 20
        }
      ]
    },
    {
      "schema": "ish-quest@1",
      "meta": {
        "id": "romeo-and-juliet-escape",
        "title": "The Sealed Tomb of the Capulets",
        "unit": "Romeo and Juliet — Shakespeare's language, characters and plot",
        "subject": "English: Language & Literature",
        "year": "Year 9 (MYP 4)",
        "mode": "escape",
        "theme": "castle",
        "author": "ISH English",
        "createdAt": 0
      },
      "story": {
        "introTitle": "A torch in the Capulet vault",
        "intro": "The iron gate of the Capulet tomb has clanged shut behind you, and your torch is burning low. Friar Laurence carved a way out into the cold stone, but only a true reader of the play can follow it. Solve each clue along the wall to lift the final lock before the watchmen arrive.",
        "outro": "The last lock springs and the heavy door grinds open onto torchlit Verona. You traced the lovers' language, their voices and their tragic story, and read your way out of the tomb. Like the Prince at the play's close, you leave knowing the whole sad tale."
      },
      "settings": {
        "hints": "free",
        "hintPenalty": 5,
        "startScore": 100,
        "shuffleHunt": false,
        "showProgress": true,
        "timer": false,
        "certificate": true,
        "fontDefault": "standard"
      },
      "stations": [
        {
          "id": "s1",
          "name": "The Cipher on the Crypt Door",
          "icon": "🔐",
          "narrative": "Two words are chiselled into the crypt door in a simple shifted code. Decode them to name what dooms the lovers from the very start.",
          "type": "cipher",
          "content": {
            "cipherType": "caesar",
            "shift": 4,
            "plaintext": "STAR CROSSED",
            "prompt": "Shift every letter back to read the two words the Prologue uses to describe the lovers."
          },
          "answer": "STAR CROSSED",
          "acceptedAnswers": [
            "star crossed",
            "star-crossed",
            "starcrossed"
          ],
          "match": "normalized",
          "hints": [
            "Every letter has been pushed forward through the alphabet by the same small step.",
            "Shift each letter back by 4 (so W becomes S, and X becomes T).",
            "The Prologue calls the lovers 'a pair of ____ ____ lovers' — it means fated by the stars."
          ],
          "reveal": "Correct — STAR-CROSSED. In the Prologue Shakespeare calls Romeo and Juliet 'a pair of star-crossed lovers', telling us from the first lines that fate is against them.",
          "points": 10
        },
        {
          "id": "s2",
          "name": "Juliet's Balcony Line",
          "icon": "🌙",
          "narrative": "Below a carved balcony, a single word has worn away from one of the play's most famous lines. Restore it to release the catch.",
          "type": "fill-blank",
          "content": {
            "text": "On her balcony, Juliet sighs, 'O ____, ____, wherefore art thou ____?' — asking why the boy she loves must be a Montague.",
            "wordBank": [
              "Romeo",
              "Tybalt",
              "Mercutio",
              "Paris"
            ]
          },
          "answer": "Romeo",
          "acceptedAnswers": [
            "romeo"
          ],
          "match": "normalized",
          "hints": [
            "Juliet is speaking about the young man she has just fallen in love with at the feast.",
            "'Wherefore' means 'why', not 'where' — she is asking why he must be a Montague.",
            "His name begins with 'R'; the whole line is 'wherefore art thou Romeo?'"
          ],
          "reveal": "ROMEO. 'Wherefore art thou Romeo?' means 'why are you Romeo?' — Juliet wishes he were not a Montague, the enemy of her family, the Capulets.",
          "points": 12
        },
        {
          "id": "s3",
          "name": "The Voice on the Plaque",
          "icon": "🎭",
          "narrative": "A brass plaque records a witty, biting line spoken just after the speaker is given a fatal wound. Name who says it.",
          "type": "attribution",
          "content": {
            "quote": "Ask for me tomorrow, and you shall find me a grave man.",
            "work": "Romeo and Juliet, Act 3 Scene 1",
            "options": [
              "Mercutio",
              "Romeo",
              "Tybalt",
              "Benvolio"
            ]
          },
          "answer": "Mercutio",
          "acceptedAnswers": [
            "mercutio"
          ],
          "match": "normalized",
          "hints": [
            "This speaker is Romeo's quick-witted friend, famous for jokes and the 'Queen Mab' speech.",
            "Even while dying from Tybalt's sword, he cannot resist a pun — 'a grave man' means both serious and dead.",
            "His name begins with 'M' and his death turns the play from comedy toward tragedy."
          ],
          "reveal": "MERCUTIO. Even as he dies of Tybalt's wound he puns — 'a grave man' means both 'serious' and 'in a grave'. His death is the turning point that drives Romeo to revenge.",
          "points": 15
        },
        {
          "id": "s4",
          "name": "The Order of the Tragedy",
          "icon": "🕯️",
          "narrative": "Four carved tiles show key moments of the story, jumbled out of order. Lay them in the order they happen to free the next bolt.",
          "type": "sequence",
          "content": {
            "prompt": "Put these events from the play in the order they happen.",
            "items": [
              "Romeo and Juliet meet and fall in love at the Capulet feast",
              "Friar Laurence secretly marries Romeo and Juliet",
              "Romeo is banished from Verona for killing Tybalt",
              "Romeo and Juliet die in the Capulet tomb"
            ]
          },
          "answer": "Romeo and Juliet meet and fall in love at the Capulet feast|Friar Laurence secretly marries Romeo and Juliet|Romeo is banished from Verona for killing Tybalt|Romeo and Juliet die in the Capulet tomb",
          "acceptedAnswers": [
            "Romeo and Juliet meet and fall in love at the Capulet feast|Friar Laurence secretly marries Romeo and Juliet|Romeo is banished from Verona for killing Tybalt|Romeo and Juliet die in the Capulet tomb"
          ],
          "match": "ordered",
          "hints": [
            "Start with the night the lovers first meet — everything else follows from it.",
            "The secret wedding comes before the street fight in which Tybalt dies.",
            "Meet, marry, banishment, then the deaths in the tomb."
          ],
          "reveal": "Right order — they meet, marry in secret, Romeo is banished after killing Tybalt, and the play ends with both lovers dead in the tomb. Shakespeare drives us swiftly from joy to disaster in only a few days.",
          "points": 18
        },
        {
          "id": "s5",
          "name": "The Final Lock",
          "icon": "🗝️",
          "narrative": "One word, spelled exactly right, lifts the last lock. It names the kind of speech in which a character, alone on stage, reveals their private thoughts aloud.",
          "type": "spelling-lock",
          "content": {
            "definition": "A speech in which a character, alone on stage, speaks their inner thoughts aloud to the audience — like Juliet's 'Gallop apace' speech as she waits for Romeo.",
            "hintLetters": "s _ l _ l _ q _ y"
          },
          "answer": "soliloquy",
          "acceptedAnswers": [
            "soliloquy"
          ],
          "match": "exact",
          "hints": [
            "It is the technical term for a character thinking aloud, alone, so the audience hears their true feelings.",
            "Nine letters, beginning with 'soli-' (from the Latin for 'alone').",
            "s-o-l-i-l-o-q-u-y."
          ],
          "reveal": "SOLILOQUY — a speech delivered alone on stage that lets the audience hear a character's private thoughts. Shakespeare uses soliloquies to reveal Romeo's and Juliet's deepest feelings. The last lock lifts — you are free.",
          "points": 20
        }
      ]
    },
    {
      "schema": "ish-quest@1",
      "meta": {
        "id": "punctuation-power-hunt",
        "title": "Punctuation Power: The Starbase Code",
        "unit": "Punctuation and grammar — full stops, commas, apostrophes, sentence types, capital letters",
        "subject": "English: Language & Literature",
        "year": "Year 7 (MYP 1)",
        "mode": "hunt",
        "theme": "space",
        "author": "ISH English",
        "createdAt": 0
      },
      "story": {
        "introTitle": "Lost in the Asteroid Belt",
        "intro": "Captain, our ship is drifting! Five glowing star-stations float around us, each one locked by a puzzle about punctuation and grammar. Solve each station to win a glowing letter, then beam the secret word into the airlock to start the engines for home.",
        "outro": "The engines roar to life and the stars streak past — you punched in the code and saved the ship! You mastered the marks that keep our sentences clear, and that knowledge powered you all the way home."
      },
      "settings": {
        "hints": "free",
        "hintPenalty": 5,
        "startScore": 100,
        "shuffleHunt": true,
        "showProgress": true,
        "timer": false,
        "certificate": true,
        "fontDefault": "standard",
        "finalCode": {
          "type": "join",
          "separator": "",
          "value": "NOUNS",
          "label": "Spell the grammar treasure word from your letters"
        }
      },
      "stations": [
        {
          "id": "s1",
          "name": "The Mark That Doesn't Fit",
          "icon": "🛰️",
          "narrative": "A space-station panel shows four punctuation marks. One of them is NOT a punctuation mark at all. Tap the odd one out to power up the panel.",
          "type": "odd-one-out",
          "content": {
            "items": [
              "full stop",
              "comma",
              "question mark",
              "verb"
            ],
            "prompt": "Three of these are punctuation marks. Which word does NOT belong with the others?"
          },
          "answer": "verb",
          "acceptedAnswers": [
            "verb",
            "a verb"
          ],
          "match": "normalized",
          "hints": [
            "Three of these are tiny marks you write in a sentence.",
            "A full stop, a comma and a question mark are all punctuation.",
            "The odd one is a TYPE OF WORD, not a mark — it is a doing word."
          ],
          "reveal": "Correct — a 'verb' is a doing word, not a punctuation mark. The other three are all punctuation! You win the glowing letter: N.",
          "reward": {
            "fragment": "N"
          },
          "points": 10
        },
        {
          "id": "s2",
          "name": "The Missing Apostrophe",
          "icon": "⭐",
          "narrative": "A floating sign has lost a tiny mark. One word is missing its apostrophe. Type the word the way it should look.",
          "type": "fill-blank",
          "content": {
            "text": "The little robot waved at us. 'Hello! ____ so happy to meet you,' it beeped.",
            "wordBank": [
              "Im",
              "I'm",
              "Its",
              "Were"
            ]
          },
          "answer": "I'm",
          "acceptedAnswers": [
            "I'm",
            "i'm",
            "I am"
          ],
          "match": "normalized",
          "hints": [
            "The robot is joining two words: 'I' and 'am'.",
            "An apostrophe takes the place of the missing letter 'a'.",
            "Write 'I' then an apostrophe then 'm' — I'm."
          ],
          "reveal": "Yes — 'I'm' is short for 'I am', and the apostrophe replaces the missing 'a'. You win the glowing letter: O.",
          "reward": {
            "fragment": "O"
          },
          "points": 10
        },
        {
          "id": "s3",
          "name": "The Sentence Scanner",
          "icon": "🔭",
          "narrative": "The ship's scanner reads a sentence and asks you one question about it. Choose the right answer to unlock the scanner.",
          "type": "comprehension",
          "content": {
            "passage": "The astronaut floated to the window. Outside, the planet glowed a deep blue. 'Wow, look at that!' she gasped with a huge smile.",
            "question": "What type of sentence is 'Wow, look at that!' ?",
            "options": [
              "a statement that just gives a fact",
              "an exclamation that shows strong feeling",
              "a question that asks for an answer",
              "a command that is calm and quiet"
            ]
          },
          "answer": "an exclamation that shows strong feeling",
          "acceptedAnswers": [
            "an exclamation that shows strong feeling",
            "exclamation",
            "b"
          ],
          "match": "normalized",
          "hints": [
            "Look at the mark at the end of the sentence — it is an exclamation mark!",
            "An exclamation shows a big feeling, like surprise or excitement.",
            "She is amazed and excited — pick the option about strong feeling."
          ],
          "reveal": "Right — it ends with an exclamation mark (!) and shows strong feeling, so it is an exclamation. You win the glowing letter: U.",
          "reward": {
            "fragment": "U"
          },
          "points": 10
        },
        {
          "id": "s4",
          "name": "The Name-Word Vault",
          "icon": "👽",
          "narrative": "An alien guard asks you to name the kind of word it protects. Read the clue and type the grammar word.",
          "type": "vocab-lock",
          "content": {
            "definition": "A naming word: a word for a person, place, animal or thing — like 'planet', 'captain' or 'rocket'.",
            "sentence": "'Comet' and 'galaxy' are both this kind of word: a ____.",
            "firstLetter": "n"
          },
          "answer": "noun",
          "acceptedAnswers": [
            "noun",
            "a noun",
            "nouns"
          ],
          "match": "normalized",
          "hints": [
            "It is the kind of word that names a person, place or thing.",
            "'Dog', 'school' and 'Mars' are all examples of it.",
            "It begins with 'n' and rhymes with 'down' — a ____."
          ],
          "reveal": "Yes — a 'noun' is a naming word for a person, place, animal or thing. You win the glowing letter: N.",
          "reward": {
            "fragment": "N"
          },
          "points": 10
        },
        {
          "id": "s5",
          "name": "The Scrambled Star-Mark",
          "icon": "🚀",
          "narrative": "The final star-mark has shattered into jumbled letters. Unscramble them to name the pause-mark and launch for home.",
          "type": "anagram",
          "content": {
            "scrambled": "MMOCA",
            "clue": "The little curved mark you use to separate items in a list, like apples, pears and plums."
          },
          "answer": "comma",
          "acceptedAnswers": [
            "comma",
            "a comma"
          ],
          "match": "normalized",
          "hints": [
            "It is a tiny curved mark that makes you pause for a moment.",
            "You use it between items in a list: 'red, blue and green'.",
            "Five letters, begins with 'c' — re-arrange them to spell COMMA."
          ],
          "reveal": "COMMA — the mark that separates items and gives a short pause. You win the final glowing letter: S.",
          "reward": {
            "fragment": "S"
          },
          "points": 10
        }
      ]
    },
    {
      "schema": "ish-quest@1",
      "meta": {
        "id": "gothic-writing-escape",
        "title": "The Whispering Library",
        "unit": "Gothic and descriptive writing — atmosphere, imagery, sensory language and powerful word choice",
        "subject": "English: Language & Literature",
        "year": "Year 10 (MYP 5)",
        "mode": "escape",
        "theme": "library",
        "author": "ISH English",
        "createdAt": 0
      },
      "story": {
        "introTitle": "The library after dark",
        "intro": "The reading-room door has locked behind you and the lamps have guttered out. This is no ordinary library: its shelves keep the secrets of Gothic writing, and the books seem to breathe in the dark. Do not be afraid. Each shelf will test how a skilled writer builds atmosphere, and each correct answer lifts one bolt of the great oak door. Read closely, choose your words with care, and you will walk out before dawn.",
        "outro": "The final bolt draws back with a long, low groan and the heavy door swings open onto the moonlit corridor. You did not panic in the dark; you read the machinery of fear itself — how atmosphere, imagery and a single well-chosen word can make a reader shiver. The whispering library falls silent, almost as if, this time, it is impressed."
      },
      "settings": {
        "hints": "free",
        "hintPenalty": 5,
        "startScore": 100,
        "shuffleHunt": false,
        "showProgress": true,
        "timer": false,
        "certificate": true,
        "fontDefault": "standard"
      },
      "stations": [
        {
          "id": "s1",
          "name": "The Cold Lamp",
          "icon": "🕯️",
          "narrative": "A single candle gutters on the librarian's desk. Beside it, a card asks you to name the very mood this dim room creates.",
          "type": "vocab-lock",
          "content": {
            "definition": "A feeling of heavy darkness, sadness and threat — the brooding atmosphere a Gothic writer wants the reader to sense.",
            "sentence": "Cobwebs, faint moonlight and a chill in the air filled the hall with ____.",
            "firstLetter": "g"
          },
          "answer": "gloom",
          "acceptedAnswers": [
            "gloom",
            "gloominess",
            "darkness"
          ],
          "match": "normalized",
          "hints": [
            "Look at the scene — dim light, cobwebs, a cold draught. What single word names that heavy, dark feeling?",
            "It is the brooding, shadowy mood that hangs over a Gothic setting; it begins with 'g'.",
            "Five letters, starts with 'gl' — the opposite of brightness and cheer."
          ],
          "reveal": "GLOOM — the heavy, dark, threatening mood. Gothic writers build gloom through dim light, decay and cold to make the reader uneasy before anything has even happened.",
          "points": 10
        },
        {
          "id": "s2",
          "name": "The Mirror-Spine Book",
          "icon": "🔠",
          "narrative": "A black-bound book lies open, but its single title word is printed back-to-front, each letter swapped for its opposite in the alphabet, as if a cold hand reversed it.",
          "type": "cipher",
          "content": {
            "cipherType": "atbash",
            "plaintext": "DREAD",
            "prompt": "Each letter has been swapped for its mirror in the alphabet (A becomes Z, B becomes Y). Decode the word the book is whispering."
          },
          "answer": "DREAD",
          "acceptedAnswers": [
            "dread",
            "fear",
            "terror"
          ],
          "match": "normalized",
          "hints": [
            "This is an Atbash cipher — there is no shift to count. Each letter is simply mirrored: A swaps with Z, B with Y, and so on.",
            "Use the key on screen. The last letter of the code is the same as the first, so the word starts and ends with the same letter.",
            "Decoded letter by letter it spells a five-letter word for a creeping, fearful expectation that something terrible is coming."
          ],
          "reveal": "DREAD — a slow, creeping fear of something terrible about to happen. Gothic writing thrives on dread: the unbearable wait is often scarier than the monster itself.",
          "points": 12
        },
        {
          "id": "s3",
          "name": "The Scattered Letters",
          "icon": "🗝️",
          "narrative": "A fragile page has crumbled and its letters have spilled across the desk. Restore the word that names the writer's most powerful descriptive tool.",
          "type": "anagram",
          "content": {
            "scrambled": "MIRAGEY",
            "clue": "Descriptive language that paints pictures in the reader's mind by appealing to the senses."
          },
          "answer": "imagery",
          "acceptedAnswers": [
            "imagery"
          ],
          "match": "normalized",
          "hints": [
            "The clue describes language that makes you SEE, hear, smell, taste or feel a scene. What is that word called?",
            "Seven letters; it begins with 'im-' and is built from the word 'image'.",
            "Re-arrange the letters to spell IMAGERY."
          ],
          "reveal": "IMAGERY — descriptive language that appeals to the senses and builds vivid pictures. In Gothic writing, imagery of shadow, decay and cold is what makes a setting feel real and frightening.",
          "points": 14
        },
        {
          "id": "s4",
          "name": "The Riddle of the Living House",
          "icon": "🪞",
          "narrative": "A brass plate beside the locked archive door murmurs a riddle. Answer it to release the next bolt.",
          "type": "riddle",
          "content": {
            "riddle": "When a writer says the old house GROANED, the shutters WATCHED, and the wind WHISPERED my name, the building is given human life and feeling. What is this technique called?"
          },
          "answer": "personification",
          "acceptedAnswers": [
            "personification",
            "personnification",
            "personifaction",
            "personifcation",
            "giving human qualities",
            "human qualities",
            "making it human",
            "pathetic fallacy"
          ],
          "match": "normalized",
          "hints": [
            "The house is doing things only a living person could do — groaning, watching, whispering.",
            "It is a type of figurative language where a non-living thing is given human qualities or feelings.",
            "One word, beginning with 'person-' — it makes objects act like people."
          ],
          "reveal": "PERSONIFICATION — giving human qualities, actions or feelings to non-human things. Gothic writers love it: a house that 'watches' or a wind that 'whispers' makes the setting feel alive and threatening. (When the weather mirrors a mood, that close cousin is called pathetic fallacy.)",
          "points": 16
        },
        {
          "id": "s5",
          "name": "The Final Manuscript",
          "icon": "📜",
          "narrative": "The last cabinet holds a short Gothic paragraph, written long ago. Read it closely; the great door opens only for the reader who can judge HOW the fear is made.",
          "type": "comprehension",
          "content": {
            "passage": "The corridor narrowed as I crept on. Cold air pressed against my face like damp cloth, and the only sound was the slow, wet drip of something unseen. Far off, a door sighed open of its own accord, and the darkness ahead seemed to lean towards me, patient and aware.",
            "question": "How does the writer create a frightening atmosphere in this paragraph?",
            "options": [
              "by listing exciting events that happen very quickly",
              "by using sensory imagery and personification to make the dark feel alive",
              "by quoting facts and statistics about old buildings",
              "by making the narrator laugh at the danger"
            ]
          },
          "answer": "by using sensory imagery and personification to make the dark feel alive",
          "acceptedAnswers": [
            "by using sensory imagery and personification to make the dark feel alive",
            "b",
            "imagery and personification",
            "sensory imagery and personification"
          ],
          "match": "normalized",
          "hints": [
            "Notice what you can FEEL and HEAR — cold air like damp cloth, a slow wet drip. Those are appeals to the senses.",
            "Notice too that the door 'sighed' and the darkness 'leaned' and seemed 'aware' — the writer gives the setting human life.",
            "The fear comes from sensory imagery plus personification working together to make the darkness feel alive — not from action, facts or humour."
          ],
          "reveal": "Correct — the dread is built from sensory imagery ('cold air pressed... like damp cloth', 'the slow, wet drip') combined with personification (a door that 'sighed', darkness that 'leaned' and seemed 'aware'). Being able to name HOW a writer creates atmosphere is exactly how you evaluate and then imitate powerful descriptive writing. The final bolt slides free.",
          "points": 20
        }
      ]
    }
  ];
})();
