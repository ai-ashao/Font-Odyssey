import hashlib
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "font-ingest" / "package_approved.py"
SPEC = importlib.util.spec_from_file_location("package_approved", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class PackagingHelpersTests(unittest.TestCase):
    def test_license_filenames(self):
        self.assertEqual(MODULE.license_filename("OFL-1.1"), "OFL.txt")
        self.assertEqual(MODULE.license_filename("UFL-1.0"), "LICENCE.txt")

    def test_preview_text_is_localized(self):
        self.assertIn("字体", MODULE.preview_text("Chinese"))
        self.assertIn("글꼴", MODULE.preview_text("Korean"))

    def test_select_preview_prefers_nonitalic_variable(self):
        rows = [
            {"relative_path": "Regular.ttf", "italic": "False", "variable": "False", "internal_subfamily": "Regular"},
            {"relative_path": "Italic[wght].ttf", "italic": "True", "variable": "True", "internal_subfamily": "Italic"},
            {"relative_path": "Family[wght].ttf", "italic": "False", "variable": "True", "internal_subfamily": "Regular"},
        ]
        self.assertEqual(MODULE.select_preview_font(rows)["relative_path"], "Family[wght].ttf")

    def test_zip_is_deterministic_and_safe(self):
        with tempfile.TemporaryDirectory() as directory:
            first = Path(directory) / "one.zip"
            second = Path(directory) / "two.zip"
            entries = [("SOURCE.txt", b"source"), ("LICENSE.txt", b"license"), ("fonts/A.ttf", b"font")]
            MODULE.build_zip(first, entries)
            MODULE.build_zip(second, reversed(entries))
            self.assertEqual(MODULE.sha256(first), MODULE.sha256(second))
            MODULE.verify_zip(first, {"fonts/A.ttf": hashlib.sha256(b"font").hexdigest()})
            with zipfile.ZipFile(first) as archive:
                self.assertEqual(archive.getinfo("fonts/A.ttf").date_time, MODULE.ZIP_DATE)


if __name__ == "__main__":
    unittest.main()
