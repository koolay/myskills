---
name: ko-dx-maple-observe
description: "Use when developing or debugging a local service and the user needs Maple Local telemetry for logs, traces, metrics, error groups, latency analysis, or service-health evidence; do not trigger for Maple installation, deployment, hosted-workspace administration, or unrelated OpenTelemetry work."
---

# Maple Local Observability

**Goal:** Use an already-running Maple Local instance as a read-only evidence source for local service bug and performance diagnosis. Keep code changes and instrumentation changes separate from telemetry inspection.

**Use when:** The task concerns a local service and asks to inspect Maple logs, traces, metrics, errors, latency, regressions, service dependencies, or missing observability.

**Do not use when:** The task is to deploy Maple, manage a hosted Maple workspace, or diagnose a production incident without a local Maple endpoint. Use the project's normal logs and monitoring workflow instead.

## Inputs

- **service** - Service name from `OTEL_SERVICE_NAME` or the repository's telemetry configuration.
- **symptom** - Error, endpoint, slow operation, request ID, trace ID, or observed behavior.
- **time window** (optional) - Default to the smallest useful recent window, usually `30m` or `1h`; use absolute UTC times when the incident time is known.
- **environment** (optional) - `--env` value or the local service environment.
- **repository context** (optional) - Startup command, OTLP exporter configuration, recent diff, and test or reproduction steps.

## Execution

### Phase 1: Establish safe local context

