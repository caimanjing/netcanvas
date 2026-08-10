from __future__ import annotations

import argparse
import json
import re
import shutil
from datetime import datetime
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
        raise SystemExit(
            "refusing non-pass run meta pass fields="
            f"{ {k: meta.get(k) for k in ('pass', 'passed', 'success')} }"
        )


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
    if len(chosen) < max_steps:
        stride = max(1, len(steps) // max_steps)
        for i in range(0, len(steps), stride):
            if i not in chosen:
                chosen.append(i)
            if len(chosen) >= max_steps:
                break
    chosen = sorted(set(chosen))[:max_steps]
    return [steps[i] for i in chosen]


def nodes_shown_from_manifest(manifest: Path | None) -> int | None:
    if manifest is None or not manifest.exists():
        return None
    try:
        data = json.loads(manifest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    n = data.get("nodes_shown")
    if isinstance(n, int):
        return n
    return None


def is_multi_node_frame(png: Path, min_nodes: int = 2) -> bool:
    """Drop sparse single-node renders — they look empty on the project page."""
    n = nodes_shown_from_manifest(png.with_suffix(".json"))
    if n is None:
        # No manifest: keep only if filename suggests a rich view.
        tags = tags_from_name(png.name)
        return bool({"overview", "path", "inspect", "focus"} & set(tags))
    return n >= min_nodes



def load_meta(run_dir: Path) -> dict:
    return json.loads((run_dir / "run_meta.json").read_text(encoding="utf-8"))


def collect_pngs(run_dir: Path) -> list[Path]:
    root = run_dir / "agent_workspace" / ".graph_topology_images"
    pngs = sorted(root.rglob("*.png"), key=lambda p: p.stat().st_mtime)
    if not pngs:
        raise SystemExit(f"no topology PNGs under {root}")
    return pngs


def infer_step(png: Path) -> dict:
    name = png.name
    tags = tags_from_name(name)
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
    # Normalize size to first frame to avoid GIF assemble errors
    base = imgs[0].size
    normed = [imgs[0]]
    for im in imgs[1:]:
        if im.size != base:
            im = im.resize(base, Image.Resampling.LANCZOS)
        normed.append(im)
    normed[0].save(
        out_gif,
        save_all=True,
        append_images=normed[1:],
        duration=duration_ms,
        loop=0,
        optimize=False,
    )


def export_run(
    run_dir: Path, out_dir: Path, max_steps: int = 20, min_nodes: int = 2
) -> None:
    meta = load_meta(run_dir)
    assert_m3_passed(meta)
    run_id = str(meta.get("run_id") or run_dir.name)
    pngs = [p for p in collect_pngs(run_dir) if is_multi_node_frame(p, min_nodes=min_nodes)]
    if not pngs:
        raise SystemExit(f"no multi-node topology PNGs (min_nodes={min_nodes})")
    qid = "unknown"
    m = re.match(r"(q\d+)_", pngs[0].name, re.I)
    if m:
        qid = m.group(1).lower()

    raw_steps = [infer_step(p) for p in pngs]
    steps = subsample_keep_tags(raw_steps, max_steps=max_steps)

    frames_dir = out_dir / "frames"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    frames_dir.mkdir(parents=True)

    written = []
    frame_files: list[Path] = []
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
        written.append(
            {
                "id": i,
                "image": f"frames/{stem}.png",
                "manifest": manifest_rel,
                "phase": s["phase"],
                "tool": s["tool"],
                "tool_args": s["tool_args"],
                "intent": s["intent"],
                "tags": s["tags"],
                "hotspots": s["hotspots"],
            }
        )

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
        "\n".join(
            [
                f"run_id={run_id}",
                f"question_id={qid}",
                "arm=M3",
                "pass=true",
                f"exported_at={datetime.now().isoformat(timespec='seconds')}",
                f"source_dir={run_dir}",
                f"frames={len(written)}",
            ]
        )
        + "\n",
        encoding="utf-8",
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--max-steps", type=int, default=20)
    ap.add_argument(
        "--min-nodes",
        type=int,
        default=2,
        help="Skip frames whose Manifest nodes_shown is below this (default: 2).",
    )
    args = ap.parse_args()
    export_run(
        args.run.resolve(),
        args.out.resolve(),
        max_steps=args.max_steps,
        min_nodes=args.min_nodes,
    )
    print(f"exported -> {args.out}")


if __name__ == "__main__":
    main()
