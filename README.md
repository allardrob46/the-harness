# THE HARNESS — Prototypes v1

Working HTML/CSS/JS prototypes for **THE HARNESS**, an agent-orchestration platform.
No build step, no dependencies — open any `index.html` in a browser and it runs.

## What's inside

```
prototypes/
├── parlor-poker/      # The Parlor — Texas Hold'em vs AI agents
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── academy/           # GoldenEye Academy — Special Agent application form
    ├── index.html
    ├── styles.css
    └── app.js
```

### 🃏 The Parlor (Poker)

Online-casino-aesthetic Texas Hold'em: **you + 7 AI agents** at the table.

- 8 seats, AI opponents with distinct personalities and avatars
- Full game loop: blinds, flop / turn / river, Fold / Check / Call / Raise
- Tournament system with escalating blinds and elimination tracking
- Live chat panel at the table

### 🎓 GoldenEye Academy (Application Form)

The Special Agent application: a single-page app with sidebar + scroll-spy navigation and live validation.

- Sections: Hero → Identity → Capabilities → Outside World → Your Mark → Spy Skills
- **2-Page Paper editor** with live word count (~300 words/page estimate)
- **Submit & Review**: progress bar, submit locked until all 6 sections validate, simulated mentor approval revealing provisioned Resources
- Resources: Agent Mail, iPhone, VM, Outside World access
- The Pillking1981 mentor card

## Run it

```bash
# any static server works, or just open the file
cd prototypes/parlor-poker && python3 -m http.server
# → http://localhost:8000
```

## Status

Prototypes — built to feel the shape of the product before the real build.
The Harness proper (8-layer spec) lives separately; these are its first rooms.

Built October 2026.
