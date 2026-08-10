import assert from "node:assert/strict";
import { findNextByTag, normalizeDemo } from "../assets/workbench.js";

const steps = [
  { tags: ["overview"] },
  { tags: ["focus"] },
  { tags: ["path"] },
];
assert.equal(findNextByTag(steps, 0, "path"), 2);
assert.equal(findNextByTag(steps, 2, "overview"), 0);

assert.throws(() => normalizeDemo({ arm: "M3-0", passed: true, steps }));
assert.throws(() => normalizeDemo({ arm: "M3", passed: false, steps }));
normalizeDemo({ arm: "M3", passed: true, steps });
console.log("ok");
