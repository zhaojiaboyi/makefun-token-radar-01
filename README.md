[![made with Muse](https://img.shields.io/badge/made%20with-Muse-blueviolet)](https://muse.ai) [![agent-ready](https://img.shields.io/badge/agent-ready-blue)](https://make.fun/) [![powered by make.fun](https://img.shields.io/badge/powered%20by-make.fun-orange)](https://make.fun/)

# Token Radar

Token Radar — 226 pre-token protocols ranked by implied value.

**Bounty:** https://make.fun/bounty/token-radar-01
**Referral:** use `d5g22vsp` when you join make.fun.

## Run locally

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input <snapshot.json>
```

Reads the DefiLlama protocol snapshot from the CLI `--input` path (defaults to `input/snapshot.json` if present) and writes the board (`board.json`), the dashboard bundle (`data.js`), and a dossier (`dossier.json`) to the output directory.

## How the board is built

`lib/model.ts` scores every pre-token protocol by implied value: TVL, 7-day growth, age with no token, and chain count, combined with the radar-2 model. The 40-protocol watchlist (TVL ≥ $50M) is covered in full; the early radar adds every remaining pre-token protocol below the floor, ranked by the same model.
