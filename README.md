# NetCanvas

Project page (and later code) for **NetCanvas: Interactive Visual Working Memory for LLM-Based IP Network Fault Localization**.

站点 / Site:

```text
https://caimanjing.github.io/netcanvas/
```

页面右上角 **EN / 中** 切换。浏览器语言为中文时默认中文，否则默认英文。

The page has an **EN / 中** toggle. Chinese browsers default to Chinese; otherwise English.

## Layout

```text
netcanvas/
├── README.md
├── LICENSE                 # dual-license note (site vs future code)
└── docs/                   # GitHub Pages source (Settings → /docs)
    ├── .nojekyll
    ├── LICENSE             # CC BY-NC-SA 4.0 for page/paper materials
    ├── index.html          # bilingual project page (EN / 中)
    ├── paper/NetCanvas.pdf
    ├── assets/             # theme, site JS, growth GIFs
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

## Before public launch

- Paper PDF is at `docs/paper/NetCanvas.pdf` (arXiv v2 named version; do not upload `NetCanvas-anon.pdf`)
- Fill the arXiv ID in `docs/index.html` and BibTeX when the preprint is announced
- Growth GIFs/MP4: `docs/assets/demo/growth/SOURCE.txt` (Q15 GIF from v9 article; Q13 MP4 from v7.1)
- During double-blind review, keep the repo private or strip author identity if required

## License

- **Project page & paper materials (`docs/`)** → [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (`docs/LICENSE`)
- **Future source code** → separate software license; see root `LICENSE`
