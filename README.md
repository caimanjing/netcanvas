# NetCanvas

Project page (and later code) for **NetCanvas: Interactive Visual Working Memory for LLM-Based IP Network Fault Localization**.

Site URL:

```text
https://caimanjing.github.io/netcanvas/
```

## Layout

```text
netcanvas/
├── README.md
├── LICENSE                 # dual-license note (site vs future code)
├── docs/                   # GitHub Pages source (Settings → /docs)
│   ├── .nojekyll
│   ├── LICENSE             # CC BY-NC-SA 4.0 for page/paper materials
│   ├── index.html
│   ├── paper/NetCanvas.pdf
│   ├── assets/             # theme, workbench, demo frames
│   └── figures/
├── scripts/                # demo export + tests (dev tooling)
└── superpowers/            # design notes (not published by Pages)
```

Root is reserved for future runnable code. The public site lives only in `docs/`.

## Local preview

```powershell
cd "d:\work\memory攻关\netcanvas-site"
python -m http.server 8080 --directory docs
```

Open <http://localhost:8080>.

## Regen workbench demo (M3 + pass only)

```powershell
cd "d:\work\memory攻关\netcanvas-site"
python scripts/test_export_demo_trajectory.py
python scripts/export_demo_trajectory.py `
  --run "D:\work\memory攻关\code\demo\memory-experiment\runs\<M3_PASS_RUN_ID>" `
  --out "docs/assets/demo" `
  --max-steps 20
node scripts/test_workbench_logic.mjs
```

Scripts reject `M3-0` and failed trajectories. Current assets: `docs/assets/demo/SOURCE.txt`.

## GitHub Pages (project subpath)

1. Push this repo to `https://github.com/caimanjing/netcanvas`
2. **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: **`/docs`**  ← not `/ (root)`
3. Wait 1–2 minutes, then open `https://caimanjing.github.io/netcanvas/`

## Before public launch

- Paper PDF is at `docs/paper/NetCanvas.pdf` (named version; do not upload `NetCanvas-anon.pdf` to a public page)
- Fill arXiv / Code links in `docs/index.html` when ready
- Confirm BibTeX date
- During double-blind review, keep the repo private or strip author identity if required

## License

- **Project page & paper materials (`docs/`)** → [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (`docs/LICENSE`)
- **Future source code** → separate software license; see root `LICENSE`
