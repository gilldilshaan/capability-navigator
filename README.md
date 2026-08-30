# Capability Navigator

You are a senior product designer, frontend engineer, AI product architect, and hackathon demo specialist.

Build a HIGH-FIDELITY, FULLY INTERACTIVE DEMO of a product called:

PARALLAX

"Same outcome. Different path."

PARALLAX is an Agentic AI platform for resilient supply chains.

IMPORTANT:

This is NOT a generic supply-chain dashboard.

This is NOT a supplier tracking app.

This is NOT an inventory management system.

This is NOT a normal AI chatbot.

The core innovation is:

"When a critical dependency fails, PARALLAX does not simply search for a replacement. It identifies the capability that was lost and discovers alternative combinations of resources that can reconstruct that capability."

The application should feel like a serious enterprise AI product that could be presented at an SAP/Hackfest competition.

The demo does not need a real production backend, real SAP credentials, or real external APIs. Use realistic mock data and deterministic simulation logic, but make the interactions feel real and coherent.

==================================================

1. PRODUCT POSITIONING

==================================================

Product name:

PARALLAX

Tagline:

Same outcome. Different path.

Product description:

AI-powered capability reconstruction for resilient supply chains.

Primary user:

Supply Chain Resilience Manager / Operations Manager.

Primary use case:

A pharmaceutical supply chain suffers a critical supplier disruption.

The user needs to answer:

1. What exactly was lost?

2. What capability does that dependency provide?

3. What resources do we already have?

4. Can we reconstruct the lost capability?

5. What are the possible recovery paths?

6. Which recovery path is fastest, safest, and most feasible?

7. What hidden dependencies would cause another failure?

==================================================

2. CORE DEMO STORY

==================================================

The entire application should tell this story:

A critical pharmaceutical supplier suddenly becomes unavailable.

Traditional response:

Supplier A fails

→ search for Supplier B

→ procurement

→ wait

→ production risk.

PARALLAX:

Supplier A fails

→ identify lost capability

→ decompose the capability

→ discover available resources

→ generate alternative configurations

→ simulate each configuration

→ evaluate cost/time/risk/compliance

→ recommend the best recovery path

→ human approval

→ recovery plan.

The demo should make this workflow visually obvious.

==================================================

3. MAIN APPLICATION STRUCTURE

==================================================

Create a polished enterprise dashboard with the following main navigation:

- Overview

- Disruptions

- Capability Map

- Recovery Paths

- Break My Supply Chain

- Workforce

- Audit & Decisions

Top navigation should contain:

PARALLAX logo/wordmark

Status:

"Network Status: Operational"

User:

"Aditi Sharma"

"Supply Chain Resilience Manager"

Use a professional enterprise design system.

Do NOT make it look like a generic SaaS template.

Do NOT use excessive gradients.

Do NOT use cartoonish illustrations.

Do NOT use generic AI robot graphics.

Do NOT use huge rounded cards everywhere.

Design should feel:

- sophisticated

- technical

- trustworthy

- enterprise

- data-rich

- premium

- restrained

- competition-ready

==================================================

4. VISUAL DESIGN

==================================================

Use a dark enterprise interface.

Primary background:

near-black / deep navy.

Use restrained colors for semantic meaning:

RED:

critical disruption / failure

AMBER:

warning / uncertainty

GREEN:

healthy / recovered / approved

BLUE:

system intelligence / information

WHITE:

primary text

Muted gray:

secondary text

Use subtle borders and glass-like surfaces only where appropriate.

Typography:

Use Inter or a similar highly readable modern enterprise font.

Use monospaced typography for:

- system IDs

- timestamps

- technical metrics

- event IDs

- capability IDs

Use Lucide icons or another professional icon library.

Avoid emoji inside the application.

Use subtle motion:

- status transitions

- graph node highlighting

- agent activity

- simulation progress

- recommendation appearing

- disruption propagation

Animations should be fast and professional.

==================================================

5. LANDING / OVERVIEW SCREEN

==================================================

Create an Overview page.

Top heading:

"Supply Chain Resilience Command Center"

Subheading:

"Understand what failed. Reconstruct what matters."

At the top show four KPI cards:

NETWORK RESILIENCE

87 / 100

ACTIVE DISRUPTIONS

01

