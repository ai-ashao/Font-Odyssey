import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "font-ingest" / "download_curated.py"
SPEC = importlib.util.spec_from_file_location("download_curated", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class FontValidationTests(unittest.TestCase):
    def test_accepts_truetype_magic(self):
        with tempfile.NamedTemporaryFile(suffix=".ttf") as handle:
            handle.write(b"\x00\x01\x00\x00payload")
            handle.flush()
            self.assertTrue(MODULE.verify_font_magic(Path(handle.name)))

    def test_rejects_html_disguised_as_font(self):
        with tempfile.NamedTemporaryFile(suffix=".ttf") as handle:
            handle.write(b"<html>failure</html>")
            handle.flush()
            self.assertFalse(MODULE.verify_font_magic(Path(handle.name)))

    def test_sparse_pattern_escapes_variable_font_brackets(self):
        self.assertEqual(
            MODULE.sparse_literal("ofl/example/Example[wght].ttf"),
            "/ofl/example/Example\\[wght\\].ttf",
        )


if __name__ == "__main__":
    unittest.main()
