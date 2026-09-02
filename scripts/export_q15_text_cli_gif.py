"""Render Q15 text-only Bash stream (run 1e14ab1402cc) as a looping GIF."""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
TRACE = Path(
    r"D:\work\memory攻关\code\demo\memory-experiment\runs\1e14ab1402cc\q15_trace.json"
)
OUT = ROOT / "docs" / "assets" / "demo" / "growth" / "q15_text_cli.gif"

DEVICE_RE = re.compile(
    r'device_name\\+":\\+"([^\\"]+)\\+",\\+"command\\+":\\+"([^\\"]+)'
)

W, H = 760, 430
ROW_H = 22
VISIBLE = 14
BG = (11, 28, 44)
INK = (237, 243, 248)
MUTED = (140, 160, 176)
TEAL = (94, 196, 184)
GOLD = (232, 196, 108)
RED = (232, 140, 140)
LINE_BG = (18, 42, 62)


def parse_calls(trace: dict) -> list[tuple[str, str]]:
    rows: list[tuple[str, str]] = []
    for step in trace.get("steps") or []:
        if step.get("type") != "tool_call" or step.get("tool") != "Bash":
            continue
        cmd = (step.get("input") or {}).get("command") or ""
        m = DEVICE_RE.search(cmd)
        if m:
            rows.append((m.group(1), m.group(2)))
        elif "get_devices_list" in cmd:
            rows.append(("—", "get_devices_list"))
        else:
            rows.append(("—", "shell"))
    return rows


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    windir = Path(r"C:\Windows\Fonts")
    names = (
        ["msyhbd.ttc", "msyh.ttc"] if bold else ["msyh.ttc", "consola.ttf", "arial.ttf"]
    )
    for name in names:
        path = windir / name
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size, index=0)
            except OSError:
                continue
    return ImageFont.load_default()


def line_color(dev: str, cmd: str, current: bool) -> tuple[int, int, int]:
    if current:
        return INK
    if "hrp" in cmd.lower():
        return GOLD
    if dev == "FW_02":
        return TEAL
    if dev == "FW_01":
        return (210, 188, 168)
    return MUTED


def render_frame(
    rows: list[tuple[str, str]],
    idx: int,
    body: ImageFont.ImageFont,
    head: ImageFont.ImageFont,
    small: ImageFont.ImageFont,
    hold: bool,
) -> Image.Image:
    im = Image.new("RGB", (W, H), BG)
    dr = ImageDraw.Draw(im)
    n = len(rows)
    title = "纯文本  ·  Q15  ·  151 条命令  ·  答错"
    dr.text((20, 14), title, font=head, fill=INK)
    dr.text((20, 42), f"{idx + 1:03d} / {n:03d}", font=small, fill=TEAL)

    start = max(0, idx + 1 - VISIBLE)
    end = idx + 1
    y = 68
    for i in range(start, end):
        dev, cmd = rows[i]
        current = i == idx
        if current:
            dr.rectangle((16, y - 2, W - 16, y + ROW_H - 4), fill=LINE_BG)
        text = f"{i + 1:03d}   {dev:<20s}  {cmd}"
        if len(text) > 72:
            text = text[:71] + "…"
        dr.text((22, y), text, font=body, fill=line_color(dev, cmd, current))
        y += ROW_H

    if hold:
        dr.rectangle((16, H - 78, W - 16, H - 16), fill=(42, 22, 28))
        dr.text((24, H - 70), "答：FW_01 安全策略未放行  +  出口网关 NAT 缺失", font=small, fill=RED)
        dr.text((24, H - 48), "标答：FW_02 未开全局热备（HRP）", font=small, fill=GOLD)
    return im


def main() -> None:
    trace = json.loads(TRACE.read_text(encoding="utf-8"))
    rows = parse_calls(trace)
    if len(rows) != 151:
        raise SystemExit(f"expected 151 Bash calls, got {len(rows)}")

    body = font(15)
    head = font(18, bold=True)
    small = font(14)
    frames = [render_frame(rows, i, body, head, small, hold=False) for i in range(len(rows))]
    hold = render_frame(rows, len(rows) - 1, body, head, small, hold=True)
    frames.extend([hold] * 18)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pal = [im.convert("P", palette=Image.Palette.ADAPTIVE, colors=48) for im in frames]
    durations = [70] * len(rows) + [120] * 18
    pal[0].save(
        OUT,
        save_all=True,
        append_images=pal[1:],
        duration=durations,
        loop=0,
        optimize=True,
        disposal=2,
    )
    print(f"wrote {OUT}  frames={len(pal)}  bytes={OUT.stat().st_size}")


if __name__ == "__main__":
    main()