CAPABILITY REDUNDANCY

3.8x

RECOVERY READINESS

92%

Use believable supporting text.

Example:

Network Resilience

+6.4% this month

Active Disruptions

1 critical

Capability Redundancy

2 capabilities exposed

Recovery Readiness

+8.2% after latest simulation

Below this show:

"ACTIVE INCIDENT"

Critical Supplier Disruption

Supplier:

MedCore Components Ltd.

Dependency:

Cold-chain packaging component

Status:

CRITICAL

Impact:

Production risk in 72 hours

Button:

"Open Incident"

Clicking it should open the main disruption workflow.

==================================================

6. DISRUPTION WORKFLOW

==================================================

This is the most important part of the demo.

When the user clicks "Open Incident", take them to a dedicated disruption command center.

Header:

"Critical Disruption"

Status:

CRITICAL

Incident:

INC-2048

Detected:

08:42 IST

Expected impact:

72 hours

Supplier:

MedCore Components Ltd.

Component:

ThermoShield Packaging Module

==================================================

7. STEP 1 — SENSING AGENT

==================================================

Create an Agent Activity panel.

Title:

"Agentic Response"

Show agents activating sequentially.

Agent 01:

SENSING AGENT

Status:

COMPLETE

Message:

"Supplier availability event detected."

Agent 02:

CAPABILITY ANALYSIS AGENT

Status:

RUNNING

Message:

"Determining downstream capabilities affected..."

Agent 03:

RESOURCE DISCOVERY AGENT

Status:

QUEUED

Agent 04:

RECONSTRUCTION AGENT

Status:

QUEUED

Agent 05:

SCENARIO AGENT

Status:

QUEUED

The user should be able to click:

"Run Analysis"

When clicked, animate the agents progressing.

Do NOT actually wait too long.

Simulation should complete in approximately 3–6 seconds.

After completion:

Show:

"Capability identified"

ThermoShield Packaging Capability

Capability ID:

CAP-THS-017

==================================================

8. CAPABILITY ANALYSIS

==================================================

Create a visual capability decomposition.

Title:

"What did we actually lose?"

Show a central node:

THERMOSHIELD PACKAGING CAPABILITY

Connected nodes:

Material

Temperature Resistance

Precision Forming

Quality Certification

Cold-Chain Handling

Packaging Workforce

Regional Logistics

Each node should have:

- status

- dependency count

- availability

For example:

Material

AVAILABLE

Precision Forming

AVAILABLE

Quality Certification

AVAILABLE

Packaging Workforce

PARTIAL

Cold-Chain Handling

AVAILABLE

Regional Logistics

AT RISK

The key insight should be visually clear:

"The supplier failed.

The capability did not necessarily fail."

Add a small explanation:

"PARALLAX decomposes supplier dependencies into the underlying capabilities required to achieve the outcome."

==================================================

9. RESOURCE DISCOVERY

==================================================

Create a Resource Discovery view.

Title:

"Available Resources"

Show categorized resources.

SUPPLIERS

MedCore Components

OFFLINE

BioPack Systems

AVAILABLE

NorthStar Materials

AVAILABLE

FACTORIES

Plant 02

72% available capacity

Plant 04

41% available capacity

MACHINES

CNC-17

IDLE

FORM-08

AVAILABLE

INVENTORY

ThermoShield Resin

1,840 units

Packaging Film

5,200 units

WORKFORCE

12 employees with transferable skills

LOGISTICS

Route DEL → CHD

AVAILABLE

Route BOM → CHD

AT RISK

Make these resources clickable.

Clicking a resource should open a detail drawer showing:

- resource ID

- current state

- capability contribution

- location

- capacity

- dependencies

- constraints

==================================================

10. CAPABILITY RECONSTRUCTION

==================================================

Now create the most important screen:

"Reconstruct Capability"

Show the system generating multiple possible configurations.

PATH A

Direct Supplier Replacement

Supplier:

BioPack Systems

Recovery:

14 days

Cost:

₹18.4L

Risk:

Medium

PATH B

Alternate Manufacturing

Plant 04

+

NorthStar Materials

+

Existing inventory

Recovery:

7 days

Cost:

₹9.2L

Risk:

Medium-Low

PATH C

Capability Reconstruction

Existing inventory

