import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "font-ingest" / "google_fonts_preflight.py"
SPEC = importlib.util.spec_from_file_location("google_fonts_preflight", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class ReservedFontNameTests(unittest.TestCase):
    def test_extracts_declared_name_from_license_header(self):
        text = "Copyright X, with Reserved Font Name 'Example'\n\nSIL OPEN FONT LICENSE"
        self.assertEqual(MODULE.parse_reserved_font_names(text), "Example")

    def test_ignores_generic_license_body_wording(self):
        text = "Copyright X\n\nSIL OPEN FONT LICENSE\nReserved Font Name generic wording"
        self.assertEqual(MODULE.parse_reserved_font_names(text), "")

    def test_extracts_unquoted_multiline_names(self):
        text = (
            "Copyright X, with Reserved Font Name Alpha, Beta,\n"
            "Gamma\n\nSIL OPEN FONT LICENSE\nVersion 1.1"
        )
        self.assertEqual(MODULE.parse_reserved_font_names(text), "Alpha;Beta;Gamma")


if __name__ == "__main__":
    unittest.main()
