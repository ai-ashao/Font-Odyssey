"""Tests build disposable synthetic fonts; no production font files or remote traffic are used."""
import contextlib
import hashlib
import importlib.util
import io
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('font_preview_assets', ROOT / 'scripts/font-preview-assets.py')
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)


def synthetic_woff2(characters=' Sphinxofblackqurt,judgemyv.FOd0123456789字型探索😀'):
    from fontTools.fontBuilder import FontBuilder
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    codepoints = sorted(set(map(ord, characters)))
    names = ['.notdef'] + [f'uni{cp:06X}' for cp in codepoints]
    builder = FontBuilder(1000, isTTF=True)
    builder.setupGlyphOrder(names)
    builder.setupCharacterMap(dict(zip(codepoints, names[1:])))
    glyphs = {}
    for name in names:
        pen = TTGlyphPen(None)
        if name != 'uni000020':
            pen.moveTo((80, 0)); pen.lineTo((450, 0)); pen.lineTo((300, 700)); pen.closePath()
        glyphs[name] = pen.glyph()
    builder.setupGlyf(glyphs)
    builder.setupHorizontalMetrics({name: (600, 0) for name in names})
    builder.setupHorizontalHeader(ascent=800, descent=-200)
    builder.setupNameTable({'familyName': 'FontOdyssey QA Fixture', 'styleName': 'Regular', 'uniqueFontIdentifier': 'FO-QA-1', 'fullName': 'FO QA Regular', 'psName': 'FOQA-Regular'})
    builder.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=800, usWinDescent=200)
    builder.setupPost(); builder.setupMaxp()
    builder.font.flavor = 'woff2'
    output = io.BytesIO(); builder.font.save(output)
    return output.getvalue()


def make_object(data, name='preview.woff2'):
    return {'url': f'https://assets.fontodyssey.com/fonts/inter/test-1/{name}', 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'contentType': 'font/woff2'}


class PreviewAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = synthetic_woff2()
        cls.obj = make_object(cls.data)
        cls.font = {'slug': 'inter', 'languageGroup': 'Latin', 'finalStatus': 'APPROVED', 'sourceCommit': 'a' * 40, 'reservedFontNames': []}
        cls.release = {'slug': 'inter', 'releaseVersion': 'test-1', 'sourceCommit': 'a' * 40, 'preview': cls.obj, 'status': 'VERIFIED', 'previewStatus': 'GENERATED_SUBSET'}

    def test_extracts_actual_cmap_and_supported_default(self):
        entry = AUDIT.extract_preview(self.data, self.font, self.obj)
        self.assertIn(ord('😀'), entry['codepoints'])
        self.assertNotIn(ord('M'), entry['codepoints'])
        self.assertTrue(set(map(ord, entry['defaultText'])).issubset(entry['codepoints']))
        self.assertEqual(entry['codepoints'], sorted(set(entry['codepoints'])))

    def test_language_sample_does_not_translate_latin_into_chinese(self):
        self.assertEqual(AUDIT.sample_text('Latin'), 'Sphinx of black quartz, judge my vow.')
        self.assertIn('字型探索', AUDIT.sample_text('Chinese'))

    def test_rejects_foreign_and_traversal_urls(self):
        invalid = ['http://assets.fontodyssey.com/fonts/inter/test-1/preview.woff2', 'https://example.com/fonts/inter/test-1/preview.woff2', 'https://assets.fontodyssey.com/fonts/inter/test-1/../evil', 'https://assets.fontodyssey.com/fonts/inter/test-1/%2e%2e', 'https://assets.fontodyssey.com/fonts/other/test-1/preview.woff2', 'https://assets.fontodyssey.com/fonts/inter/test-1/preview.woff2?x=1']
        for url in invalid:
            with self.subTest(url=url), self.assertRaises(ValueError):
                AUDIT.validate_url(url, 'inter', 'test-1')

    def test_rejects_changed_bytes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); path = root / 'fonts/inter/test-1/preview.woff2'; path.parent.mkdir(parents=True); path.write_bytes(self.data)
            changed = {**self.obj, 'sha256': '0' * 64}
            with self.assertRaisesRegex(ValueError, 'SHA-256'):
                AUDIT.read_object(changed, 'inter', 'test-1', 'preview', root)

    def test_rejects_size_mismatch(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); path = root / 'fonts/inter/test-1/preview.woff2'; path.parent.mkdir(parents=True); path.write_bytes(self.data + b'X')
            with self.assertRaisesRegex(ValueError, 'Byte count'):
                AUDIT.read_object(self.obj, 'inter', 'test-1', 'preview', root)

    def test_rfn_and_unapproved_are_not_bypassed(self):
        for font in ({**self.font, 'reservedFontNames': ['Reserved']}, {**self.font, 'finalStatus': 'REVIEW'}, {**self.font, 'sourceCommit': 'b' * 40}):
            with self.subTest(font=font), self.assertRaises(ValueError):
                AUDIT.audit_preview(self.release, font, None, False)

    def test_invalid_preview_bytes_are_rejected(self):
        with self.assertRaises(Exception):
            AUDIT.extract_preview(b'not a font', self.font, self.obj)

    def test_zip_requires_notices(self):
        data = io.BytesIO()
        with zipfile.ZipFile(data, 'w') as archive:
            archive.writestr('font.ttf', b'fixture')
        with self.assertRaisesRegex(ValueError, 'license/source'):
            AUDIT.verify_zip(data.getvalue())

    def test_zip_rejects_traversal(self):
        data = io.BytesIO()
        with zipfile.ZipFile(data, 'w') as archive:
            archive.writestr('../font.ttf', b'fixture')
            archive.writestr('LICENSE.txt', 'fixture license')
            archive.writestr('SOURCE.txt', 'fixture source')
        with self.assertRaisesRegex(ValueError, 'Unsafe'):
            AUDIT.verify_zip(data.getvalue())

    def test_zip_formats_are_measured_not_guessed(self):
        data = io.BytesIO()
        with zipfile.ZipFile(data, 'w') as archive:
            archive.writestr('fonts/example.otf', b'fixture')
            archive.writestr('LICENSE.txt', 'fixture license')
            archive.writestr('SOURCE.txt', 'fixture source')
        self.assertEqual(AUDIT.verify_zip(data.getvalue())['formats'], ['OTF'])

    def test_offline_gate_rejects_an_empty_index_without_network(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); (root / 'src/data').mkdir(parents=True)
            (root / 'src/data/font-catalog.json').write_text(json.dumps({'fonts': [self.font]}))
            (root / 'src/data/font-asset-releases.json').write_text(json.dumps([self.release]))
            (root / 'src/data/font-preview-coverage.json').write_text(json.dumps({'version': 1, 'releases': {}}))
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(AUDIT.main(['--root', str(root), '--check-coverage']), 1)

    def test_cors_requirement_rejects_missing_allow_origin(self):
        from unittest.mock import patch
        with patch.object(AUDIT, 'read_object', return_value=(self.data, {'corsOk': False})):
            with self.assertRaisesRegex(ValueError, 'CORS'):
                AUDIT.audit_preview(self.release, self.font, None, True)

    def test_end_to_end_write_is_deterministic_and_failures_preserve_index(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); (root / 'src/data').mkdir(parents=True)
            (root / 'src/data/font-catalog.json').write_text(json.dumps({'fonts': [self.font]}))
            (root / 'src/data/font-asset-releases.json').write_text(json.dumps([self.release]))
            mirror = root / 'assets'; path = mirror / 'fonts/inter/test-1/preview.woff2'; path.parent.mkdir(parents=True); path.write_bytes(self.data)
            command = ['--root', str(root), '--local-assets', str(mirror), '--write-coverage']
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(AUDIT.main(command), 0)
                index = (root / 'src/data/font-preview-coverage.json').read_bytes()
                self.assertEqual(AUDIT.main(['--root', str(root), '--check-coverage']), 0)
                self.assertEqual(AUDIT.main(command), 0)
                self.assertEqual((root / 'src/data/font-preview-coverage.json').read_bytes(), index)
                path.write_bytes(b'bad')
                self.assertEqual(AUDIT.main(command), 1)
                self.assertEqual((root / 'src/data/font-preview-coverage.json').read_bytes(), index)


