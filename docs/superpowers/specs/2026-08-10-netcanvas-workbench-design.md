# NetCanvas project page: Interactive Visual Workbench (A1)

Date: 2026-08-10  
Status: draft for user review  
Site: `netcanvas-site` → `https://caimanjing.github.io/netcanvas/`  
Reference UX: [VISTA](https://vista-research.github.io/) (workbench-first, not a static abstract page)  
Paper: `code/demo/memory-experiment/docs/paper-en/arxiv/NetCanvas.tex`

## Problem

The current `index.html` reads like a paper abstract with static figures. It does not make the paper’s core tangible: **Interactive Visual Working Memory**—probe-synchronized topology images that the agent navigates with a multi-granularity tool protocol.

## Goals

1. First viewport is a **trajectory-replay workbench** (option A / A1), not a text hero alone.
2. Surface **both** paper cores:
   - **Ingest loop:** Probe → Ingest → Render → Act (how \(G_t\) / \(W_t\) grow).
   - **Interaction tool chain:** overview / focus / path / inspect / plane switches (how the agent *uses* \(W_t\)).
3. Demo evidence comes from a real run: **`arm === "M3"` and `pass === true` only** (no M3-0, no failed runs).
4. Stay a **static** GitHub Pages site (PNG + JSON + JS). No live CLI / GraphStore.

## Non-goals (this round)

- Live probing, backend GraphStore, or online re-render.
- SVG / toy-graph self-drawing (A2).
- Multi-run picker, M3-0 demos, failed-trajectory demos.
- Full VISTA visual clone (grid theme optional polish later; not required).
- Rewriting results tables or inventing new metrics.

## Page architecture

```
header          title + Paper / arXiv / Code / Cite
#workbench      NEW — A1 replay workbench (first meaningful viewport)
#problem        Topology amnesia (shortened; keep teaser figure)
#method         Dual-core: ingest loop + tool protocol (link back to workbench)
#results        Existing CTBench numbers / figures
#ablations      Existing ablation bullets / figure
#cite           BibTeX
footer          CC BY-NC-SA
```

TOC gains a Workbench entry first.

## Workbench UI (A1)

Four regions:

| Region | Role |
|--------|------|
| Left main viewport | Current-step topology PNG; optional Manifest hotspots |
| Center | Tool name + args + short diagnostic intent from the step |
| Right | Tool-chain shortcuts: Overview / Focus / Path / Inspect / Plane |
| Bottom | Probe timeline filmstrip; play/pause; link or embed prebuilt `demo.gif` |

### Interaction semantics

- Click a filmstrip frame → jump to that step; sync image + center panel.
- Click a right-rail tool → jump to the **nearest matching step at or after the current index** (else nearest globally), matched via `tags`.
- Click a hotspot (only if present) → highlight + show attribute strip from Manifest / step metadata.
- Autoplay advances `steps[]` in order; GIF is the same ordered frames for non-interactive viewers.

Replay only: buttons never claim to run CLI; UI copy should say “replay of a recorded M3 trajectory.”

## Trajectory selection

Hard filters:

1. `run_meta.arm === "M3"` (exclude `M3-0` and other arms).
2. `pass === true` (field may be `passed` / `pass` / `success` in meta—normalize to boolean true).

Soft preferences:

- Recent under `memory-experiment/runs/`.
- Frame coverage: overview + focus + (path **or** inspect); prefer all three tool tags when possible.
- Prefer ~12–25 steps on the page (subsample a long run while keeping tool-type diversity).

**Default candidate (as of 2026-08-10 scan):** `c9e0a994206b` (2026-08-05, 47 PNGs, overview/focus/path/inspect all present). Compact alternate: `97137ef4922a`. Final pick confirmed when the export script scores coverage.

Note: 2026-08-10 daytime runs were mostly M3-0 or non-pass; they are **out of scope** for the demo.

## Asset layout

```text
netcanvas-site/assets/demo/
  frames/000.png … N.png
  frames/000.json …          # optional per-frame Manifest / hotspots
  steps.json                 # single source of truth for the workbench
  demo.gif                   # same order as steps[]
  SOURCE.txt                 # run_id, question_id, arm=M3, pass=true
```

## `steps.json` contract

```json
{
  "run_id": "c9e0a994206b",
  "question_id": "qXX",
  "arm": "M3",
  "passed": true,
  "caption": "short task one-liner",
  "steps": [
    {
      "id": 0,
      "image": "frames/000.png",
      "manifest": "frames/000.json",
      "phase": "probe|ingest|render|act",
      "tool": "flush_and_render|render_topology|crop_node|trace_route_path|inspect_visual_node|…",
      "tool_args": "human-readable args",
      "intent": "one-line why",
      "tags": ["overview", "focus", "path", "inspect", "physical", "logical", "security"],
      "hotspots": [{ "id": "FW_01", "x": 0.42, "y": 0.31, "w": 0.08, "h": 0.06 }]
    }
  ]
}
```

- Right-rail buttons map to `tags`.
- Center panel uses `tool`, `tool_args`, `intent`.
- Timeline / GIF follow `steps[]` order strictly.
- Hotspots optional; missing Manifest ⇒ frame switching only.

## Export pipeline

A small script (under `netcanvas-site/scripts/` or the experiment repo) will:

1. Load `run_meta.json`; assert `arm == M3` and pass true—abort otherwise.
2. Walk `*_trace.json` / tool results and align `.graph_topology_images/**/*.png` in diagnostic order.
3. Write numbered frames + `steps.json` (+ optional Manifest copies).
4. Build `demo.gif` from the same ordered PNGs.
5. Write `SOURCE.txt`.

The published site remains static; regenerating demo assets is a offline step when swapping trajectories.

## Copy / method section changes

- Shorten `#problem` to amnesia + teaser; do not compete with the workbench.
- Rewrite `#method` as two subsections:
  1. Probe → Ingest → Render → Act (backend grows \(G_t\), projects \(W_t\)).
  2. Multi-granularity protocol (table tools, mirrored by workbench buttons).
- Explicitly state that the loop alone is not the story—**navigation of \(W_t\)** is co-equal.

## Implementation sketch (for later plan)

| File | Change |
|------|--------|
| `index.html` | Insert `#workbench`; adjust TOC / method copy |
| `assets/theme.css` | Workbench layout (main + side + filmstrip) |
| `assets/site.js` | Load `steps.json`, rail jumps, timeline, play |
| `assets/demo/*` | Exported M3+pass trajectory |
| `scripts/export_demo_trajectory.*` | Offline exporter |
| `README.md` | How to regenerate demo assets |

## Success criteria

- Visitor understands within one scroll that NetCanvas keeps an **interactive topology image** in agent context.
- Clicking Path / Focus / Inspect visibly changes the topology view using **real M3** frames.
- Filmstrip / GIF show topology **growing and being re-sliced** over probes.
- No demo asset from non-M3 or failed runs.
- Site still deploys as static Pages under `/netcanvas/`.

## Open decisions (resolved)

| Decision | Choice |
|----------|--------|
| First-screen metaphor | A — VISTA-like workbench |
| Interactivity fidelity | A1 — trajectory replay of real renders |
| Run filter | M3 + pass=True only |
| Visual companion during design | Declined |
