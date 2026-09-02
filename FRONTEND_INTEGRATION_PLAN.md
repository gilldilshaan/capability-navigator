# PARALLAX — Frontend API Integration Plan

> Owner: Frontend development & final integration
> Status: implemented (see “Implementation status” at the bottom)
> Rule: **preserve the existing Lovable design** — no redesign, no visual rewrites.
> This document is the contract between the PARALLAX frontend and the four backend modules
> (Bani — backend/DB, Suvreen — capability graph, Diya — recovery/simulation, Riya — agent orchestrator).

---

## 1. Existing frontend architecture (as found)

| Layer | Technology | Notes |
|---|---|---|
| Framework | TanStack Start (SSR) + React 19 + TypeScript | Lovable-generated, Vite 8 via `@lovable.dev/vite-tanstack-config` |
| Routing | TanStack Router, file-based routes in `src/routes/` | `index`, `disruptions`, `capability-map`, `resources`, `recovery-paths`, `break-my-supply-chain`, `workforce`, `audit`, `integration` |
| State | One React Context store: `src/lib/parallax/store.tsx` (`ParallaxProvider` / `useParallax`) | Every page reads state/actions from this store |
| Data | **100% hardcoded** in `src/lib/parallax/data.ts` | No network calls anywhere; `fetch` is never used |
| Styling | Tailwind 4 + custom primitives in `src/components/parallax/primitives.tsx` | `Panel`, `StatusPill`, `Meter`, `DataRow`, `KpiCard`, `DemoTag`, `EmptyState` |
| Query lib | `@tanstack/react-query` is installed and the provider is mounted in `__root.tsx` but **unused** | Available if we later want query caching |
| Timers | The store deliberately uses **no fake timers** — “one click = one deterministic pass” | We keep this philosophy: real API responses drive progress; mock fallback completes instantly |

### Key architectural fact

Everything on screen is derived from the central store, and the store is populated
synchronously from `data.ts` constants. Therefore the **only** place that must learn about
async APIs is the store (+ small per-route tweaks). Components keep their exact markup.

### Where each screen gets its data today

| Route / component | Data source today |
|---|---|
| `routes/index.tsx` | store KPIs + `activeDisruption`, `resilienceTrend` (hardcoded imports) |
| `routes/disruptions.tsx` | store (`analysis`, flags) + `activeDisruption`, `thermoShieldDecomposition` (hardcoded imports) |
| `routes/capability-map.tsx` | `capabilities`, `thermoShieldDecomposition` (hardcoded) + `NetworkGraph` |
| `routes/resources.tsx` | `suppliers`, `factories`, `machines`, `inventory`, `logisticsRoutes`, `workforce` (hardcoded) |
| `routes/recovery-paths.tsx` | store `paths` (= `data.recoveryPaths` constant), `scorePath` |
| `routes/break-my-supply-chain.tsx` | store (`chaosToggles`, `chaosResult`) + `failureToggles`, `hiddenDependencies` (hardcoded) |
| `routes/audit.tsx` | store (`audit`, `activity`, `recoveryStatus`, approve/reject actions) |
| `components/parallax/AgentActivity.tsx` | store (`agents`, `activity`, `analysis`) |
| `components/parallax/AppShell.tsx` | store (demo controls) + `user` |

## 2. Mock data locations (kept as fallback — not deleted)

All in `src/lib/parallax/data.ts`:

- Reference/master data: `suppliers`, `factories`, `machines`, `inventory`, `workforce`, `logisticsRoutes`, `capabilities`, `graphNodes`, `graphEdges`, `resilienceTrend`, `user`
- Scenario data: `activeDisruption`, `recoveryPaths`, `agentDefs`, `thermoShieldDecomposition`, `failureToggles`, `hiddenDependencies`, `sapLayers`

Derived fake results currently computed in `src/lib/parallax/store.tsx`:
`runAnalysis()` (instantly marks all agents complete, recommends Path C) and `runChaos()`
(subtracts hardcoded `resilienceHit` values).

**Policy:** mock data stays exactly where it is. Services import it and wrap it as
“mock mode” responses. Nothing is removed until the corresponding backend endpoint exists.

## 3. Proposed API integration points (backend contract)

All URLs are configurable via env vars (see §6). `VITE_API_BASE_URL` is prepended to every path below.
Responses are plain JSON matching the types in `src/types/parallax.ts`.

### 3.1 Disruptions (Bani) — default path `/api/disruptions`

| Method | Path | Body | Returns | Used by |
|---|---|---|---|---|
| POST | `/inject` | `InjectDisruptionPayload` | `Disruption` | Flow A (inject disruption) |
| GET | `/active` | — | `Disruption[]` | app start / refresh |
| GET | `/:id` | — | `Disruption` | incident refresh |