+

CNC-17

+

Plant 02

+

NorthStar Materials

+

Transferable workforce

+

Alternative logistics route

Recovery:

3.2 days

Cost:

₹3.4L

Risk:

LOW

PATH C should be visually recommended.

Label:

"PARALLAX RECOMMENDATION"

Reason:

"Highest recovery speed with lowest dependency concentration."

Do NOT claim these are real-world measured savings.

Clearly label them:

"Illustrative simulation"

==================================================

11. PATH EXPLANATION

==================================================

When the user clicks PATH C:

Open a detailed recovery plan.

Title:

"Capability Reconstruction Path"

Show a graph:

Inventory

    ↓

NorthStar Materials

    ↓

Plant 02

    ↓

CNC-17

    ↓

Transferable Workforce

    ↓

Alternative Logistics

    ↓

ThermoShield Packaging

    ↓

Pharma Production

Each connection should be animated.

Show a side panel:

RECOVERY SCORE

94 / 100

TIME TO RECOVERY

3.2 days

ESTIMATED COST

₹3.4L

CAPACITY COVERAGE

91%

DEPENDENCY RISK

LOW

COMPLIANCE STATUS

REQUIRES HUMAN VERIFICATION

==================================================

12. WORKFORCE INTELLIGENCE

==================================================

Create a Workforce section.

Important:

Do NOT make this a recruitment platform.

Workforce is treated as a supply-chain resilience resource.

Title:

"Transferable Capability"

Show:

Required Capability:

Precision Packaging Operation

Required skills:

Precision forming

Quality inspection

Machine operation

Then show candidate internal workers.

Worker:

EMP-1842

Skill compatibility:

87%

Machine operation:

92%

Quality inspection:

81%

Precision forming:

76%

Training gap:

9%

Estimated training:

12 hours

Recommendation:

"Deploy after targeted training."

Another worker:

EMP-2197

Compatibility:

79%

Do not expose personal sensitive information.

Use fictional IDs only.

Explain:

"PARALLAX models workforce by capability rather than job title."

==================================================

13. BREAK MY SUPPLY CHAIN

==================================================

This must be one of the strongest screens.

Create a dedicated feature:

# BREAK MY SUPPLY CHAIN

Subheading:

"Stress-test your network before reality does."

Create a simulation interface.

Show a network graph:

Suppliers

Factories

Machines

Routes

Workforce

Capabilities

Provide failure toggles:

[ ] Remove critical supplier

[ ] Disable factory

[ ] Disable machine

[ ] Block logistics route

[ ] Remove specialized workforce

[ ] Multiple simultaneous failures

Primary button:

"RUN CHAOS SIMULATION"

When clicked:

Animate the network.

Nodes disappear or become red.

Then calculate:

NETWORK RESILIENCE

Before:

87

After:

54

Then show:

"Critical vulnerability discovered"

Example:

5 suppliers appear independent.

But all 5 depend on:

"Precision Polymer Certification"

Therefore:

Supplier redundancy:

5x

Capability redundancy:

1x

Display huge warning:

"5 suppliers ≠ 5 independent recovery paths."

This should be the most memorable screen in the entire demo.

==================================================

14. SIMULATION RESULTS

==================================================

After the Break My Supply Chain simulation:

Show:

"3 Critical Dependencies Found"

1.

Precision Polymer Certification

2.

Cold-chain regional transport

3.

Specialized packaging workforce

For each show:

Impact

Recovery alternatives

Current redundancy

Recommended mitigation

Example:

Precision Polymer Certification

Current redundancy:

1

Target:

3

Recommended action:

Qualify secondary capability provider

Button:

"Add Resilience Plan"

==================================================

15. AUDIT / HUMAN APPROVAL

==================================================

Create an Audit & Decisions screen.

This is important because the system should not look like an uncontrolled autonomous AI.

Title:

"Decision & Audit Trail"

Show:

08:42

Disruption detected

08:43

Capability identified

08:44

Resources discovered

08:45

3 recovery paths generated

08:46

Scenario simulation completed

08:47

Path C recommended

08:48

Awaiting human approval

Buttons:

"APPROVE RECOVERY"

"REQUEST ALTERNATIVE"

"REJECT"

If user clicks APPROVE:

Show confirmation:

