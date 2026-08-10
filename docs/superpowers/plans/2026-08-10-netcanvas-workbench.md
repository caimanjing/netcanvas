# NetCanvas 工作台（A1）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `netcanvas-site` 首屏改成基于真实 **M3 + pass=True** 轨迹的可交互拓扑回放工作台，同时在正文讲清「入图闭环 + 交互工具链」双核心。

**Architecture:** 离线 Python 脚本从 `memory-experiment/runs/<id>` 导出有序 PNG + `steps.json` + `demo.gif`；静态页用 `site.js` 读 `steps.json` 做胶片/侧栏跳转/播放。不做在线 CLI。

**Tech Stack:** 静态 HTML/CSS/JS；Python 3 + Pillow（GIF）；素材来自现有 runs。

**Spec:** `docs/superpowers/specs/2026-08-10-netcanvas-workbench-design.md`

---

## 文件分工

| 路径 | 职责 |
|------|------|
| `scripts/export_demo_trajectory.py` | 断言 M3+pass；对齐帧；写 `assets/demo/` |
| `scripts/test_export_demo_trajectory.py` | 过滤/打标/找下一帧的单测 |
| `assets/demo/**` | 导出产物（frames、steps.json、demo.gif、SOURCE.txt） |
| `assets/workbench.js` | 纯逻辑：`findNextByTag`、解析 steps（可测） |
| `assets/site.js` | DOM：工作台绑定 + 原有 bibtex/toc |
| `assets/theme.css` | 工作台布局样式 |
| `index.html` | `#workbench` 标记 + method 双线文案 + TOC |
| `README.md` | 如何重新导出 demo |

默认导出来源：`../code/demo/memory-experiment/runs/c9e0a994206b`（q10，arm=M3，pass=True）。若导出时断言失败，改试 `97137ef4922a`，仍须 M3+pass。

---

### Task 1: 导出脚本的纯函数 + 单测

**Files:**
- Create: `scripts/export_demo_trajectory.py`
- Create: `scripts/test_export_demo_trajectory.py`

- [ ] **Step 1: 写失败单测（过滤与打标）**

```python
# scripts/test_export_demo_trajectory.py
import unittest
from export_demo_trajectory import (
    assert_m3_passed,
    tags_from_name,
    subsample_keep_tags,
    find_next_by_tag,
)

class TestExport(unittest.TestCase):
    def test_reject_m3_0(self):
        with self.assertRaises(SystemExit):
            assert_m3_passed({"arm": "M3-0", "pass": True})

    def test_accept_m3_pass_true(self):
        assert_m3_passed({"arm": "M3", "pass": True})

    def test_accept_passed_field(self):
        assert_m3_passed({"arm": "M3", "passed": True})

    def test_tags_from_filename(self):
        t = tags_from_name("q10_xxx_physical_path_A_to_B.png")
        self.assertIn("path", t)
        self.assertIn("physical", t)

    def test_subsample_keeps_tool_diversity(self):
        steps = [
            {"tags": ["overview"], "image": "a"},
            {"tags": ["focus"], "image": "b"},
            {"tags": ["focus"], "image": "c"},
            {"tags": ["path"], "image": "d"},
            {"tags": ["inspect"], "image": "e"},
        ]
        out = subsample_keep_tags(steps, max_steps=4)
        flat = {t for s in out for t in s["tags"]}
        self.assertTrue({"overview", "path", "inspect"} <= flat or {"overview", "focus", "path"} <= flat)
        self.assertLessEqual(len(out), 4)

    def test_find_next_by_tag(self):
        steps = [
            {"tags": ["overview"]},
            {"tags": ["focus"]},
            {"tags": ["path"]},
            {"tags": ["inspect"]},
        ]
        self.assertEqual(find_next_by_tag(steps, 0, "path"), 2)
        self.assertEqual(find_next_by_tag(steps, 2, "overview"), 0)  # wrap to global nearest

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: 跑测，确认失败（模块未实现）**

```powershell
cd "D:\work\memory攻关\netcanvas-site\scripts"
python test_export_demo_trajectory.py
```

Expected: `ModuleNotFoundError` 或 `ImportError`

- [ ] **Step 3: 实现最小纯函数**

在 `scripts/export_demo_trajectory.py` 先只放：

```python
from __future__ import annotations

