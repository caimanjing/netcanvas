from __future__ import annotations

import re
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
