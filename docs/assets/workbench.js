export function findNextByTag(steps, current, tag) {
  const n = steps.length;
  if (!n) return 0;
  for (let i = current; i < n; i++) {
    if ((steps[i].tags || []).includes(tag)) return i;
  }
  for (let i = 0; i < current; i++) {
    if ((steps[i].tags || []).includes(tag)) return i;
  }
  return current;
}

/** Tool type only — never conflate with plane tags. */
export function primaryTool(step) {
  const tool = String(step?.tool || "");
  if (tool.includes("inspect")) return "inspect";
  if (tool.includes("trace") || tool.includes("path")) return "path";
  if (tool.includes("crop")) return "focus";
  const tags = step?.tags || [];
  if (tags.includes("inspect")) return "inspect";
  if (tags.includes("path")) return "path";
  if (tags.includes("focus")) return "focus";
  if (tags.includes("overview")) return "overview";
  if (tool.includes("render_topology") && tags.includes("overview")) return "overview";
  return null;
}

/** One plane per frame. underlay stays its own plane (not folded into physical). */
export function primaryPlane(step) {
  if (step?.plane) return step.plane;
  const tags = step?.tags || [];
  for (const p of ["security", "logical", "underlay", "physical"]) {
    if (tags.includes(p)) return p;
  }
  return null;
}

export function indicesForPlane(steps, plane) {
  if (!plane || plane === "all") return steps.map((_, i) => i);
  return steps
    .map((s, i) => (primaryPlane(s) === plane ? i : -1))
    .filter((i) => i >= 0);
}

export function findNextInIndices(indices, currentGlobal, forward = true) {
  if (!indices.length) return currentGlobal;
  const pos = indices.indexOf(currentGlobal);
  if (pos < 0) return indices[0];
  if (forward) return indices[(pos + 1) % indices.length];
  return indices[(pos - 1 + indices.length) % indices.length];
}

export function findNextToolInPlane(steps, planeIndices, currentGlobal, toolTag) {
  if (!planeIndices.length) return currentGlobal;
  const startPos = planeIndices.indexOf(currentGlobal);
  const order =
    startPos >= 0
      ? planeIndices.slice(startPos).concat(planeIndices.slice(0, startPos))
      : planeIndices;
  for (const i of order) {
    if (primaryTool(steps[i]) === toolTag) return i;
  }
  return currentGlobal;
}

export function normalizeDemo(demo) {
  if (!demo || demo.arm !== "M3" || demo.passed !== true) {
    throw new Error("demo must be arm=M3 and passed=true");
  }
  if (!Array.isArray(demo.steps) || demo.steps.length === 0) {
    throw new Error("demo.steps empty");
  }
  return demo;
}
