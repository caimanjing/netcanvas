# NetCanvas project page (GitHub Pages · 子路径)

目标地址：

```text
https://caimanjing.github.io/netcanvas/
```

本目录是**静态项目页**，不是实验台。相对路径资源，部署在仓库根目录即可。

## 本地预览

在 `netcanvas-site` 目录执行：

```powershell
python -m http.server 8080
```

打开 <http://localhost:8080>。

子路径模拟（可选）：

```powershell
python -m http.server 8080
# 浏览器访问 http://localhost:8080/ 即可；上线后路径前缀为 /netcanvas/
```

## 发布到 GitHub Pages（项目子路径）

1. 在 GitHub 新建**空仓库**，仓库名必须是：`netcanvas`
2. 在本目录初始化并推送：

```powershell
cd "d:\work\memory攻关\netcanvas-site"
git init
git add .
git commit -m "Initial NetCanvas project page"
git branch -M main
git remote add origin https://github.com/caimanjing/netcanvas.git
git push -u origin main
```

3. 仓库页 → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` / `/ (root)`
4. 等待 1–2 分钟，访问：
   `https://caimanjing.github.io/netcanvas/`

## 上线前记得改

- `index.html` 顶部 Paper / arXiv / Code 链接（现在是 `#`）
- BibTeX 的 `month` / `day`（当前按站点创建日占位）
- 如需双盲，暂勿公开作者信息或延迟开站

## 目录

```text
netcanvas-site/
├── .nojekyll
├── index.html
├── assets/
│   ├── theme.css
│   └── site.js
└── figures/
    ├── teaser.png
    ├── architecture.png
    ├── workflow.png
    ├── results.png
    └── ablation.png
```
