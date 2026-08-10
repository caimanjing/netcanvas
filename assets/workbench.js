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

export function normalizeDemo(demo) {
  if (!demo || demo.arm !== "M3" || demo.passed !== true) {
    throw new Error("demo must be arm=M3 and passed=true");
  }
  if (!Array.isArray(demo.steps) || demo.steps.length === 0) {
    throw new Error("demo.steps empty");
  }
  return demo;
}
