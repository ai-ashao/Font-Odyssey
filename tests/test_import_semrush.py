import csv
import importlib.util
import json
import tempfile
import unittest
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "seo" / "import_semrush.py"
SPEC = importlib.util.spec_from_file_location("fontodyssey_import_semrush", MODULE_PATH)
assert SPEC and SPEC.loader
semrush = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = semrush
SPEC.loader.exec_module(semrush)


class ImportSemrushTest(unittest.TestCase):
    def write_csv(self, path: Path, headers, rows):
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=headers)
            writer.writeheader()
            writer.writerows(rows)

    def test_imports_english_keyword_export_and_preserves_provenance(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            input_dir = root / "research" / "semrush" / "2026-09-08"
            output_dir = root / "reports" / "seo"
            self.write_csv(
                input_dir / "fontmirror.com-us-desktop-keywords.csv",
                ["Keyword", "Position", "Volume", "KD %", "Traffic", "Traffic %", "URL"],
                [
                    {
                        "Keyword": "inter font",
                        "Position": "3",
                        "Volume": "12100",
                        "KD %": "52",
                        "Traffic": "400",
                        "Traffic %": "2.1",
                        "URL": "https://fontmirror.com/inter",
                    }
                ],
            )

            snapshot = semrush.import_directory(
                input_dir,
                output_dir,
                market="US",
                device="desktop",
                captured_at="2026-09-08",
            )

            self.assertEqual(snapshot["keyword_rows"], 1)
            with (output_dir / "semrush-keywords-normalized.csv").open(
                newline="", encoding="utf-8"
            ) as handle:
                rows = list(csv.DictReader(handle))
            self.assertEqual(rows[0]["source_domain"], "fontmirror.com")
            self.assertEqual(rows[0]["keyword"], "inter font")
            self.assertEqual(rows[0]["search_volume"], "12100")
            self.assertEqual(rows[0]["captured_at"], "2026-09-08")

    def test_imports_localized_page_headers_without_guessing_unknown_columns(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            input_dir = root / "research" / "semrush" / "2026-09-08"
            output_dir = root / "reports" / "seo"
            self.write_csv(
                input_dir / "fontget.com-us-desktop-pages.csv",
                ["URL", "流量", "流量占比", "关键词", "主要关键词", "Extra Metric"],
                [
                    {
                        "URL": "https://www.fontget.com/discover/tattoo/",
                        "流量": "1000",
                        "流量占比": "10.7",
                        "关键词": "120",
                        "主要关键词": "tattoo fonts",
                        "Extra Metric": "ignored",
                    }
                ],
            )

            snapshot = semrush.import_directory(
                input_dir,
                output_dir,
                market="US",
                device="desktop",
                captured_at="2026-09-08",
            )

            self.assertEqual(snapshot["page_rows"], 1)
            source = snapshot["files"][0]
            self.assertIn("Extra Metric", source["unknown_columns"])
            parsed = json.loads((output_dir / "semrush-snapshot.json").read_text(encoding="utf-8"))
            self.assertEqual(parsed["market"], "US")

    def test_rejects_export_without_required_column(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            input_dir = root / "research" / "semrush" / "2026-09-08"
            output_dir = root / "reports" / "seo"
            self.write_csv(
                input_dir / "fontbolt.com-us-desktop-keywords.csv",
                ["Position", "Volume"],
                [{"Position": "1", "Volume": "1000"}],
            )

            with self.assertRaisesRegex(ValueError, "Missing required keywords columns"):
                semrush.import_directory(
                    input_dir,
                    output_dir,
                    market="US",
                    device="desktop",
                    captured_at="2026-09-08",
                )


if __name__ == "__main__":
    unittest.main()
