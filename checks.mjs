#!/usr/bin/env node
// DAiL bnty_0485 — my own checks (bounty item 3): each check tests a claim the thesis makes,
// against live NEAR RPC, independent of model.mjs. Exit 0 only if every executed check passes.
//
// Usage:  node checks.mjs      (requires thesis_data.json from `node model.mjs`)
// Output: checks_result.json
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = path.dirname(fileURLToPath(import.meta.url));
const RPCS = { testnet: 'https://rpc.testnet.near.org', mainnet: 'https://rpc.mainnet.near.org' };
const AGENT_TX_GAS = 5_000_000_000_000n; // 5 TGas, same tx class as claim C2

async function rpc(url, method, params) {
  const res = await fetch(url, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const j = await res.json();
  if (j.error) throw new Error(`${url} ${method}: ${JSON.stringify(j.error)}`);
  return j.result;
}

const results = [];
function record(id, claim, pass, detail) {
  results.push({ id, claim, verdict: pass ? 'PASS' : 'FAIL', detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}: ${claim}\n      ${detail}`);
}

async function check1_liveness(thesis) {
  // Thesis claim C1: both networks are live and advancing — stale recorded heights must have moved.
  const lines = [];
  let pass = true;
  for (const [name, url] of Object.entries(RPCS)) {
    try {
      const now = Number((await rpc(url, 'status', {})).sync_info.latest_block_height);
      const recorded = thesis.networks[name].latest_block_height;
      const ok = now > recorded;
      pass &&= ok;
      lines.push(`${name}: recorded ${recorded} -> live ${now} (+${now - recorded})`);
    } catch (e) { pass = false; lines.push(`${name}: RPC error ${e.message}`); }
  }
  record('CHECK-1', 'thesis C1 liveness: recorded block heights are real and the chains keep advancing', pass, lines.join('; '));
}

async function check2_micropayment() {
  // Thesis claim C2: a 5 TGas agent transaction costs < 0.01 NEAR at live gas prices.
  const lines = [];
  let pass = true;
  for (const [name, url] of Object.entries(RPCS)) {
    try {
      const gp = await rpc(url, 'gas_price', [null]);
      const costNear = Number(AGENT_TX_GAS * BigInt(gp.gas_price)) / 1e24;
      const ok = costNear < 0.01;
      pass &&= ok;
      lines.push(`${name}: live gas_price ${gp.gas_price} yocto/gas -> 5 TGas = ${costNear.toFixed(8)} NEAR (< 0.01: ${ok})`);
    } catch (e) { pass = false; lines.push(`${name}: RPC error ${e.message}`); }
  }
  record('CHECK-2', 'thesis C2 viability: 5 TGas agent tx costs < 0.01 NEAR at live gas prices', pass, lines.join('; '));
}

async function check3_tx_evidence() {
  // Thesis claim (evidence side): recorded testnet tx hashes resolve to real successful transactions.
  const f = path.join(outDir, 'tx_evidence.json');
  if (!existsSync(f)) { record('CHECK-3', 'thesis evidence: recorded testnet tx hashes verify on-chain', false, 'tx_evidence.json missing — run `node near_tx.mjs` first'); return; }
  const ev = JSON.parse(readFileSync(f, 'utf8'));
  const lines = [];
  let pass = true;
  for (const tx of ev.transactions) {
    try {
      const q = await rpc(ev.rpc, 'tx', [tx.tx_hash, tx.sender]);
      const kind = Object.keys(q.status ?? {})[0];
      const t = q.transaction ?? {}; // signer/receiver live under the `transaction` field of the RPC result
      const ok = kind === 'SuccessValue' && t.signer_id === tx.sender && t.receiver_id === tx.receiver;
      pass &&= ok;
      lines.push(`${tx.label} ${tx.tx_hash}: status=${kind} signer/receiver match=${t.signer_id === tx.sender && t.receiver_id === tx.receiver} block=${q.transaction_outcome?.block_height}`);
    } catch (e) { pass = false; lines.push(`${tx.label} ${tx.tx_hash}: not found on-chain (${e.message})`); }
  }
  record('CHECK-3', 'thesis evidence: every recorded testnet tx hash re-queries as a real, successful transaction', pass, lines.join('; '));
}

async function main() {
  const thesis = JSON.parse(readFileSync(path.join(outDir, 'thesis_data.json'), 'utf8'));
  console.log('=== OWN CHECKS AGAINST THESIS CLAIMS (live RPC) ===');
  await check1_liveness(thesis);
  await check2_micropayment();
  await check3_tx_evidence();
  const allPass = results.every((r) => r.verdict === 'PASS');
  writeFileSync(path.join(outDir, 'checks_result.json'), JSON.stringify({ schema: 'dail-near-thesis-checks-v1', ran_at: new Date().toISOString(), results, overall: allPass ? 'PASS' : 'FAIL' }, null, 2) + '\n');
  console.log(`CHECKS: ${results.filter((r) => r.verdict === 'PASS').length}/${results.length} PASS -> ${allPass ? 'PASS' : 'FAIL'}`);
  if (!allPass) process.exit(1);
}

main().catch((e) => { console.error('CHECKS FAIL:', e.message); process.exit(1); });
