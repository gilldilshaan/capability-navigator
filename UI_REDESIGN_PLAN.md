# PARALLAX — UI Redesign Plan (Hackathon Finals Edition)

> Goal: elevate the working PARALLAX prototype into a premium, credible enterprise AI
> command center for the live SAP hackathon final demo — **without** rebuilding anything,
> breaking routes, touching backend contracts, or removing the API/mock integration.
> Companion document to FRONTEND_INTEGRATION_PLAN.md (services + contracts are frozen).

---

## 1. Audit — current UI weaknesses

| # | Weakness | Where |
|---|---|---|
| 1 | Every block is a same-weight bordered card → dashboard monotony, no narrative hierarchy | all routes |
| 2 | Motion is disabled by design (utilities are static stubs: `rise-in`, `edge-flow`, `pulse-ring`, `sweep`) → feels static despite hooks existing | `styles.css` |
| 3 | Agent orchestration is a flat list of rows — the product's key differentiator looks like a log | `AgentActivity.tsx` |
| 4 | Overview = 4 metric cards + 2 panels + 3 link cards; no hero, no command-center feel | `routes/index.tsx` |
| 5 | No AI-intelligence accent anywhere; "agentic" is only text | global |
| 6 | Sidebar is one flat nav list; no grouping, no system status footer | `AppShell.tsx` |
| 7 | Recovery path cards don't communicate *comparative* meaning (which is fastest? cheapest? why recommended?) | `RecoveryPathCard.tsx` |
| 8 | Traditional-vs-PARALLAX response comparison is two paragraphs of text | `routes/disruptions.tsx` |
| 9 | Capability decomposition is a grid of tiles, not a tree — misses "what was lost" story | `capability-map.tsx` |
| 10 | Integration page is a static list; doesn't show the new real service layer / live-vs-demo status | `routes/integration.tsx` |
| 11 | Typography: page titles confident but section hierarchy thin; many mono labels everywhere | global |

## 2. Design direction (preserve the identity)

Keep the existing **warm paper + deep teal** enterprise palette, mono technical labels, and
square-ish radii — it is already distinctive and un-crypto. Evolve, don't replace:

- **AI accent**: a restrained indigo (`--ai-accent`, oklch ~0.45 0.09 285) reserved strictly
  for agentic/AI elements: pipeline states, AI assessment, recommendation framing. Never for
  status (status stays success/warning/critical/info).
- **Hierarchy**: one hero per page (network / incident / paths), everything else steps down.
  Bigger page titles, clearer section intros, denser data rows.
- **Functional motion only**: activate the dormant utilities with subtle, short animations —
  edge dash-flow on active paths, pulse on running agents, rise-in on stage results,
  one controlled attention pulse on the critical incident. All gated by
  `prefers-reduced-motion`. No ambient loops on idle screens.
- **Demo-first**: Overview → Incident → Capability Map → Resources → Recovery Paths →
  Simulation → Audit must read as one guided story.

## 3. Route-by-route improvements

| Route | Change |
|---|---|
| `/` Overview | KPI row upgraded with mini-visuals (radial resilience gauge, redundancy meter, readiness ring, disruption pulse); hero grid = LIVE CAPABILITY NETWORK (existing NetworkGraph, now interactive-first) + ACTIVE INCIDENT command panel; new honest AI ASSESSMENT panel derived from store data; resilience trend demoted below; feature cards → compact next-steps strip |
| `/disruptions` | Incident command layout: facts panel; visual flow diagrams — traditional (linear, muted) vs PARALLAX (branching, ai-accent); embedded AgentOrchestrationPipeline; decomposition grid kept |
| `/capability-map` | New SVG decomposition tree (CAP-THS-017 → 7 sub-capabilities) with impact-path highlighting; register table + network graph kept |
| `/resources` | Detail sheet gains structured capability/risk blocks; rows unchanged (already strong) |
| `/recovery-paths` | Comparative badges per path (Recommended / Fastest / Lowest cost — derived from data, not invented); AI RECOMMENDATION block quoting the engine's rationale + compliance note; approval CTA emphasized |
| `/break-my-supply-chain` | Before → During → After framing: during-state shows pipeline stage + network dimming; result sections kept |
| `/workforce` | Minor: panel header hierarchy only (page already has coverage meters) |
| `/audit` | Decision trail gains channel tags (agent/system/human) and a human-decision emphasis block; agent log unchanged |
| `/integration` | Real architecture diagram: PARALLAX UI → service layer (5 services) → engines (graph/recovery/simulation/agents) → data + SAP mapping; connection status from `apiConfig` (Demo mode vs Live configured) — honest, no fake claims |

## 4. Component work

**New reusable components** (`src/components/parallax/`):

| Component | Purpose |
|---|---|
| `AgentOrchestrationPipeline.tsx` | Connected stage pipeline (numbered, vertical connectors) with QUEUED/RUNNING/COMPLETE/FAILED + human-approval terminus; used in the side console and the disruptions page |
| `ResilienceGauge.tsx` | Small SVG radial gauge for composite scores |
| `FlowDiagram.tsx` | Two micro-visualizations: linear muted chain vs branching capability-first chain |
| `CapabilityTree.tsx` | SVG tree of capability decomposition with impact highlighting |
| `PathBadge.tsx` (in-file) | Comparative badge on recovery cards |

**Modified components**: `primitives.tsx` (PageHeader hierarchy, KpiCard visual slot, Panel hover microinteraction, new `AiTag`), `AgentActivity.tsx` (console layout: pipeline → run control → log), `AppShell.tsx` (grouped sidebar, status footer, top bar), `RecoveryPathCard.tsx` (badges), `NetworkGraph.tsx` (active-edge animation only), `SystemStatusBanner.tsx` (unchanged).

**Files NOT touched**: everything in `src/services/*`, `src/types/parallax.ts`, `src/lib/parallax/data.ts` (data), `store.tsx` (only additive tweaks if a view truly needs it — none planned), all `components/ui/*`, router files.

## 5. Tokens & motion (styles.css)

- Add `--ai-accent`, `--ai-accent-foreground`, surface-elevated shadow token, focus-ring token.
- Typography: `text-page-title` utility (28px, tight tracking), larger PanelHeader titles.
- Activate dormant motion utilities with keyframes + `prefers-reduced-motion` guards:
  `rise-in` (staggered fade/slide), `edge-flow` (dash march on active edges), `pulse-ring`
  (single attention pulse on critical), `breath` (subtle 2s opacity loop for RUNNING agents),
  `sweep` reserved for simulation progress.
- Spacing stays on the existing 4-pt scale; grids get explicit `gap-4/6` rhythm.

## 6. Constraints honored

- No new dependencies (SVG + CSS + React only).
- No fake functionality: AI assessment text is derived from store/registration data and always
  labelled with the existing DemoTag; integration status reads `apiConfig.demoMode`.
- All existing actions keep their handlers (runAnalysis, approve/reject, chaos, demo steps).
- `npm run dev` now pinned to port 8000 so the preview browser URL is stable.

## 7. Verification

`npx tsc --noEmit`, `npm run build`, dev-server HTTP checks on every route, mock mode and
live-mode configuration untouched.
