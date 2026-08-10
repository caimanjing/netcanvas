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
      setTimeout(() => {
        btn.textContent = "Copy";
      }, 1600);
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
