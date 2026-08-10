import {
  findNextInIndices,
  findNextToolInPlane,
  indicesForPlane,
  normalizeDemo,
  primaryPlane,
  primaryTool,
} from "./workbench.js";

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
  const planeNowEl = root.querySelector("[data-wb-plane-now]");
  const indexEl = root.querySelector("[data-wb-index]");
  const film = root.querySelector("[data-wb-film]");
  const meta = document.querySelector("[data-workbench-meta]");
  const toolBtns = [...root.querySelectorAll("[data-wb-tool-btn]")];
  const planeBtns = [...root.querySelectorAll("[data-wb-plane]")];

  const availablePlanes = [
    ...new Set(demo.steps.map((s) => primaryPlane(s)).filter(Boolean)),
  ];
  const planeOrder = ["physical", "logical", "security", "underlay"].filter((p) =>
    availablePlanes.includes(p)
  );

  let plane = planeOrder[0] || "physical";
  let idx = indicesForPlane(demo.steps, plane)[0] ?? 0;
  let timer = null;

  const cacheQ = `v=${encodeURIComponent(demo.run_id)}-plane1`;

  function frameUrl(rel) {
    return `assets/demo/${rel}?${cacheQ}`;
  }

  function planeIndices() {
    return indicesForPlane(demo.steps, plane);
  }

  if (meta) {
    meta.textContent = `${demo.caption} · run ${demo.run_id} · planes: ${planeOrder.join(" · ")}`;
  }

  planeBtns.forEach((b) => {
    const p = b.getAttribute("data-wb-plane");
    b.hidden = !planeOrder.includes(p);
    b.disabled = !planeOrder.includes(p);
  });

  function rebuildFilm() {
    const indices = planeIndices();
    film.innerHTML = "";
    indices.forEach((globalIdx) => {
      const step = demo.steps[globalIdx];
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.globalIndex = String(globalIdx);
      b.innerHTML = `<img src="${frameUrl(step.image)}" alt="frame ${globalIdx}" />`;
      b.addEventListener("click", () => show(globalIdx));
      film.appendChild(b);
    });
  }

  function show(globalIdx) {
    idx = globalIdx;
    const step = demo.steps[globalIdx];
    const p = primaryPlane(step);
    if (p && p !== plane) {
      plane = p;
      rebuildFilm();
    }
    img.src = frameUrl(step.image);
    toolEl.textContent = step.tool;
    argsEl.textContent = step.tool_args || "";
    intentEl.textContent = step.intent || "";
    if (planeNowEl) planeNowEl.textContent = `Plane · ${primaryPlane(step) || "?"}`;

    const indices = planeIndices();
    const local = indices.indexOf(globalIdx);
    indexEl.textContent =
      local >= 0
        ? `${plane} ${local + 1}/${indices.length}`
        : `${globalIdx + 1}/${demo.steps.length}`;

    [...film.querySelectorAll("button")].forEach((t) => {
      t.classList.toggle("active", Number(t.dataset.globalIndex) === globalIdx);
    });

    const tool = primaryTool(step);
    toolBtns.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-wb-tool-btn") === tool);
    });
    planeBtns.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-wb-plane") === plane);
    });
  }

  function setPlane(nextPlane) {
    if (!planeOrder.includes(nextPlane)) return;
    plane = nextPlane;
    rebuildFilm();
    const indices = planeIndices();
    show(indices[0] ?? idx);
  }

  toolBtns.forEach((b) => {
    b.addEventListener("click", () => {
      const tag = b.getAttribute("data-wb-tool-btn");
      show(findNextToolInPlane(demo.steps, planeIndices(), idx, tag));
    });
  });

  planeBtns.forEach((b) => {
    b.addEventListener("click", () => {
      setPlane(b.getAttribute("data-wb-plane"));
    });
  });

  root.querySelector("[data-wb-prev]")?.addEventListener("click", () => {
    show(findNextInIndices(planeIndices(), idx, false));
  });
  root.querySelector("[data-wb-next]")?.addEventListener("click", () => {
    show(findNextInIndices(planeIndices(), idx, true));
  });

  const playBtn = root.querySelector("[data-wb-play]");
  playBtn?.addEventListener("click", () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      playBtn.textContent = "Autoplay plane";
      return;
    }
    playBtn.textContent = "Pause";
    timer = setInterval(() => {
      show(findNextInIndices(planeIndices(), idx, true));
    }, 900);
  });

  rebuildFilm();
  show(idx);
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