import re
from pathlib import Path
from typing import Any


def is_truthy_pass(meta: dict[str, Any]) -> bool:
    for key in ("pass", "passed", "success"):
        if key in meta and meta[key] is not None:
            v = meta[key]
            if isinstance(v, bool):
                return v
            if str(v).strip().lower() in {"1", "true", "yes", "pass", "passed"}:
                return True
            if str(v).strip().lower() in {"0", "false", "no", "fail", "failed"}:
                return False
    return False


def assert_m3_passed(meta: dict[str, Any]) -> None:
    arm = str(meta.get("arm") or "").strip()
    if arm != "M3":
        raise SystemExit(f"refusing non-M3 arm={arm!r}")
    if not is_truthy_pass(meta):
        raise SystemExit(f"refusing non-pass run meta pass fields={ {k: meta.get(k) for k in ('pass','passed','success')} }")


TAG_RULES = [
    ("overview", re.compile(r"overview", re.I)),
    ("focus", re.compile(r"focus|crop", re.I)),
    ("path", re.compile(r"_path_|trace", re.I)),
    ("inspect", re.compile(r"inspect", re.I)),
    ("physical", re.compile(r"physical", re.I)),
    ("logical", re.compile(r"logical", re.I)),
    ("security", re.compile(r"security", re.I)),
    ("underlay", re.compile(r"underlay", re.I)),
]


def tags_from_name(name: str) -> list[str]:
    tags = [label for label, rx in TAG_RULES if rx.search(name)]
    # underlay counts as a plane sibling of physical for Plane button
    if "underlay" in tags and "physical" not in tags:
        tags.append("physical")
    return tags


def find_next_by_tag(steps: list[dict], current: int, tag: str) -> int:
    n = len(steps)
    if n == 0:
        return 0
    for i in range(current, n):
        if tag in (steps[i].get("tags") or []):
            return i
    for i in range(0, current):
        if tag in (steps[i].get("tags") or []):
            return i
    return current


