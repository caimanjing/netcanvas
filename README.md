# NetCanvas

Project page (and later code) for **NetCanvas: Interactive Visual Working Memory for LLM-Based IP Network Fault Localization**.

站点 / Site:

```text
https://caimanjing.github.io/netcanvas/
```

站点首页为一篇中文长文解读（青稞 AI 投稿，v11 稿）。

The landing page is a Chinese long-form article (青稞 AI submission, v11 draft).

## Layout

```text
netcanvas/
├── README.md
├── LICENSE                 # dual-license note (site vs future code)
└── docs/                   # GitHub Pages source (Settings → /docs)
    ├── .nojekyll
    ├── LICENSE             # CC BY-NC-SA 4.0 for page/paper materials
    ├── index.html          # 中文长文解读（青稞 AI 投稿，v11 稿）
    ├── paper/NetCanvas.pdf
    ├── assets/             # theme, growth GIFs
    └── figures/
```

Root is reserved for future runnable code. The public site lives only in `docs/`.

## Local preview

```powershell
python -m http.server 8080 --directory docs
```

Open <http://localhost:8080>.

## GitHub Pages (project subpath)

1. Push this repo to `https://github.com/caimanjing/netcanvas`
2. **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: **`/docs`**  ← not `/ (root)`
3. Wait 1–2 minutes, then open `https://caimanjing.github.io/netcanvas/`

## Notes

- Paper PDF is at `docs/paper/NetCanvas.pdf` (arXiv v2 named version; do not upload `NetCanvas-anon.pdf`)
- Fill the arXiv ID in `docs/index.html` and BibTeX when the preprint is announced
- Growth GIFs/MP4: `docs/assets/demo/growth/SOURCE.txt` (Q15 GIF from v9 article; Q13 MP4 from v7.1)

## License

- **Project page & paper materials (`docs/`)** → [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (`docs/LICENSE`)
- **Future source code** → separate software license; see root `LICENSE`
