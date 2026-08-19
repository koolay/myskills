# Maple local mode findings

Research date: 2026-08-19

## Scope and source policy

This note uses Maple's first-party documentation and repository only: [Maple Local](https://maple.dev/docs/local-mode/), the [Maple repository](https://github.com/MapleTechLabs/maple), the repository's [local-mode design document](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md), and the linked first-party [CLI reference](https://maple.dev/docs/local-mode/cli-reference/). Claims below are documented behavior, not independent runtime verification.

## Runtime shape

- **Documented:** Local mode is one self-contained `maple` binary plus `libchdb`; it provides OTLP ingest, an embedded ClickHouse/chDB store, a query API, and a dashboard. It runs single-tenant with every row under `org_id = "local"`; it does not use the cloud, Tinybird, or authentication. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md), [Maple Local](https://maple.dev/docs/local-mode/))
- **Implementation detail:** `maple start` owns the single chDB connection. Query commands such as `maple traces` call the running server over HTTP rather than opening chDB themselves. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md))
- **Defaults:** The server binds `127.0.0.1`, listens on port `4318`, stores data in `~/.maple/data`, and can run detached with logs in `~/.maple/maple.log`. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/), [Maple Local](https://maple.dev/docs/local-mode/))

## Observability capabilities

### Logs

- **Ingest:** Send OTLP/HTTP logs to `POST /v1/logs`; bodies may be protobuf or JSON and may be gzip-encoded. No local auth header is required. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/), [Maple Local](https://maple.dev/docs/local-mode/))
- **CLI search:** `maple logs` filters by severity (`TRACE` through `FATAL`), substring text, trace ID, service, and time range; `maple log-patterns` clusters logs into templates. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Correlation:** `maple trace <trace-id>` returns the full span tree with correlated logs; `maple diagnose <service>` includes recent traces and logs. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))

### Traces

- **Ingest:** Send OTLP/HTTP traces to `POST /v1/traces`; a successful ingest response is documented as `{ "accepted": <rowCount> }`. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **CLI search:** `maple traces` supports span-name, error, duration, HTTP-method, service, environment, time-window, limit, and offset filters. `maple trace` shows a full span tree; `maple slow-traces` finds slow traces with duration statistics. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Derived analysis:** `maple services` exposes throughput, error rate, and P95 latency; `maple service-map` exposes dependency edges with call counts, errors, and latency; `maple timeseries` emits bucketed trace count, latency quantiles, error rate, and apdex. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))

### Metrics

- **Ingest:** Send OTLP/HTTP metrics to `POST /v1/metrics`; protobuf, JSON, and optional gzip are supported. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Discovery:** `maple metrics` lists available metrics. `maple attributes keys --source metrics` discovers metric attribute keys. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Escape hatch:** Local mode exposes raw ClickHouse SQL through `maple query "<sql>"`, so metric queries not covered by typed commands can be implemented against the local store. This command is intentionally local-only. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/), [local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md))

## CLI and HTTP/API access

- **OTLP endpoints:** `POST /v1/traces`, `POST /v1/logs`, and `POST /v1/metrics` share the server port (`4318`) and accept protobuf or JSON, optionally gzip-encoded. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Query API:** `POST /local/query` accepts `{ "sql": "..." }` and returns a bare JSON array of rows. The server controls the ClickHouse output format and rewrites the final format to `JSONEachRow`; clients should send compiled SQL verbatim. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md), [CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **CLI output:** Query commands emit JSON by default, support `--format table`, and support `--debug` to print compiled SQL and per-query timing to stderr while keeping stdout as JSON. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Dashboard:** `maple start` normally points to the hosted `local.maple.dev` UI, while `maple start --offline` serves the UI bundled in the binary. Offline mode is same-origin and works without internet. ([Maple Local](https://maple.dev/docs/local-mode/), [local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md))
- **Remote access:** `--host` or `MAPLE_LOCAL_BIND_HOST` can bind beyond loopback; `--advertise-host` or `MAPLE_LOCAL_ADVERTISE_HOST` controls the client-facing URL printed by startup. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))

## Startup detection and routing

- **Resolution order:** For each command, explicit `--local`/`--remote` wins; then the pinned `defaultMode` from `maple use local|remote` / `~/.maple/config.json`; then auto-detection. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Auto-detection:** A configured remote token implies remote. Without one, the CLI probes `GET <local-url>/health`; a healthy local server resolves local. If neither is available, it prints an actionable error. `/health` returns `OK` and is the documented liveness probe. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Inspection and overrides:** `maple whoami` shows the resolved mode and target. `MAPLE_LOCAL_URL` overrides the derived local URL and is required when a later CLI process must reach a server started with a one-off host or non-default port that it cannot infer. ([CLI reference](https://maple.dev/docs/local-mode/cli-reference/), [local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md))

## Limitations and operational hazards

- **No application auth:** Binding outside loopback exposes OTLP ingest, `/local/query` raw SQL, `/health`, and the UI without application authentication. Non-browser clients on the network need no credentials. Use loopback, a trusted network, or a TLS/authentication proxy. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md), [CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Hosted UI is loopback-oriented:** The default `local.maple.dev` page is a public origin that calls the browser machine's loopback server and may trigger Chrome's Private Network Access prompt; it is not suitable for a remote local-mode server. Use `--offline` for same-origin access, especially behind a LAN hostname or reverse proxy. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md), [CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Single-process store access:** chDB permits one connection per process and is not safe for concurrent calls, so the long-lived server serializes store access and query CLIs depend on that server. Do not design independent clients to open the same store directly. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md))
- **Store compatibility:** Startup refuses a store whose chDB/schema identity is incompatible. Recovery requires an explicit migration or reset; `maple start --reset` / `maple reset --yes` can discard live telemetry, while checkpoint state is a separate preserved mechanism in the CLI reference. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md), [CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Dirty shutdown behavior needs version verification:** The design document says a stale clean-shutdown sentinel causes startup to auto-wipe the store and that telemetry is not recoverable after an unclean chDB kill. The current CLI reference documents a default `--on-dirty-store fail` policy, with explicit `wipe` or `restore-checkpoint` choices. Treat the installed binary's `maple start --help` and version as authoritative before relying on recovery behavior. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md), [CLI reference](https://maple.dev/docs/local-mode/cli-reference/))
- **Local-only query surface:** Raw SQL and several richer analyses are local-only because the equivalent remote multi-tenant API would not safely expose them. A consumer that must work in both modes should not assume `maple query` or every local analysis command has a remote equivalent. ([local-mode design](https://github.com/MapleTechLabs/maple/blob/main/docs/local-mode.md), [CLI reference](https://maple.dev/docs/local-mode/cli-reference/))

## Implementation takeaway

Point standard OpenTelemetry exporters at `http://127.0.0.1:4318`, use the typed CLI for common log/trace/service analysis, and use `POST /local/query` or `maple query` for local-only SQL needs. Build startup checks around `/health` and `maple whoami`; require an explicit `MAPLE_LOCAL_URL` when the server uses a custom port or host. Keep the listener on loopback unless external access is intentional and protected, and verify dirty-store semantics against the installed CLI version before treating local storage as durable.