### 3.2 Capability Graph Engine (Suvreen) — default path `/api/graph`

| Method | Path | Body | Returns | Used by |
|---|---|---|---|---|
| POST | `/analyze` | `{ disruptionId, capabilityId?, resourceId? }` | `GraphAnalysisResult` | Flow B (capability analysis) |
| GET | `/capabilities` | — | `Capability[]` | capability register, redundancy scores |
| GET | `/network` | — | `{ nodes: GraphNode[], edges: GraphEdge[] }` | `NetworkGraph` (later) |

`GraphAnalysisResult` contains: `affectedCapabilities`, `affectedResources`,
`hiddenDependencies`, `alternativeResources`, `redundancyScores`.

### 3.3 Recovery + Simulation Engine (Diya) — default paths `/api/recovery`, `/api/simulation`

| Method | Path | Body | Returns | Used by |
|---|---|---|---|---|
| POST | `/api/recovery/paths` | `{ disruptionId }` | `RecoveryResult` | Flow C (Path A/B/C + recommended) |
| POST | `/api/recovery/approvals` | `ApprovalDecision` | `ApprovalRequest` | Flow F (approve/reject/alternative) |
| GET | `/api/recovery/approvals/:id` | — | `ApprovalRequest` | status refresh |
| POST | `/api/simulation/run` | `{ failureIds: string[] }` | `SimulationResult` | Flow D (Break My Supply Chain) |
| GET | `/api/simulation/failure-toggles` | — | `FailureToggle[]` | Flow D options (later) |

`RecoveryResult.paths` = `RecoveryPath[]` with `recoveryDays`, `costLakh`, `risk`,
`capacityCoveragePct`, `factors[]`; `recommendedPathId` highlights the winner.
`SimulationResult` contains `resilienceBefore`, `resilienceAfter`, `removed`,
`affectedCapabilities`, `vulnerabilities`.

### 3.4 Agentic AI Orchestrator (Riya) — default path `/api/agents`

| Method | Path | Body | Returns | Used by |
|---|---|---|---|---|
| POST | `/workflows` | `{ disruptionId }` | `AgentWorkflow` | Flow E (start workflow) |
| GET | `/workflows/:id` | — | `AgentWorkflow` | Flow E (poll progress) |

`AgentWorkflow.steps` = `AgentStep[]` (status `QUEUED \| RUNNING \| COMPLETE \| FAILED`, per-agent message,
optional `reasoning`). `requiresHumanApproval`, `compliance` and `recommendation` ride on the workflow.

### 3.5 End-to-end pipeline (automatic after a single initial action)

The pipeline is no longer gated behind a manual "Run analysis" click. Once the app
hydrates master data and an active disruption is present, the full chain runs
automatically — the user performs one action (load / open the incident) and the
data flows end to end:

```
load app → master data hydrated (auto)
        ↓
graphService.analyzeGraph              → GraphAnalysisResult   (capability identified)
        ↓
agentService.startWorkflow + poll      → AgentWorkflow         (agent steps stream in)
        ↓
recoveryService.getRecoveryPaths       → RecoveryResult        (Path A/B/C + recommendation)
        ↓
recoveryStatus = "AWAITING APPROVAL"   → audit page decision (the only human-required step)
```

The store updates the UI **after each stage resolves** (progressive disclosure — no fake
timers) and advances automatically between stages. The user only interacts for a real
decision: approving/rejecting a recovery path, requesting an alternative, or choosing
chaos-failure toggles.

## 4. Data flow after integration

```
UI action (Run analysis / Run chaos / Approve)
   → store action (async)
      → service function (src/services/*)
         → api.request()  — fetch to VITE_API_BASE_URL
            ├─ success            → response typed from src/types/parallax.ts → store patch → UI
            ├─ network/API error  → mock fallback (same shapes, from data.ts) → store patch → UI
            │                       + SystemStatusBanner: “Backend API unreachable — showing demo data”
            └─ fallback disabled  → store error state → clean inline error, UI never crashes
```

`AnalysisState` gains `"error"`. Loading stages are exposed as `pipelineStage`
(`Idle → Processing disruption → Analyzing dependencies → Coordinating agents → Generating recovery paths → Evaluating scenarios → Awaiting approval → Completed`).

## 5. Files that will be changed

### New files