1. Inspect the service startup/configuration and identify its service name, environment, OTLP endpoint, and the exact reproduction window. Do not guess a service name from a directory name.
2. Check whether the CLI exists with `command -v maple`.
   - If it is missing, stop Maple-specific analysis and say:
     > 未检测到 Maple CLI。请先按 [Maple Local 安装文档](https://maple.dev/docs/local-mode/) 安装；我不会自动安装或启动 Maple。
   - If it exists, probe the existing local server with the read-only command `maple --local services --format json`.
   - If a Maple command or flag fails, run `maple --help` and the relevant subcommand help before changing the workflow; report unsupported commands or version differences instead of guessing.
3. If the probe fails because no local server is reachable, stop Maple queries and say:
   > Maple CLI 已找到，但本地 Maple 服务未启动或不可达。请在另一个终端运行 `maple start`（无网络或需要内置 UI 时可用 `maple start --offline`），然后让我继续；我不会自动启动、停止、重置或部署 Maple。
4. Never run `maple start`, `maple stop`, `maple reset`, an installer, or an uninstaller during this workflow. Do not change `~/.maple/data`.
5. Keep queries local: use `--local` explicitly so a stored remote token cannot redirect evidence collection to a hosted workspace.

### Phase 2: Verify telemetry before diagnosing

1. Confirm the service exports OTLP/HTTP to the running local Maple endpoint, normally `http://127.0.0.1:4318`; inspect existing `OTEL_EXPORTER_OTLP_ENDPOINT`, signal-specific endpoints, and `OTEL_SERVICE_NAME` before suggesting changes.
2. Maple Local accepts OTLP traces, logs, and metrics at `/v1/traces`, `/v1/logs`, and `/v1/metrics`; local export needs no auth header. Do not claim that a signal exists until a query returns it.
3. Check trace/log correlation. A `trace_id` in logs is useful only when the service actually propagates trace context and exports both signals.
4. If telemetry is absent or routed elsewhere, report that as an observability gap. Suggest the smallest configuration or instrumentation change; do not add a new SDK or dependency unless the user asks for implementation.

### Phase 3: Collect evidence in a cheap-to-expensive order

Use JSON output by default. Replace `WINDOW` with the user's requested range (default `30m` for a focused incident or `1h` for a broad scan); use every supported time-range and result-limit flag. Some aggregate commands do not support `--limit`, while an ID-specific trace query is already bounded by the ID. Add `--debug` only when compiled SQL and per-query timing are useful.

```bash
WINDOW=30m

# Service health, throughput, error rate, and P95
maple --local services --since "$WINDOW" --format json
maple --local diagnose <service> --since "$WINDOW" --format json

# Errors and traces
maple --local errors --service <service> --since "$WINDOW" --limit 20 --format json
maple --local traces --service <service> --since "$WINDOW" --limit 20 --format json
maple --local trace <trace-id> --format json

# Logs and correlation
maple --local logs --service <service> --severity ERROR --since "$WINDOW" --limit 50 --format json
maple --local logs --trace-id <trace-id> --since "$WINDOW" --limit 100 --format json
maple --local logs --search '<distinctive text>' --since "$WINDOW" --limit 50 --format json
maple --local log-patterns --service <service> --since "$WINDOW" --limit 20 --format json

# Performance and dependency clues
maple --local slow-traces --service <service> --since "$WINDOW" --limit 20 --format json
maple --local top-ops <service> --metric p95_duration --since "$WINDOW" --limit 20 --format json
maple --local timeseries --service <service> --since "$WINDOW" --format json
maple --local compare --around '<UTC timestamp>' --format json
maple --local service-map --since "$WINDOW" --format json
```

Use the command's documented filters (`--since`, `--start`/`--end`, `--service`, `--env`, `--limit`, `--offset`) rather than inventing SQL. `compare` does not take `--service`; it requires `--around <UTC timestamp>` or all four explicit current/previous window bounds, then inspect the returned service rows. Use raw `maple --local query` only when a built-in command cannot answer the question, after checking the current schema and adding a bounded, read-only filter; never use an unbounded raw query merely for convenience.

### Phase 4: Analyze and correlate

1. Classify the symptom as availability/error, latency, dependency, log pattern, or telemetry ingestion.
2. Establish a baseline before explaining a regression: compare the same service, operation, environment, and window. Prefer `maple compare`, `timeseries`, `top-ops`, and `slow-traces` over a single outlier.
3. For an error, connect the chain: error fingerprint -> sample trace -> slow or failed span -> correlated logs -> source code or dependency. Use `maple --local trace <trace-id>` before searching logs by `--trace-id`.
4. For latency, separate total trace duration from the slowest span. Treat a child span as a downstream candidate only when its duration dominates the root or it carries a downstream status, timeout, exception, retry, or `peer.service`/remote dependency attribute. If internal application spans dominate and downstream spans are healthy or absent, treat the application as a candidate; if child spans are missing, report the attribution as unknown.
5. Confirm an HTTP 500 from HTTP status fields or correlated request logs; do not equate every error span with HTTP 500. Inspect both slow successful requests and failed requests so failures are not mistaken for the p95 latency cause.
6. For noisy logs, use severity/text filters and `maple --local log-patterns --since "$WINDOW"`; do not treat log volume as request volume.
7. State evidence, inference, sample count, data freshness, and unknowns separately. Missing telemetry is not evidence that the service is healthy.
8. For a regression, compare equal-length current and baseline windows and report the before/after error rate, latency percentile, throughput, sample count, and affected trace shape. After an authorized code or configuration change, rerun the same bounded queries.

### Phase 5: Handle Maple runtime problems

If Maple itself is the suspected fault, inspect the read-only detached log at `~/.maple/maple.log` when present and report the exact failure. Do not repair the data directory or change bind/port settings. Maple Local is unauthenticated and binds loopback by default; do not recommend `--host 0.0.0.0` unless the user explicitly needs network access and understands that all local routes are exposed.

## Output Format

Return a concise Markdown report:

```markdown
# Maple Local diagnosis: <service> / <symptom>

## Status
- Maple CLI: found | missing
- Maple Local: reachable | not reachable
- Telemetry: traces/logs/metrics present or missing
- Window: <start> to <end>, timezone

## Evidence
| Signal | Query | Result | Confidence |
|---|---|---|---|
| ... | ... | ... | high/medium/low |

## Likely cause
1. <evidence-backed finding>
2. <alternative or unknown, if material>

## Observability gaps
- <missing correlation, exporter mismatch, or insufficient sample>

## Next actions
1. <smallest code/config/test action>
2. <rerun query or reproduction>

## Commands run
- `<read-only command>`
```

Do not paste unbounded telemetry, credentials, request bodies, or personal data. Redact tokens and sensitive attributes in the report.

## Important Principles

- Maple is an evidence source, not the diagnosis itself; connect telemetry to the service code and reproduction.
- Prefer the smallest time window and result limit that can answer the question.
- Use `--local` on every Maple query in this skill.
- Never fabricate a trace, log, metric, percentile, or root cause when telemetry is missing or the query failed.
- Do not automatically install, start, stop, reset, deploy, expose, or reconfigure Maple.
- Preserve user work and keep instrumentation changes minimal and explicit.

## Halt Conditions

- **HALT Maple analysis** when the CLI is missing or the local server is unreachable; give the friendly install/start message above and wait for the user.
- **HALT and ask one concise question** when service identity or the incident window cannot be inferred safely.
- **HALT any service start, reproduction, test, benchmark, or environment change** when the user forbids starting services or requests read-only diagnosis; inspect only already-running processes and telemetry.
- **HALT before changing code/config** when the user asked only for diagnosis; provide findings and a proposed patch instead.
- **HALT before raw SQL or data-directory actions** when a built-in read-only command is sufficient or the operation could mutate data.
- **HALT network exposure advice** unless the user explicitly requests non-loopback access and accepts the unauthenticated-route risk.

## Sources

- [Maple Local](https://maple.dev/docs/local-mode/)
- [Maple CLI Reference](https://maple.dev/docs/local-mode/cli-reference/)
- [Maple local-mode source documentation](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md)
- [Maple repository](https://github.com/MapleTechLabs/maple)
