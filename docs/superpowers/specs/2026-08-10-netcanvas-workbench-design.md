# NetCanvas 项目页：可交互视觉工作台（A1）

日期：2026-08-10  
状态：待用户审阅  
站点：`netcanvas-site` → `https://caimanjing.github.io/netcanvas/`  
参考体验：[VISTA](https://vista-research.github.io/)（工作台优先，而不是静态摘要页）  
论文：`code/demo/memory-experiment/docs/paper-en/arxiv/NetCanvas.tex`

## 问题

当前 `index.html` 像论文摘要 + 静图，没有把论文核心讲「活」：**Interactive Visual Working Memory**——随探测同步更新的拓扑图，以及 agent 用多粒度工具在上面导航。

## 目标

1. 第一屏是 **轨迹回放工作台**（方案 A / A1），不是大段文字 hero。
2. 同时呈现论文 **两条核心**：
   - **入图闭环：** Probe → Ingest → Render → Act（\(G_t\) / \(W_t\) 怎么长出来）
   - **交互工具链：** overview / focus / path / inspect / 平面切换（agent 怎么**用** \(W_t\)）
3. 演示素材必须来自真实 run：只允许 **`arm === "M3"` 且 `pass === true`**（不要 M3-0，不要失败轨）。
4. 保持 **静态** GitHub Pages（PNG + JSON + JS），不做在线 CLI / GraphStore。

## 非目标（本轮不做）

- 真探测、后端 GraphStore、在线重渲染
- SVG / 自绘玩具拓扑（A2）
- 多轨切换器、M3-0 演示、失败轨迹演示
- 完整抄 VISTA 视觉皮肤（以后可微调，不是硬性）
- 重写结果表或编造新指标

## 页面结构

```
header          标题 + Paper / arXiv / Code / Cite
#workbench      新增 — A1 回放工作台（首屏核心）
#problem        Topology amnesia（缩短；保留 teaser 图）
#method         双线：入图闭环 + 工具协议（指回工作台）
#results        现有 CTBench 数字 / 图
#ablations      现有消融要点 / 图
#cite           BibTeX
footer          CC BY-NC-SA
```

目录（TOC）最前面增加 Workbench。

## 工作台 UI（A1）

四块区域：

| 区域 | 作用 |
|------|------|
| 左侧主视口 | 当前步拓扑 PNG；可选 Manifest 热区 |
| 中间 | 工具名 + 参数 + 本步诊断意图 |
| 右侧 | 工具链快捷键：Overview / Focus / Path / Inspect / Plane |
| 底部 | Probe 时间线胶片；播放/暂停；预生成 `demo.gif` |

### 交互语义

- 点底条某帧 → 跳到该步；主图与中栏同步
- 点右侧工具 → 跳到 **当前步及之后最近** 的匹配帧（没有则全局最近），用 `tags` 匹配
- 点热区（有才启用）→ 高亮 + 属性条（来自 Manifest / 步元数据）
- 自动播放按 `steps[]` 顺序；GIF 与步骤顺序一致，给不点的人看

纯回放：按钮不声称在跑 CLI；文案写明「录制的 M3 轨迹回放」。

## 选轨规则

硬条件：

1. `run_meta.arm === "M3"`（排除 `M3-0` 等）
2. `pass === true`（meta 里可能是 `passed` / `pass` / `success`，统一当成布尔 true）

软偏好：

- 优先 `memory-experiment/runs/` 里较新的
- 帧类型尽量覆盖：overview + focus +（path **或** inspect）；三者都有更好
- 页上约 12–25 步（长轨可抽样，但保留工具类型多样性）

**默认候选（2026-08-10 扫描）：** `c9e0a994206b`（2026-08-05，47 张 PNG，overview/focus/path/inspect 都有）。较短备选：`97137ef4922a`。最终以导出脚本打分后确认为准。

说明：2026-08-10 白天近跑多为 M3-0 或未过，**不进演示**。

## 资源目录

```text
netcanvas-site/assets/demo/
  frames/000.png … N.png
  frames/000.json …          # 可选：每帧 Manifest / 热区
  steps.json                 # 工作台唯一数据源
  demo.gif                   # 与 steps[] 同序
  SOURCE.txt                 # run_id、question_id、arm=M3、pass=true
```

## `steps.json` 约定

```json
{
  "run_id": "c9e0a994206b",
  "question_id": "qXX",
  "arm": "M3",
  "passed": true,
  "caption": "任务一句话",
  "steps": [
    {
      "id": 0,
      "image": "frames/000.png",
      "manifest": "frames/000.json",
      "phase": "probe|ingest|render|act",
      "tool": "flush_and_render|render_topology|crop_node|trace_route_path|inspect_visual_node|…",
      "tool_args": "可读参数",
      "intent": "一句 why",
      "tags": ["overview", "focus", "path", "inspect", "physical", "logical", "security"],
      "hotspots": [{ "id": "FW_01", "x": 0.42, "y": 0.31, "w": 0.08, "h": 0.06 }]
    }
  ]
}
```

- 右侧按钮对应 `tags`
- 中栏用 `tool` / `tool_args` / `intent`
- 时间线 / GIF 严格跟 `steps[]` 顺序
- 热区可选；没有 Manifest 就只切帧

## 导出流水线

小脚本（放在 `netcanvas-site/scripts/` 或实验仓）负责：

1. 读 `run_meta.json`；断言 `arm == M3` 且 pass=true，否则中止
2. 按 `*_trace.json` / 工具结果顺序对齐 `.graph_topology_images/**/*.png`
3. 写出编号帧 + `steps.json`（可选拷贝 Manifest）
4. 用同序 PNG 生成 `demo.gif`
5. 写 `SOURCE.txt`

上线站点仍是静态的；换轨迹时离线重跑导出即可。

## 正文怎么改

- `#problem` 缩短为 amnesia + teaser，不跟工作台抢视线
- `#method` 改成两小节：
  1. Probe → Ingest → Render → Act（后端长大 \(G_t\)，投影 \(W_t\)）
  2. 多粒度协议（对照论文工具表，与工作台按钮一一对应）
- 明确写：入图闭环不是全部故事——**对 \(W_t\) 的导航**同等重要

## 实现落点（留给后续计划）

| 文件 | 改动 |
|------|------|
| `index.html` | 插入 `#workbench`；改 TOC / method 文案 |
| `assets/theme.css` | 工作台布局（主区 + 侧栏 + 胶片） |
| `assets/site.js` | 读 `steps.json`、侧栏跳转、时间线、播放 |
| `assets/demo/*` | 导出的 M3+pass 轨迹 |
| `scripts/export_demo_trajectory.*` | 离线导出 |
| `README.md` | 如何重新生成 demo 素材 |

## 成功标准

- 一屏内能看懂：NetCanvas 把 **可交互拓扑图** 放进 agent 上下文
- 点 Path / Focus / Inspect 会换真实 **M3** 拓扑帧
- 胶片 / GIF 能看出拓扑在探测中 **生长并被重切视图**
- 演示素材绝无非 M3 或失败轨
- 仍可静态部署到 `/netcanvas/`

## 已拍板决策

| 决策 | 选择 |
|------|------|
| 首屏形态 | A — 类 VISTA 工作台 |
| 交互保真度 | A1 — 真实渲染帧轨迹回放 |
| 选轨过滤 | 仅 M3 + pass=True |
| 设计期 Visual Companion | 不使用 |
