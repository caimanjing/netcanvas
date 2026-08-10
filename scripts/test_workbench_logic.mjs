import assert from "node:assert/strict";
import {
  findNextByTag,
  findNextToolInPlane,
  indicesForPlane,
  normalizeDemo,
  primaryPlane,
  primaryTool,
} from "../assets/workbench.js";

const steps = [
  { tool: "flush_and_render", tags: ["physical"], plane: "physical" },
  { tool: "inspect_visual_node", tags: ["inspect", "physical"], plane: "physical" },
  { tool: "crop_node", tags: ["focus", "logical"], plane: "logical" },
  { tool: "trace_route_path", tags: ["path", "underlay"], plane: "underlay" },
];

assert.equal(findNextByTag(steps, 0, "path"), 3);
assert.equal(primaryTool(steps[1]), "inspect");
assert.equal(primaryPlane(steps[1]), "physical");
// inspect+physical must NOT make plane look like a tool
assert.notEqual(primaryTool(steps[1]), "physical");

const phys = indicesForPlane(steps, "physical");
assert.deepEqual(phys, [0, 1]);
assert.equal(findNextToolInPlane(steps, phys, 0, "inspect"), 1);

assert.throws(() => normalizeDemo({ arm: "M3-0", passed: true, steps }));
assert.throws(() => normalizeDemo({ arm: "M3", passed: false, steps }));
normalizeDemo({ arm: "M3", passed: true, steps });
console.log("ok");