"Recovery plan approved."

Status changes:

RECOVERY:

APPROVED

Then display:

"Execution handoff ready."

==================================================

16. AI AGENT ACTIVITY

==================================================

Across the demo, create a collapsible "Agent Activity" panel.

Example live messages:

[SENSING]

Supplier disruption detected.

[CAPABILITY]

Mapping downstream dependency graph.

[RESOURCE]

Scanning 48 available enterprise resources.

[RECONSTRUCTION]

Generating alternative capability configurations.

[SCENARIO]

Evaluating 3 recovery paths.

[COMPLIANCE]

Checking certification and cold-chain constraints.

[HUMAN]

Awaiting manager approval.

Make this feel like actual agent orchestration.

Do not make it a fake chatbot.

==================================================

17. NETWORK / CAPABILITY GRAPH

==================================================

Create a beautiful interactive graph page.

Title:

"Capability Network"

Nodes:

Supplier

Material

Factory

Machine

Workforce

Route

Capability

Users can click nodes.

Clicking a node highlights:

- upstream dependencies

- downstream dependencies

- alternative paths

- risk level

Use lines with subtle animation.

Critical dependencies should become red when highlighted.

Healthy nodes:

blue/green.

==================================================

18. DATA MODEL

==================================================

Use realistic mock structured data.

Create objects for:

suppliers

factories

machines

inventory

workforceSkills

logisticsRoutes

capabilities

disruptions

recoveryPaths

agents

auditEvents

Each capability should reference dependencies.

Example:

capability:

{

 id: "CAP-THS-017",

 name: "ThermoShield Packaging",

 requirements: [

   "polymer-material",

   "precision-forming",

   "quality-certification",

   "packaging-workforce",

   "cold-chain-logistics"

 ]

}

Create enough data to make the UI feel like a real enterprise system.

At least:

10 suppliers

6 factories

12 machines

10 inventory items

15 workforce capability records

8 logistics routes

10 capabilities

Use fictional companies.

Do not use real company data.

==================================================

19. SIMULATION LOGIC

==================================================

The demo must actually work.

Do NOT make every button decorative.

Implement deterministic mock logic.

For example:

If supplier "MedCore Components" is disabled:

1. Mark supplier unavailable.

2. Identify affected capability.

3. Traverse dependency graph.

4. Identify resources that remain available.

5. Generate 3 recovery paths.

6. Score each path.

7. Recommend the highest-scoring path.

8. Update dashboard metrics.

9. Create audit events.

Recovery score should consider:

recovery time

cost

risk

capacity

dependency concentration

resource availability

Use a simple weighted scoring formula.

Example conceptual formula:

Recovery Score =

30% recovery speed

25% risk

20% cost

15% capacity

10% dependency resilience

Show the factors transparently.

==================================================

20. NO FAKE AI CLAIMS

==================================================

Do not claim:

"Powered by GPT" unless actually connected.

Do not claim:

"real-time SAP data"

unless connected.

Use labels such as:

"Simulation"

"Demo Environment"

"Illustrative enterprise data"

The purpose is to demonstrate the product concept.

==================================================

21. SAP-READY ARCHITECTURE

==================================================

Create a small "Integration" section showing how the eventual system could integrate with SAP.

Do not fake a live SAP integration.

Show:

SAP S/4HANA

↓

Enterprise operational data

SAP HANA Cloud

↓

Capability/dependency intelligence

SAP BTP

↓

Agent orchestration

SAP Generative AI Hub

↓

AI reasoning

SAP Build

↓

User interface

Label:

"Prototype integration architecture"

Do not imply these integrations are currently live.

==================================================

22. INTERACTION DETAILS

==================================================

The demo must be smooth enough to present live.

Important interactions:

1. Open active incident

2. Run agent analysis

3. Watch agents activate

4. View lost capability

5. Explore resource graph

6. Generate recovery paths

7. Compare recovery paths

8. Open recommended path

9. Run Break My Supply Chain

10. Approve recovery

11. View audit trail

12. Reset demo

Add a:

"RESET DEMO"

button in the top-right.

When clicked, restore the original scenario.

==================================================

23. DEMO MODE

==================================================

Create a special button:

"START DEMO"

When clicked, automatically guide the presenter through the main scenario.

