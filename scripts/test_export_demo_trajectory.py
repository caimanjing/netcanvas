import unittest

from export_demo_trajectory import (
    assert_m3_passed,
    find_next_by_tag,
    is_multi_node_frame,
    nodes_shown_from_manifest,
    subsample_chrono,
    subsample_keep_tags,
    tags_from_name,
)


class TestExport(unittest.TestCase):
    def test_reject_m3_0(self):
        with self.assertRaises(SystemExit):
            assert_m3_passed({"arm": "M3-0", "pass": True})

    def test_accept_m3_pass_true(self):
        assert_m3_passed({"arm": "M3", "pass": True})

    def test_accept_passed_field(self):
        assert_m3_passed({"arm": "M3", "passed": True})

    def test_tags_from_filename(self):
        t = tags_from_name("q10_xxx_physical_path_A_to_B.png")
        self.assertIn("path", t)
        self.assertIn("physical", t)

    def test_subsample_chrono_keeps_ends(self):
        steps = [{"i": i} for i in range(10)]
        out = subsample_chrono(steps, max_steps=4)
        self.assertEqual(out[0]["i"], 0)
        self.assertEqual(out[-1]["i"], 9)
        self.assertLessEqual(len(out), 4)

    def test_subsample_keeps_tool_diversity(self):
        steps = [
            {"tags": ["overview"], "plane": "physical", "image": "a"},
            {"tags": ["focus"], "plane": "physical", "image": "b"},
            {"tags": ["focus"], "plane": "logical", "image": "c"},
            {"tags": ["path"], "plane": "underlay", "image": "d"},
            {"tags": ["inspect"], "plane": "security", "image": "e"},
        ]
        out = subsample_keep_tags(steps, max_steps=4)
        planes = [s["plane"] for s in out]
        # chapter order: physical before logical before security before underlay
        self.assertEqual(planes, sorted(planes, key=["physical", "logical", "security", "underlay"].index))
        self.assertLessEqual(len(out), 4)

    def test_find_next_by_tag(self):
        steps = [
            {"tags": ["overview"]},
            {"tags": ["focus"]},
            {"tags": ["path"]},
            {"tags": ["inspect"]},
        ]
        self.assertEqual(find_next_by_tag(steps, 0, "path"), 2)
        self.assertEqual(find_next_by_tag(steps, 2, "overview"), 0)

    def test_nodes_shown_and_filter(self):
        import json
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            png = root / "a.png"
            man = root / "a.json"
            png.write_bytes(b"")
            man.write_text(json.dumps({"nodes_shown": 1, "edges_shown": 0}), encoding="utf-8")
            self.assertEqual(nodes_shown_from_manifest(man), 1)
            self.assertFalse(is_multi_node_frame(png, min_nodes=2))
            man.write_text(json.dumps({"nodes_shown": 6, "edges_shown": 5}), encoding="utf-8")
            self.assertTrue(is_multi_node_frame(png, min_nodes=2))


if __name__ == "__main__":
    unittest.main()
