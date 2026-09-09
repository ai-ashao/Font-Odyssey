import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "font-ingest"))

from build_release_batches import BATCH_SIZES, PILOT_FAMILIES, build_batches


class ReleaseBatchTests(unittest.TestCase):
    def test_batches_are_complete_disjoint_and_ranked(self):
        batches = build_batches(
            ROOT / "data/font-catalog/fonts-approved.csv",
            ROOT / "data/font-catalog/fonts-launch-150.csv",
        )
        self.assertEqual([len(batch) for batch in batches], list(BATCH_SIZES))
        flattened = [family for batch in batches for family in batch]
        self.assertEqual(len(flattened), len(set(flattened)))
        self.assertTrue(PILOT_FAMILIES.isdisjoint(flattened))
        self.assertNotIn("Roboto Condensed", flattened)


if __name__ == "__main__":
    unittest.main()
