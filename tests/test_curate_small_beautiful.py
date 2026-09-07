import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "font-ingest" / "curate_small_beautiful.py"
SPEC = importlib.util.spec_from_file_location("curate_small_beautiful", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class CurationTests(unittest.TestCase):
    def test_language_group_prefers_chinese(self):
        self.assertEqual(
            MODULE.language_group({"chinese-traditional", "latin"}), "Chinese"
        )

    def test_category_quotas_must_sum_to_total(self):
        with self.assertRaises(ValueError):
            MODULE.pick_balanced([], 2, 0, {"Sans Serif": 1})

    def test_chinese_core_is_selected_before_fill(self):
        records = [
            {
                "family": "Latin",
                "category": "Sans Serif",
                "language_group": "Other",
                "curation_score": 99,
                "official_popularity_rank": 1,
            },
            {
                "family": "Chinese",
                "category": "Sans Serif",
                "language_group": "Chinese",
                "curation_score": 20,
                "official_popularity_rank": 100,
            },
        ]
        picked, reasons = MODULE.pick_balanced(records, 2, 1, {"Sans Serif": 2})
        self.assertEqual({row["family"] for row in picked}, {"Latin", "Chinese"})
        self.assertEqual(reasons["Chinese"], "CHINESE_CORE")

    def test_specialty_filter_does_not_match_name_substrings(self):
        self.assertFalse(MODULE.is_specialty_font("Niconne", {"menu", "latin"}))
        self.assertFalse(
            MODULE.is_specialty_font("Playpen Sans", {"menu", "latin", "emoji"})
        )
        self.assertTrue(
            MODULE.is_specialty_font("Noto Color Emoji", {"menu", "emoji"})
        )


if __name__ == "__main__":
    unittest.main()
