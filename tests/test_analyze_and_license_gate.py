import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "font-ingest" / "analyze_and_license_gate.py"
SPEC = importlib.util.spec_from_file_location("analyze_and_license_gate", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class AnalysisHelpersTests(unittest.TestCase):
    def test_license_markers(self):
        self.assertTrue(
            MODULE.license_matches(
                "OFL-1.1", "SIL Open Font License, Version 1.1", ""
            )
        )
        self.assertFalse(MODULE.license_matches("OFL-1.1", "Apache 2.0", ""))

    def test_normalize_metadata_names(self):
        self.assertEqual(MODULE.normalize("Noto Sans SC"), "notosanssc")

    def test_internal_license_state_separates_missing_and_conflict(self):
        self.assertEqual(MODULE.internal_license_state("OFL-1.1", "", ""), "MISSING")
        self.assertEqual(
            MODULE.internal_license_state(
                "OFL-1.1", "Licensed under the Apache License, Version 2.0", ""
            ),
            "CONFLICT",
        )

    def test_coverage(self):
        self.assertEqual(MODULE.coverage({1, 2}, {1, 2, 3, 4}), 0.5)

    def test_variable_static_postscript_collision_is_packaging_warning(self):
        severity, reason = MODULE.postscript_duplicate_severity(
            [
                {"family": "Example", "variable": True},
                {"family": "Example", "variable": False},
            ]
        )
        self.assertEqual((severity, reason), ("WARNING", "VARIABLE_STATIC_NAME_COLLISION"))


if __name__ == "__main__":
    unittest.main()
