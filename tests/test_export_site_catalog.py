import csv
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
SCRIPT = ROOT / "scripts" / "font-ingest" / "export_site_catalog.py"
SPEC = importlib.util.spec_from_file_location("export_site_catalog", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class ExportSiteCatalogTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "data" / "font-catalog").mkdir(parents=True)
        (self.root / "src" / "data").mkdir(parents=True)
        schema = json.loads((ROOT / "src" / "data" / "font-publishing.schema.json").read_text())
        (self.root / "src" / "data" / "font-publishing.schema.json").write_text(json.dumps(schema))
        self.launch = {
            "curation_rank": "1",
            "family": "Example Sans",
            "slug": "examplesans",
            "category": "Sans Serif",
            "language_group": "Latin",
            "subsets": "latin;latin-ext",
            "official_popularity_rank": "10",
            "style_count": "9",
            "variable_axis_count": "1",
        }
        self.approved = {
            "family": "Example Sans",
            "slug": "examplesans",
            "source_path": "ofl/examplesans",
            "source_commit": "a" * 40,
            "license": "OFL-1.1",
            "license_sha256_verified": "True",
            "reserved_font_names": "Example Sans",
            "style_count": "2",
            "font_file_count": "2",
            "parsed_font_file_count": "2",
            "variable_font_count": "2",
            "axes": "wght",
            "glyph_count_max": "500",
            "unicode_codepoint_union": "450",
            "latin_coverage": "1.0",
            "zh_cn_coverage": "0.0",
            "zh_tw_coverage": "0.0",
            "japanese_coverage": "0.0",
            "korean_coverage": "0.0",
            "cjk_unified_coverage": "0.0",
            "packaging_status": "STANDARD",
            "preview_status": "SKIPPED_LICENSE_REVIEW",
            "final_status": "APPROVED",
        }

    def tearDown(self):
        self.temp.cleanup()

    def write_rows(self, name, rows):
        path = self.root / "data" / "font-catalog" / name
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)

    def build(self, approved=None, launch=None):
        self.write_rows("fonts-launch-150.csv", launch or [self.launch])
        self.write_rows("fonts-approved.csv", approved or [self.approved])
        return MODULE.build_catalog(self.root)

    def test_exports_complete_approved_facts_and_normalizes_rfn_hold(self):
        catalog = self.build()
        font = catalog["fonts"][0]
        self.assertEqual(catalog["version"], 2)
        self.assertEqual(font["finalStatus"], "APPROVED")
        self.assertEqual(font["previewStatus"], "UNAVAILABLE_RFN")
        self.assertEqual(font["sourceCommit"], "a" * 40)
        self.assertEqual(font["coverage"]["latin"], 1.0)
        self.assertEqual(font["axes"], ["wght"])
        self.assertEqual(font["styleCount"], 9)
        self.assertEqual(font["fontFileCount"], 2)

    def test_rejects_non_approved_input(self):
        review = {**self.approved, "final_status": "REVIEW"}
        with self.assertRaisesRegex(ValueError, "non-APPROVED"):
            self.build([review])

    def test_rejects_unknown_preview_status(self):
        invalid = {**self.approved, "preview_status": "MAYBE"}
        with self.assertRaisesRegex(ValueError, "unsupported preview_status"):
            self.build([invalid])

    def test_rejects_duplicate_slugs_and_ranks(self):
        second_launch = {**self.launch, "family": "Second", "slug": "examplesans"}
        second_approval = {**self.approved, "family": "Second"}
        with self.assertRaisesRegex(ValueError, "duplicate slug"):
            self.build([self.approved, second_approval], [self.launch, second_launch])

    def test_output_is_deterministic(self):
        first = self.build()
        second = self.build()
        self.assertEqual(first, second)
        MODULE.write_catalog(self.root, first)
        first_bytes = (self.root / "src" / "data" / "font-catalog.json").read_bytes()
        MODULE.write_catalog(self.root, second)
        self.assertEqual(first_bytes, (self.root / "src" / "data" / "font-catalog.json").read_bytes())


if __name__ == "__main__":
    unittest.main()
