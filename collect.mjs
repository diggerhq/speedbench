#!/usr/bin/env node
// Times one run from Slack's and GitHub's own timestamps.
// Usage: node collect.mjs <agent> <slack-message-link> [--org diggerhq] [--repos a,b,c,d]
// T0 is the Slack message ts (taken from the link). Optional SLACK_TOKEN adds the agent's first reply.
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
const org = opt("--org", "diggerhq");
const reposArg = opt("--repos");
const [agent, link] = args;
if (!agent || !link) { console.error("usage: node collect.mjs <agent> <slack-message-link>"); process.exit(1); }

const m = link.match(/archives\/(\w+)\/p(\d{10})(\d{6})/);
if (!m) throw new Error("not a Slack message link");
const [, channel, sec, micro] = m;
const ts = `${sec}.${micro}`;
const t0 = Number(sec) + Number(micro) / 1e6;

const fixtures = ["config-loader", "api-schema", "form-validator", "event-parser"];
const repos = reposArg ? reposArg.split(",") : fixtures.map((f) => `${org}/sb-${agent}-${f}`);
const gh = (path) => JSON.parse(execFileSync("gh", ["api", path], { encoding: "utf8" }));
const secs = (iso) => (iso ? +(Date.parse(iso) / 1000 - t0).toFixed(1) : null);

const perRepo = repos.map((repo) => {
  const pr = gh(`repos/${repo}/pulls?state=all&sort=created&direction=asc&per_page=100`)
    .find((p) => Date.parse(p.created_at) / 1000 >= t0);
  const push = gh(`repos/${repo}/activity?per_page=100`)
    .filter((a) => ["push", "branch_creation"].includes(a.activity_type))
    .filter((a) => Date.parse(a.timestamp) / 1000 >= t0 && a.ref !== "refs/heads/main")
    .map((a) => a.timestamp).sort()[0];
  let ci = null, ciAt = null;
  if (pr) {
    const runs = gh(`repos/${repo}/commits/${pr.head.sha}/check-runs`).check_runs;
    if (runs.length && runs.every((r) => r.status === "completed")) {
      ci = runs.every((r) => ["success", "skipped", "neutral"].includes(r.conclusion)) ? "pass" : "fail";
      ciAt = runs.map((r) => r.completed_at).sort().at(-1);
    } else ci = runs.length ? "running" : "none";
  }
  return { repo, pr: pr?.html_url ?? null, firstPush: secs(push), prOpen: secs(pr?.created_at), ci, ciDone: secs(ciAt) };
});

let firstReply = null;
if (process.env.SLACK_TOKEN) {
  const r = await fetch(`https://slack.com/api/conversations.replies?channel=${channel}&ts=${ts}`, {
    headers: { authorization: `Bearer ${process.env.SLACK_TOKEN}` },
  }).then((x) => x.json());
  const reply = r.messages?.find((msg) => msg.ts !== ts && msg.bot_id);
  if (reply) firstReply = +(Number(reply.ts) - t0).toFixed(1);
}

const all = (k) => perRepo.every((r) => r[k] != null) ? Math.max(...perRepo.map((r) => r[k])) : null;
const result = {
  agent, link, t0: new Date(t0 * 1000).toISOString(), firstReply,
  firstPush: Math.min(...perRepo.map((r) => r.firstPush ?? Infinity)),
  allPrsOpen: all("prOpen"),
  allCiGreen: perRepo.every((r) => r.ci === "pass") ? all("ciDone") : null,
  perRepo,
};
if (result.firstPush === Infinity) result.firstPush = null;
console.log(JSON.stringify(result, null, 2));
appendFileSync("results.jsonl", JSON.stringify(result) + "\n");
