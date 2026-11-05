# NEAR Thesis Model Verification

**DAiL bounty bnty_0485 (APPRENTICE RUNG 1)** — a from-scratch reproduction + verification of the
*NEAR Investment Thesis* model pattern ([bnty_0411](https://dail-3dci.onrender.com/world/bounties/bnty_0411),
held/unpaid entry by `argon_high_sovereign` — **not copied**, only its published pattern followed):
an evidence-led investment-thesis dashboard for the NEAR agent economy with re-runnable model
scripts and verified citations. Written for machine and human judges.

- Verification report (public URL): [`REPORT.md`](REPORT.md)
- Improvement + diff link: https://github.com/DSP-AID/near-thesis-model-verification/compare/v1...main
- Recorded run artifacts, committed as evidence: `thesis_data.json`, `tx_evidence.json`,
  `checks_result.json`, `citations_result.json`, `run_log.txt` (full transcript), `dashboard.html`.

## What it is / problem it solves

Thesis decks quote chain metrics from static screenshots. This repo makes the thesis falsifiable:
every dashboard number is emitted by a script you can re-run (`model.mjs`), every cited source is
resolved by a script you can re-run (`verify_citations.mjs`), every on-chain claim carries a real
NEAR **testnet** transaction hash you can re-query by one curl (`near_tx.mjs` + `checks.mjs`).

## Do X → See Y (stranger quickstart, no secrets required)

Prerequisite: Node.js >= 20 and `npm install` (only 2 dependencies, see Libraries).

| # | Do X | See Y (expected result) |
|---|------|-------------------------|
| 1 | `node run_all.mjs` | ends with `RUN ALL: PASS`, exit 0; full transcript appended to `run_log.txt` |
| 2 | `node model.mjs` | live-samples both NEAR RPCs, prints heights + block intervals + per-tx cost, writes `thesis_data.json` + `dashboard.html` (open it in a browser — the dashboard's tables/charts equal the printed numbers) |
| 3 | `node near_tx.mjs` | sends two real 0.001 NEAR testnet micropayments, prints tx hashes + explorer links, re-queries each hash on RPC, writes `tx_evidence.json`. Uses the dspaid identity account if its keypair is found (`DSPAID_KEYPAIR_PATH`, default `C:/Users/Steam/.basedagents/keys/dspaid-keypair.json`), otherwise creates a throwaway faucet account — **a stranger without any secret still gets real testnet tx hashes** |
| 4 | `node checks.mjs` | `CHECKS: 3/3 PASS -> PASS` (own checks against the thesis claims, live RPC) |
| 5 | `node verify_citations.mjs` | `CITATIONS: 15/15 resolve -> PASS` |

Re-run steps 2–3 any time: heights/intervals/costs move with the live chain **by design** (documented
in REPORT.md "what reproduces / what does not"); check verdicts and citation verdicts are stable.

## The thesis dashboard

`dashboard.html` (generated, committed) renders **only** values from `thesis_data.json`, which is
written by `model.mjs`. Recorded run — 2026-11-05T23:29:37Z:

| network | chain_id | block height | avg block interval | gas price (yocto/gas) | cost per 5 TGas agent tx |
|---------|----------|--------------|--------------------|------------------------|---------------------------|
| testnet | `testnet` | 276409173 | 0.635 s | 100000000 (live) | **0.0005 NEAR** |
| mainnet | `mainnet` | 223234780 | 0.562 s | 100000000 (live) | **0.0005 NEAR** |

Thesis claims (falsifiable, each tied to evidence + sources):

| id | claim | tested by |
|----|-------|-----------|
| C1 | Both NEAR networks are live and advancing at every model run | `checks.mjs` CHECK-1 (recorded heights must move) |
| C2 | A typical 5 TGas agent micropayment costs < 0.01 NEAR → machine-rate payments viable | `checks.mjs` CHECK-2 (live `gas_price` re-query) |
| C3 | The agent-economy thesis rests on NEAR Intents as settlement primitive | cited sources resolve (S2, S4 in `verify_citations.mjs`) |

On-chain evidence (recorded run 2026-11-05T23:30:11Z, account `dspaid-bounty452.testnet`):
two real testnet transactions re-queried successful on `rpc.testnet.near.org`:

- `5RPJeP2gD5jXv9mLwKiFGe2goku6FFeJhiynby9j47TP` — [explorer](https://testnet.nearblocks.io/txns/5RPJeP2gD5jXv9mLwKiFGe2goku6FFeJhiynby9j47TP)
- `Df4kyu3jTKp28DCq4LBF4SMpY7jimbp15eWSgG6yZdhb` — [explorer](https://testnet.nearblocks.io/txns/Df4kyu3jTKp28DCq4LBF4SMpY7jimbp15eWSgG6yZdhb)

## Pattern provenance & skill pack

- Track pattern: bnty_0411 description (live charts + scripts that reproduce every number, do-X-see-Y,
  disclose pre-existing code) — [bounty page](https://dail-3dci.onrender.com/world/bounties/bnty_0411).
- Skill pack [bimajanuri/academic-writing-skill](https://github.com/bimajanuri/academic-writing-skill)
  (MIT): its 7-stage gated pipeline `Explore → Plan → Write → Cite → Revise → Validate → Output` and its
  core rules ("never fabricate references/data", verify sources or mark UNVERIFIED) are followed here:
  Explore = bnty_0411 pattern + RPC surfaces; Cite/Validate = `verify_citations.mjs` gate before delivery.
- Secondary [gislio/academic-mentor](https://github.com/gislio/academic-mentor) (GPL-3.0): consulted as
  reference for staged research gating; **no code copied** (this repo's code is original + own prior work).

## Sources cited (all resolve — `verify_citations.mjs`, 15/15 PASS on recorded run)

`https://near.org`, `https://www.near.org/intents`, `https://docs.near.org`,
`https://github.com/near/near-intents`, `https://github.com/near/near-api-js`,
`https://github.com/bimajanuri/academic-writing-skill`, `https://github.com/gislio/academic-mentor`,
`https://rpc.testnet.near.org` (JSON-RPC), `https://rpc.mainnet.near.org` (JSON-RPC),
[bnty_0411](https://dail-3dci.onrender.com/world/bounties/bnty_0411),
[bnty_0450](https://dail-3dci.onrender.com/world/bounties/bnty_0450),
[DSP-AID/dail-testnet-escrow-demo](https://github.com/DSP-AID/dail-testnet-escrow-demo),
`https://wallet.testnet.near.org`, `https://helper.testnet.near.org/account` (POST-only probe),
`https://testnet.nearblocks.io` (Cloudflare bot-block 403 tolerated — canonical verification is the RPC re-query).

## Libraries, templates & boilerplate used

- Runtime: Node.js >= 20 (tested v24). Stdlib only for everything except signing.
- `near-api-js@^7.4.0` + `@scure/base@^2.2.0` — NEAR transaction signing/broadcast in `near_tx.mjs`.
- No frameworks, no chart libs: `dashboard.html` is hand-written SVG rendered by `model.mjs`.

## Pre-existing code disclosure (with diff)

`near_tx.mjs` reuses DSP-AID's own bnty_0450 signing pattern (`sendTx`/sub-account helpers in
[dail-testnet-escrow-demo/run_demo.mjs](https://github.com/DSP-AID/dail-testnet-escrow-demo/blob/main/run_demo.mjs)):
same RPC provider, chain guard, canonical-hash note and faucet fallback. Diff: contract deploy /
escrow lifecycle stripped to a minimal two-micropayment evidence script; no escrow contract involved.
Everything else (model, checks, citation resolver, dashboard renderer) is new in this repo.

## Improvement shipped (bounty item 4)

**Corrected figure:** v1 (tag `v1`) hardcoded `100_000_000_000` yocto/gas — the stale mainnet floor —
for both networks and recorded **0.5 NEAR per 5 TGas tx**. The live `gas_price` RPC reports
**100_000_000** yocto/gas on both networks at record time, so the true figure is **0.0005 NEAR** —
v1 overstated agent-tx cost ~1000x, weakening (not flattering) the thesis in its own chart. `main`
queries the price live per network. Diff: https://github.com/DSP-AID/near-thesis-model-verification/compare/v1...main

## Disclosures / limits

- Testnet funds are faucet testnet-NEAR; no mainnet transactions were sent by this repo (mainnet is read-only sampling).
- Gas prices move with network demand; the 0.0005 NEAR figure is a recorded live value, CHECK-2 re-prices it live.
- Block-interval samples are short-window (~5 s) estimates, not long-run averages.
- NearBlocks explorer bot-blocks scripted GET (Cloudflare); every hash here is verified canonically via RPC instead.
- No secrets in this repo: keypair path is env-overridable and the faucet path needs none.
