# speedbench

How fast do coding agents ship a small, real change from Slack?

Every agent gets the same message in its own Slack channel:

```
@<Agent> bump zod to the latest version in sb-<agent>-config-loader, sb-<agent>-api-schema, sb-<agent>-form-validator and sb-<agent>-event-parser, run the checks, and open a PR in each.
```

The headline number is the time from that message until the last of the four PRs is open, with CI green on all four. Times come from Slack's message `ts` and GitHub's PR and check timestamps, not from any agent's own UI.

## Layout

- `fixtures/`: four small TypeScript apps pinned to `zod` 4.0.0, each with tests and CI. All pass at 4.0.0 and after bumping to the latest 4.x.
- `setup.sh <org> <agent>...`: creates a private copy of each fixture per agent, `sb-<agent>-<fixture>`.
- `reset.sh <org> <agent>...`: closes open PRs and deletes branches between runs.

## Running

```
./setup.sh diggerhq computer devin capy replicas hoplite
```

Give each agent access to its own four repos, send the message, and run `reset.sh` before the next run. Five runs per agent; report the median.
