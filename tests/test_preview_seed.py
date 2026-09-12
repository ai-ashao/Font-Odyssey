import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / 'scripts' / 'font-ingest' / 'package_approved.py'
spec = importlib.util.spec_from_file_location('fontodyssey_package_approved', MODULE_PATH)
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)


class PreviewSeedTests(unittest.TestCase):
    def test_latin_preview_seed_contains_basic_free_input_characters(self):
        text = module.preview_text('Latin')
        required = set('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
        self.assertTrue(required.issubset(set(text)))

    def test_cjk_preview_seed_keeps_local_sample_and_basic_latin(self):
        for language, sample in (
            ('Chinese', '字体探索'),
            ('Japanese', '文字の旅'),
            ('Korean', '글꼴 여행'),
        ):
            text = module.preview_text(language)
            self.assertIn(sample, text)
            self.assertIn('ABCDEFGHIJKLMNOPQRSTUVWXYZ', text)
            self.assertIn('abcdefghijklmnopqrstuvwxyz', text)


if __name__ == '__main__':
    unittest.main()