class CoverageReviewRegressionTests(unittest.TestCase):
    def check_index(self, *, default='A', cps=None, releases_override=None):
        obj = {'url': 'https://assets.fontodyssey.com/fonts/inter/test-1/preview.woff2',
               'sha256': 'a' * 64, 'bytes': 100}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'src/data').mkdir(parents=True)
            (root / 'src/data/font-catalog.json').write_text(json.dumps({'fonts': [{'slug': 'inter'}]}))
            (root / 'src/data/font-asset-releases.json').write_text(json.dumps([{'slug': 'inter', 'preview': obj}]))
            entry = {'previewUrl': obj['url'], 'sha256': obj['sha256'], 'bytes': 100,
                     'codepoints': [65] if cps is None else cps, 'defaultText': default}
            index = {'version': 1, 'releases': {'inter': entry} if releases_override is None else releases_override}
            (root / 'src/data/font-preview-coverage.json').write_text(json.dumps(index))
            with contextlib.redirect_stdout(io.StringIO()):
                return AUDIT.main(['--root', str(root), '--check-coverage'])

    def test_default_text_limit_matches_frontend(self):
        self.assertEqual(self.check_index(default='A' * 141), 1)
        self.assertEqual(self.check_index(default='A' * 140), 0)

    def test_whitespace_only_default_is_rejected(self):
        self.assertEqual(self.check_index(default=' ', cps=[32]), 1)

    def test_utf16_length_matches_javascript(self):
        self.assertEqual(self.check_index(default='😀' * 71, cps=[0x1F600]), 1)
        self.assertEqual(self.check_index(default='😀' * 70, cps=[0x1F600]), 0)

    def test_oversized_codepoints_are_rejected(self):
        self.assertEqual(self.check_index(cps=[65] + list(range(0x10000, 0x10000 + 100000))), 1)

    def test_non_array_codepoints_are_rejected_without_crashing(self):
        self.assertEqual(self.check_index(cps={'65': 'A'}), 1)

    def test_non_object_index_is_rejected_without_crashing(self):
        self.assertEqual(self.check_index(releases_override=[]), 1)


if __name__ == '__main__':
    unittest.main()