def subsample_keep_tags(steps: list[dict], max_steps: int = 20) -> list[dict]:
    if len(steps) <= max_steps:
        return steps
    must = ["overview", "path", "inspect", "focus"]
    chosen: list[int] = []
    for tag in must:
        for i, s in enumerate(steps):
            if tag in (s.get("tags") or []) and i not in chosen:
                chosen.append(i)
                break
    # fill evenly
    if len(chosen) < max_steps:
        stride = max(1, len(steps) // max_steps)
        for i in range(0, len(steps), stride):
            if i not in chosen:
                chosen.append(i)
            if len(chosen) >= max_steps:
                break
    chosen = sorted(set(chosen))[:max_steps]
    return [steps[i] for i in chosen]
```

- [ ] **Step 4: 再跑测，应全部通过**

```powershell
cd "D:\work\memory攻关\netcanvas-site\scripts"
python test_export_demo_trajectory.py
```

Expected: `OK`

- [ ] **Step 5: Commit**

```powershell
cd "D:\work\memory攻关\netcanvas-site"
git add scripts/export_demo_trajectory.py scripts/test_export_demo_trajectory.py
git commit -m "Add demo trajectory export helpers and unit tests."
```

---

### Task 2: 完成导出 CLI 并生成 `assets/demo`

**Files:**
- Modify: `scripts/export_demo_trajectory.py`
- Create: `assets/demo/**`（运行产物）

- [ ] **Step 1: 扩展脚本：读 run、排帧、写文件、拼 GIF**

在同文件追加（核心逻辑如下，可按需微调路径解析）：

```python
import argparse
import json
import shutil
from datetime import datetime

def load_meta(run_dir: Path) -> dict:
    return json.loads((run_dir / "run_meta.json").read_text(encoding="utf-8"))


def collect_pngs(run_dir: Path) -> list[Path]:
    root = run_dir / "agent_workspace" / ".graph_topology_images"
    pngs = sorted(root.rglob("*.png"), key=lambda p: p.stat().st_mtime)
    if not pngs:
        raise SystemExit(f"no topology PNGs under {root}")
    return pngs


def infer_step(png: Path, run_id: str, qid: str) -> dict:
    name = png.name
    tags = tags_from_name(name)
    tool = "render_topology"
    if "inspect" in tags:
        tool = "inspect_visual_node"
    elif "path" in tags:
        tool = "trace_route_path"
    elif "focus" in tags:
        tool = "crop_node"
    elif "overview" in tags:
        tool = "render_topology"
    else:
        tool = "flush_and_render"
    phase = "render" if tool != "flush_and_render" else "ingest"
    manifest = png.with_suffix(".json")
    return {
        "image_src": png,
        "manifest_src": manifest if manifest.exists() else None,
        "phase": phase,
        "tool": tool,
        "tool_args": name.replace(".png", ""),
        "intent": f"Replay frame: {name}",
        "tags": tags,
        "hotspots": [],
    }


def build_gif(frame_paths: list[Path], out_gif: Path, duration_ms: int = 900) -> None:
    from PIL import Image
    imgs = [Image.open(p).convert("RGB") for p in frame_paths]
    if not imgs:
        raise SystemExit("no frames for gif")
    imgs[0].save(
        out_gif,
        save_all=True,
        append_images=imgs[1:],
        duration=duration_ms,
        loop=0,
        optimize=False,
    )


def export_run(run_dir: Path, out_dir: Path, max_steps: int = 20) -> None:
    meta = load_meta(run_dir)
    assert_m3_passed(meta)
    run_id = str(meta.get("run_id") or run_dir.name)
    pngs = collect_pngs(run_dir)
    # question id from first png prefix like q10_
    qid = "unknown"
    m = re.match(r"(q\d+)_", pngs[0].name, re.I)
    if m:
        qid = m.group(1).lower()

    raw_steps = [infer_step(p, run_id, qid) for p in pngs]
    steps = subsample_keep_tags(raw_steps, max_steps=max_steps)

    frames_dir = out_dir / "frames"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    frames_dir.mkdir(parents=True)

    written = []
    frame_files = []
    for i, s in enumerate(steps):
        stem = f"{i:03d}"
        dst = frames_dir / f"{stem}.png"
        shutil.copy2(s["image_src"], dst)
        frame_files.append(dst)
        manifest_rel = None
        if s["manifest_src"] is not None:
            mdst = frames_dir / f"{stem}.json"
            shutil.copy2(s["manifest_src"], mdst)
            manifest_rel = f"frames/{stem}.json"
        written.append({
            "id": i,
            "image": f"frames/{stem}.png",
            "manifest": manifest_rel,
            "phase": s["phase"],
            "tool": s["tool"],
            "tool_args": s["tool_args"],
            "intent": s["intent"],
            "tags": s["tags"],
            "hotspots": s["hotspots"],
        })

    payload = {
        "run_id": run_id,
        "question_id": qid,
        "arm": "M3",
        "passed": True,
        "caption": f"{qid} · M3 interactive visual replay",
        "steps": written,
    }
    (out_dir / "steps.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    build_gif(frame_files, out_dir / "demo.gif")
    (out_dir / "SOURCE.txt").write_text(
        "\n".join([
            f"run_id={run_id}",
            f"question_id={qid}",
            "arm=M3",
            "pass=true",
            f"exported_at={datetime.now().isoformat(timespec='seconds')}",
            f"source_dir={run_dir}",
            f"frames={len(written)}",
        ]) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--max-steps", type=int, default=20)
    args = ap.parse_args()
    export_run(args.run.resolve(), args.out.resolve(), max_steps=args.max_steps)
    print(f"exported -> {args.out}")


if __name__ == "__main__":
    main()
```

依赖：`pip install pillow`（若环境没有）。

- [ ] **Step 2: 对默认 run 执行导出**

```powershell
cd "D:\work\memory攻关\netcanvas-site"
pip install pillow
python scripts/export_demo_trajectory.py `
  --run "D:\work\memory攻关\code\demo\memory-experiment\runs\c9e0a994206b" `
  --out "assets/demo" `
  --max-steps 20
```

Expected: 打印 `exported -> ...`；存在 `assets/demo/steps.json`、`demo.gif`、`frames/000.png`；`SOURCE.txt` 含 `arm=M3` 与 `pass=true`。

若脚本因非 M3/非 pass 退出：改用 `97137ef4922a`（仍须通过断言）。

- [ ] **Step 3: 快速校验 steps 覆盖工具标签**

```powershell
python -c "import json; d=json.load(open(r'assets/demo/steps.json',encoding='utf-8')); tags={t for s in d['steps'] for t in s['tags']}; print(d['arm'], d['passed'], len(d['steps']), sorted(tags)); assert d['arm']=='M3' and d['passed'] is True"
```

Expected: 打印含 overview/focus 等；assert 通过。

- [ ] **Step 4: Commit**

```powershell
git add scripts/export_demo_trajectory.py assets/demo
git commit -m "Export M3 pass trajectory demo frames for workbench."
```

---

### Task 3: 可测的前端跳转逻辑

**Files:**
- Create: `assets/workbench.js`
- Create: `scripts/test_workbench_logic.mjs`（Node 跑）

- [ ] **Step 1: 写 `workbench.js`（浏览器与 Node 都能用）**

```javascript
// assets/workbench.js
export function findNextByTag(steps, current, tag) {
  const n = steps.length;
  if (!n) return 0;
  for (let i = current; i < n; i++) {
    if ((steps[i].tags || []).includes(tag)) return i;
  }
  for (let i = 0; i < current; i++) {
    if ((steps[i].tags || []).includes(tag)) return i;
  }
  return current;
}

export function normalizeDemo(demo) {
  if (!demo || demo.arm !== "M3" || demo.passed !== true) {
    throw new Error("demo must be arm=M3 and passed=true");
  }
  if (!Array.isArray(demo.steps) || demo.steps.length === 0) {
    throw new Error("demo.steps empty");
  }
  return demo;
}
```

- [ ] **Step 2: 写 Node 测试**

```javascript
// scripts/test_workbench_logic.mjs
import assert from "node:assert/strict";
import { findNextByTag, normalizeDemo } from "../assets/workbench.js";

const steps = [
  { tags: ["overview"] },
  { tags: ["focus"] },
  { tags: ["path"] },
];
assert.equal(findNextByTag(steps, 0, "path"), 2);
assert.equal(findNextByTag(steps, 2, "overview"), 0);

assert.throws(() => normalizeDemo({ arm: "M3-0", passed: true, steps }));
assert.throws(() => normalizeDemo({ arm: "M3", passed: false, steps }));
normalizeDemo({ arm: "M3", passed: true, steps });
console.log("ok");
```

- [ ] **Step 3: 跑测**

```powershell
cd "D:\work\memory攻关\netcanvas-site"
node scripts/test_workbench_logic.mjs
```

Expected: `ok`

- [ ] **Step 4: Commit**

```powershell
git add assets/workbench.js scripts/test_workbench_logic.mjs
git commit -m "Add workbench step navigation helpers with node checks."
```

---

### Task 4: `index.html` 插入工作台骨架 + TOC/正文

**Files:**
- Modify: `index.html`

- [ ] **Step 1: TOC 最前加 Workbench；main 顶部插入 `#workbench`**

在 `<aside class="toc">` 链接列表最前插入：

```html
<a href="#workbench">0. Workbench</a>
```

在 `<main>` 开头（`#problem` 之前）插入：

```html
<section id="workbench" class="workbench-section">
  <h2>Interactive Visual Working Memory</h2>
  <p class="lead">
    Replay of a recorded <strong>M3</strong> trajectory (pass).
    Left: probe-synchronized topology. Right: navigation tools the agent used
    (overview / focus / path / inspect). Bottom: ordered frames — same sequence as the GIF.
  </p>
  <p class="workbench-meta" data-workbench-meta></p>

  <div class="workbench" data-workbench>
    <div class="wb-main">
      <div class="wb-viewport">
        <img data-wb-image alt="Topology working memory frame" />
        <div class="wb-hotspots" data-wb-hotspots hidden></div>
      </div>
      <div class="wb-attr" data-wb-attr hidden></div>
    </div>
    <aside class="wb-side">
      <div class="wb-act">
        <p class="wb-label">Agent tool</p>
        <p class="wb-tool" data-wb-tool></p>
        <p class="wb-args" data-wb-args></p>
        <p class="wb-intent" data-wb-intent></p>
      </div>
      <div class="wb-rail" aria-label="Tool chain">
        <p class="wb-label">Tool chain</p>
        <button type="button" data-wb-tag="overview">Overview</button>
        <button type="button" data-wb-tag="focus">Focus</button>
        <button type="button" data-wb-tag="path">Path</button>
        <button type="button" data-wb-tag="inspect">Inspect</button>
        <button type="button" data-wb-tag="physical">Plane</button>
      </div>
    </aside>
    <div class="wb-timeline">
      <div class="wb-controls">
        <button type="button" data-wb-play>Play</button>
        <button type="button" data-wb-prev>Prev</button>
        <button type="button" data-wb-next>Next</button>
        <span data-wb-index></span>
        <a href="assets/demo/demo.gif" target="_blank" rel="noopener">Open GIF</a>
      </div>
      <div class="wb-film" data-wb-film></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: 缩短 `#problem` lead（保留 teaser figure）**；改 `#method` 为双线

`#method` 结构改为：

```html
<section id="method">
  <h2>NetCanvas</h2>
  <p>
    Two coupled pieces — not only the ingest loop.
    Use the workbench above to feel both.
  </p>
  <h3>1. Probe → Ingest → Render → Act</h3>
  <div class="loop" aria-label="Runtime loop">
    <span>Probe</span><span>Ingest</span><span>Render</span><span>Act</span>
  </div>
  <ul class="clean">
    <li><strong>Probe</strong> — CLI on devices / simulator.</li>
    <li><strong>Ingest</strong> — merge observations into growing graph state <em>G<sub>t</sub></em>.</li>
    <li><strong>Render</strong> — project domain-aligned topology image + Manifest handles as <em>W<sub>t</sub></em>.</li>
    <li><strong>Act</strong> — reason over visual working memory; choose next tool.</li>
  </ul>
  <h3>2. Multi-granularity interaction</h3>
  <p>
    The agent does not dump full <em>G<sub>t</sub></em> into context.
    It pulls slices via overview / local focus / path highlight / attribute inspect
    (and physical · logical · security planes) — the same controls mirrored in the workbench rail.
  </p>
  <!-- keep architecture/workflow figures below if desired -->
</section>
```

- [ ] **Step 3: 在 `</body>` 前引入模块**

把原来的：

```html
<script src="assets/site.js"></script>
```

改成：

```html
<script type="module" src="assets/site.js"></script>
```

- [ ] **Step 4: 本地打开检查标记存在**

```powershell
cd "D:\work\memory攻关\netcanvas-site"
python -m http.server 8080
```

浏览器打开 `http://localhost:8080/`，确认有 Workbench 区块（此时可能尚未驱动图片）。

- [ ] **Step 5: Commit**

```powershell
git add index.html
git commit -m "Add workbench markup and dual-core method copy."
```

---

### Task 5: 工作台 CSS

**Files:**
- Modify: `assets/theme.css`

- [ ] **Step 1: 追加工作台样式（接在文件末尾）**

```css
.workbench-section .lead { max-width: 46rem; }

.workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  grid-template-rows: auto auto;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 0.85rem;
}

.wb-main { grid-column: 1; grid-row: 1; }
.wb-side { grid-column: 2; grid-row: 1; display: flex; flex-direction: column; gap: 0.75rem; }
.wb-timeline { grid-column: 1 / -1; grid-row: 2; border-top: 1px solid var(--line); padding-top: 0.65rem; }

.wb-viewport {
  position: relative;
  background: #0b1c2c;
  border-radius: 0.55rem;
  overflow: hidden;
  min-height: 16rem;
}
.wb-viewport img { width: 100%; height: auto; display: block; }

.wb-label {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.wb-tool { margin: 0; font-family: var(--font-mono); font-size: 0.9rem; font-weight: 600; }
.wb-args, .wb-intent { margin: 0.35rem 0 0; font-size: 0.88rem; color: var(--muted); word-break: break-word; }

.wb-rail { display: flex; flex-direction: column; gap: 0.35rem; }
.wb-rail button, .wb-controls button {
  font: inherit;
  cursor: pointer;
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 0.45rem;
  padding: 0.4rem 0.55rem;
  text-align: left;
}
.wb-rail button:hover, .wb-controls button:hover { border-color: var(--accent); color: var(--accent); }
.wb-rail button.active { background: var(--accent-soft); border-color: var(--accent); color: #115e59; }

.wb-controls { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; margin-bottom: 0.5rem; }
.wb-film { display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.25rem; }
.wb-film button {
  flex: 0 0 auto;
  border: 2px solid transparent;
  padding: 0;
  background: none;
  cursor: pointer;
  border-radius: 0.35rem;
}
.wb-film button.active { border-color: var(--accent); }
.wb-film img { width: 4.5rem; height: 3rem; object-fit: cover; display: block; border-radius: 0.25rem; }

.workbench-meta { font-size: 0.88rem; color: var(--muted); }

@media (max-width: 920px) {
  .workbench { grid-template-columns: 1fr; }
  .wb-side { grid-column: 1; grid-row: 2; }
  .wb-timeline { grid-row: 3; }
}
```

- [ ] **Step 2: Commit**

```powershell
git add assets/theme.css
git commit -m "Style interactive visual workbench layout."
```

---

### Task 6: `site.js` 绑定工作台

**Files:**
- Modify: `assets/site.js`

- [ ] **Step 1: 改写为 ES module，保留 bibtex/toc，接入 workbench**

```javascript
import { findNextByTag, normalizeDemo } from "./workbench.js";

function initBibtex() {
  const btn = document.querySelector("[data-copy-bibtex]");
  const code = document.querySelector("#bibtex-code");
  if (!btn || !code) return;
  btn.addEventListener("click", async () => {
    const text = code.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    } catch {
      btn.textContent = "Select manually";
    }
  });
}

function initToc() {
  const links = [...document.querySelectorAll(".toc a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  const setActive = () => {
    const y = window.scrollY + 96;
    let current = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= y) current = section;
    }
    links.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current.id}`);
    });
  };
  setActive();
  window.addEventListener("scroll", setActive, { passive: true });
}

async function initWorkbench() {
  const root = document.querySelector("[data-workbench]");
  if (!root) return;

  const res = await fetch("assets/demo/steps.json");
  if (!res.ok) throw new Error("failed to load steps.json");
  const demo = normalizeDemo(await res.json());

  const img = root.querySelector("[data-wb-image]");
  const toolEl = root.querySelector("[data-wb-tool]");
  const argsEl = root.querySelector("[data-wb-args]");
  const intentEl = root.querySelector("[data-wb-intent]");
  const indexEl = root.querySelector("[data-wb-index]");
  const film = root.querySelector("[data-wb-film]");
  const meta = document.querySelector("[data-workbench-meta]");
  const railBtns = [...root.querySelectorAll("[data-wb-tag]")];

  let idx = 0;
  let timer = null;

  if (meta) {
    meta.textContent = `${demo.caption} · run ${demo.run_id} · ${demo.steps.length} frames`;
  }

  film.innerHTML = "";
  demo.steps.forEach((step, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.innerHTML = `<img src="assets/demo/${step.image}" alt="step ${i}" />`;
    b.addEventListener("click", () => show(i));
    film.appendChild(b);
  });
  const thumbs = [...film.querySelectorAll("button")];

  function show(i) {
    idx = i;
    const step = demo.steps[i];
    img.src = `assets/demo/${step.image}`;
    toolEl.textContent = step.tool;
    argsEl.textContent = step.tool_args || "";
    intentEl.textContent = step.intent || "";
    indexEl.textContent = `${i + 1} / ${demo.steps.length}`;
    thumbs.forEach((t, j) => t.classList.toggle("active", j === i));
    railBtns.forEach((b) => {
      const tag = b.getAttribute("data-wb-tag");
      b.classList.toggle("active", (step.tags || []).includes(tag));
    });
  }

  railBtns.forEach((b) => {
    b.addEventListener("click", () => {
      const tag = b.getAttribute("data-wb-tag");
      show(findNextByTag(demo.steps, idx, tag));
    });
  });

  root.querySelector("[data-wb-prev]")?.addEventListener("click", () => {
    show((idx - 1 + demo.steps.length) % demo.steps.length);
  });
  root.querySelector("[data-wb-next]")?.addEventListener("click", () => {
    show((idx + 1) % demo.steps.length);
  });

  const playBtn = root.querySelector("[data-wb-play]");
  playBtn?.addEventListener("click", () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      playBtn.textContent = "Play";
      return;
    }
    playBtn.textContent = "Pause";
    timer = setInterval(() => {
      show((idx + 1) % demo.steps.length);
    }, 900);
  });

  show(0);
}

document.addEventListener("DOMContentLoaded", () => {
  initBibtex();
  initToc();
  initWorkbench().catch((err) => {
    console.error(err);
    const meta = document.querySelector("[data-workbench-meta]");
    if (meta) meta.textContent = "Failed to load demo trajectory.";
  });
});
```

热区：首版可留空（`hotspots: []`）；Manifest 解析可后续加，不阻塞成功标准。

- [ ] **Step 2: 浏览器手测清单**

```powershell
cd "D:\work\memory攻关\netcanvas-site"
python -m http.server 8080
```

打开 `http://localhost:8080/`：

1. 主图加载 `frames/000.png`
2. 点 Path / Focus / Inspect 会换帧
3. 胶片可跳转；Play 会自动播
4. meta 行显示 run_id 与 M3

- [ ] **Step 3: Commit**

```powershell
git add assets/site.js
git commit -m "Wire workbench UI to exported M3 demo steps."
```

---

### Task 7: README + 收尾自检

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 在 README「目录」前增加 Demo 再生说明**

```markdown
## 再生工作台 Demo（M3 + pass only）

```powershell
cd "D:\work\memory攻关\netcanvas-site"
python scripts/test_export_demo_trajectory.py
python scripts/export_demo_trajectory.py `
  --run "D:\work\memory攻关\code\demo\memory-experiment\runs\<M3_PASS_RUN_ID>" `
  --out "assets/demo" `
  --max-steps 20
node scripts/test_workbench_logic.mjs
```

脚本会拒绝 `M3-0` 与未通过轨迹。当前默认素材见 `assets/demo/SOURCE.txt`。
```

- [ ] **Step 2: Spec 对照自检**

| Spec 要求 | 对应 Task |
|-----------|-----------|
| 首屏工作台 | 4–6 |
| 入图 + 工具链双核心文案 | 4 |
| 仅 M3+pass | 1–2 |
| steps.json + GIF | 2 |
| 静态 Pages | 全程无后端 |
| 不做 SVG/真 CLI | 遵守非目标 |

- [ ] **Step 3: Commit**

```powershell
git add README.md
git commit -m "Document how to regenerate the M3 workbench demo."
```

---

## Spec 覆盖自检（计划作者）

- 工作台四区、侧栏按 tag 跳转、胶片/播放/GIF：Task 4–6  
- 选轨硬过滤 M3+pass：Task 1–2  
- 默认 `c9e0a994206b`、抽样保工具多样性：Task 2  
- method 双线：Task 4  
- 热区：首版可空，不挡主路径；若 Manifest 坐标可用可后续补  

无 TBD / 「类似 Task N」占位。

---

## 执行交接

Plan complete and saved to `docs/superpowers/plans/2026-08-10-netcanvas-workbench.md`.

两种执行方式：

1. **Subagent-Driven（推荐）** — 每任务新开子代理，任务间复查  
2. **Inline Execution** — 本会话按 executing-plans 连续做，设检查点  

选哪一种？