Demo sequence:

1. Supplier failure

2. Agent detection

3. Capability identification

4. Resource discovery

5. Recovery paths

6. Recommendation

7. Human approval

8. Recovery

9. Break My Supply Chain

Each stage should take only a few seconds.

The presenter must be able to interrupt the sequence and explore manually.

==================================================

24. PRESENTATION MODE

==================================================

Add a "Presentation Mode" button.

When enabled:

- hide unnecessary navigation

- enlarge important metrics

- maximize graphs

- emphasize the active scenario

- show agent progress clearly

This should be optimized for a projector during a hackathon pitch.

==================================================

25. EMPTY / ERROR STATES

==================================================

Build professional states.

If no disruption:

"Network operating normally."

If a recovery path fails:

"Path rejected: insufficient capacity."

If a capability cannot be reconstructed:

"Capability cannot currently be reconstructed."

Then suggest:

"Increase redundancy"

"Qualify alternative resource"

"Develop workforce capability"

==================================================

26. TECH STACK

==================================================

Use:

React

TypeScript

Tailwind CSS

Lucide React

Recharts if useful

React Flow or another graph library if appropriate

Use component architecture.

Suggested components:

Dashboard

IncidentPanel

AgentActivity

CapabilityGraph

ResourceGraph

RecoveryPathCard

RecoveryPathDetail

WorkforceCapability

ChaosSimulator

SimulationResults

AuditTimeline

SAPIntegration

PresentationMode

Keep components modular.

==================================================

27. RESPONSIVENESS

==================================================

Desktop-first.

This is primarily a hackathon presentation dashboard.

Optimize for:

1440x900

1920x1080

Still make it reasonably responsive for smaller screens.

==================================================

28. QUALITY BAR

==================================================

This should NOT look like something generated in 10 minutes.

It should look like a real enterprise product prototype.

Priorities:

1. Excellent visual hierarchy

2. Extremely clear storytelling

3. Real interactions

4. Smooth animations

5. Strong data visualization

6. Consistent terminology

7. No broken buttons

8. No placeholder Lorem Ipsum

9. No generic stock images

10. No unnecessary pages

Every screen must answer:

"What does this tell the supply-chain manager?"

==================================================

29. CRITICAL PRODUCT LANGUAGE

==================================================

Use these exact concepts consistently:

"Capability"

"Capability Reconstruction"

"Recovery Path"

"Resource Network"

"Capability Redundancy"

"Hidden Dependency"

"Agentic Recovery"

"Human-in-the-loop"

"Break My Supply Chain"

"Same outcome. Different path."

Avoid repeatedly using:

"AI-powered dashboard"

"smart supply chain"

"next-generation platform"

"revolutionary AI"

"AI assistant"

The product should sound technically credible, not marketing-heavy.

==================================================

30. FINAL PRODUCT MESSAGE

==================================================

The entire application should reinforce this idea:

Traditional resilience:

"Do we have a backup supplier?"

PARALLAX resilience:

"How many different ways can we achieve the same outcome?"

Final screen:

PARALLAX

SAME OUTCOME.

DIFFERENT PATH.

"Don't replace the broken link.

Reconstruct the capability."

==================================================

31. IMPORTANT: BUILD THE ACTUAL DEMO

==================================================

Do not only create static screens.

Implement the state transitions.

The following flow MUST work:

START DEMO

→ Supplier failure

→ Agent analysis

→ Capability identified

→ Resources discovered

→ Recovery paths generated

→ Recommended path selected

→ Human approval

→ Recovery status updated

→ Break My Supply Chain

→ Vulnerability discovered

→ Reset

Use mock data and local state if necessary.

No authentication is required.

No real database is required.

No real SAP connection is required.

The goal is a polished, believable, interactive hackathon prototype.

Before finishing:

- test every button

- test the entire demo flow

- ensure no console errors

- ensure graphs render correctly

- ensure all navigation works

- ensure the Reset Demo button works

- ensure Presentation Mode works

- ensure the application looks excellent at 1920x1080

Build this as if it will be demonstrated live to a panel of SAP judges who have 5 minutes to understand why PARALLAX is different from a conventional supply-chain monitoring or supplier-risk product.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/50fa4328-cf49-4eda-91d1-1c3fda566290).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