| File | Purpose |
|---|---|
| `src/types/parallax.ts` | All canonical types: `Resource`, `Supplier`, `Factory`, `Machine`, `Capability`, `Disruption`, `GraphAnalysisResult`, `RecoveryPath`, `RecoveryResult`, `SimulationResult`, `AgentStep`, `AgentWorkflow`, `ApprovalRequest` + existing UI types |
| `src/services/config.ts` | Env-var configuration (`VITE_API_BASE_URL`, mock flags, per-service URL overrides, timeout) |
| `src/services/api.ts` | `request<T>()` fetch wrapper: JSON, `AbortController` timeout, `ApiError`, `withFallback()` helper |
| `src/services/disruptionService.ts` | Flows A — inject/list/get disruptions |
| `src/services/graphService.ts` | Flow B — analyze graph, capabilities |
| `src/services/recoveryService.ts` | Flow C + F — recovery paths, approval submission |
| `src/services/simulationService.ts` | Flow D — chaos simulation (mock computation moves here from the store) |
| `src/services/agentService.ts` | Flow E — start workflow, poll workflow status |
| `src/services/index.ts` | Barrel re-export |
| `src/components/parallax/SystemStatusBanner.tsx` | Slim design-consistent banner for backend-unreachable / API errors |
| `.env.example` | Documents all env vars |
| `FRONTEND_INTEGRATION_PLAN.md` | This file |

### Modified files

| File | Change (minimal, no redesign) |
|---|---|
| `src/lib/parallax/data.ts` | Interface definitions replaced by re-exports from `src/types/parallax.ts`; **all mock data arrays unchanged** |
| `src/lib/parallax/store.tsx` | Actions become async and call services; new state: `incident`, `graphAnalysis`, `pipelineStage`, `dataSource`, `backendNotice`, `approving`, `analysis: "error"`, `decomposition`, `vulnerabilities`, `capabilityRegister`; mock fallback preserved; public API stays a superset |
| `src/components/parallax/AppShell.tsx` | Render `SystemStatusBanner` under the header |
| `src/components/parallax/AgentActivity.tsx` | Button/pill reflect `pipelineStage` while running (labels only) |
| `src/routes/index.tsx` | Read incident from store instead of direct `data` import |
| `src/routes/disruptions.tsx` | Decomposition from store (fallback = same mock); button shows stage / disabled while running |
| `src/routes/capability-map.tsx` | Register + decomposition from store (fallback = same mock) |
| `src/routes/resources.tsx` | Additive: “Simulate disruption on this resource” button inside the existing detail sheet (Flow A entry point) |
| `src/routes/recovery-paths.tsx` | Run-analysis button disabled/labelled while running |
| `src/routes/break-my-supply-chain.tsx` | Result fields renamed to `SimulationResult`; vulnerabilities from store with mock fallback |
| `src/routes/audit.tsx` | Approval buttons get busy/disabled state while the decision is submitted |
| `.gitignore` | Ignore `.env` (keep `.env.example` tracked) |

**Not changed:** all `components/ui/*` (shadcn), `styles.css`, route heads/meta, demo controls, presentation mode, `NetworkGraph`, `ChainFlow`, `RecoveryPathCard` internals, `workforce.tsx`, `integration.tsx`, `sapLayers`.

## 6. Environment variables

```bash
# Base URL of the PARALLAX backend (Bani). Leave unset for pure demo mode (mock only).
VITE_API_BASE_URL=http://localhost:8000

# Force mock responses even when a base URL is configured ("true"/"false").
VITE_API_MOCK_MODE=false

# When the backend is unreachable, fall back to mock data instead of erroring ("true"/"false").
VITE_API_FALLBACK_TO_MOCK=true

# Fetch timeout in milliseconds.
VITE_API_TIMEOUT_MS=15000

# Optional per-module overrides (paths are appended to VITE_API_BASE_URL):
VITE_API_DISRUPTIONS_URL=/api/disruptions
VITE_API_GRAPH_URL=/api/graph
VITE_API_RECOVERY_URL=/api/recovery
VITE_API_SIMULATION_URL=/api/simulation
VITE_API_AGENTS_URL=/api/agents
```

Runtime behaviour matrix:

| `VITE_API_BASE_URL` | `MOCK_MODE` | `FALLBACK` | Behaviour |
|---|---|---|---|
| unset | — | — | Demo mode: mock only, no banner (today's behaviour) |
| set | false | true | Live-first; on failure use mock + yellow banner |
| set | false | false | Live-only; on failure red banner, UI stays up |
| set | true | — | Mock only (e.g. backend teammates offline during a demo) |

## 7. Implementation status

Implemented as planned. Notes:

- Git is not initialized in this workspace copy (Lovable holds the history), so changes were
  delivered as files, not commits.
- The resources page sheet gained one additive button (design-system classes reused) to give
  Flow A a real “user selects a resource” entry point. Everything else is markup-neutral.
- `@tanstack/react-query` remains unused; the store stays the single data gateway. This keeps
  the diff small — adopting react-query later only touches service call sites.
