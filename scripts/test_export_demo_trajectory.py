import unittest

from export_demo_trajectory import (
    assert_m3_passed,
    find_next_by_tag,
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

    def test_subsample_keeps_tool_diversity(self):
        steps = [
            {"tags": ["overview"], "image": "a"},
            {"tags": ["focus"], "image": "b"},
            {"tags": ["focus"], "image": "c"},
            {"tags": ["path"], "image": "d"},
            {"tags": ["inspect"], "image": "e"},
        ]
        out = subsample_keep_tags(steps, max_steps=4)
        flat = {t for s in out for t in s["tags"]}
        self.assertTrue(
            {"overview", "path", "inspect"} <= flat
            or {"overview", "focus", "path"} <= flat
        )
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


if __name__ == "__main__":
    unittest.main()
