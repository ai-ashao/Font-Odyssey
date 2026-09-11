import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { validatePreviewCoverage } from '../scripts/check-font-preview-coverage.mjs'

function fixture() {
  const object = {
    url: 'https://assets.fontodyssey.com/fonts/inter/test-1/preview.woff2',
    sha256: 'a'.repeat(64),
    bytes: 123,
  }
  return {
    fonts: [
      {
        slug: 'inter',
        finalStatus: 'APPROVED',
        sourceCommit: 'b'.repeat(40),
        reservedFontNames: [],
      },
    ],
    releases: [
      {
        slug: 'inter',
        status: 'VERIFIED',
        sourceCommit: 'b'.repeat(40),
        releaseVersion: 'test-1',
        previewStatus: 'GENERATED_SUBSET',
        preview: object,
      },
    ],
    index: {
      version: 1,
      releases: {
        inter: {
          previewUrl: object.url,
          sha256: object.sha256,
          bytes: object.bytes,
          codepoints: [32, 65],
          defaultText: 'A',
        },
      },
    },
  }
}
const validate = (item) => validatePreviewCoverage(item.fonts, item.releases, item.index)

test('valid evidence passes without fetching any bytes', () => {
  assert.deepEqual(validate(fixture()), [])
})

const mutations = {
  'empty index': (x) => {
    x.index.releases = {}
  },
  'stale hash': (x) => {
    x.index.releases.inter.sha256 = 'c'.repeat(64)
  },
  'wrong URL': (x) => {
    x.index.releases.inter.previewUrl += '?new=1'
  },
  'foreign object origin': (x) => {
    x.releases[0].preview.url = 'https://example.com/font.woff2'
  },
  'whitespace default': (x) => {
    x.index.releases.inter.defaultText = ' '
  },
  'overlong default': (x) => {
    x.index.releases.inter.defaultText = 'A'.repeat(141)
  },
  'UTF-16 limit': (x) => {
    x.index.releases.inter.codepoints = [0x1f600]
    x.index.releases.inter.defaultText = '😀'.repeat(71)
  },
  'oversized cmap': (x) => {
    x.index.releases.inter.codepoints = Array.from({ length: 100001 }, (_, i) => i + 0x10000)
  },
  'unsorted cmap': (x) => {
    x.index.releases.inter.codepoints = [65, 32]
  },
  'surrogate cmap': (x) => {
    x.index.releases.inter.codepoints = [65, 0xd800]
  },
  'unsupported default': (x) => {
    x.index.releases.inter.defaultText = 'AB'
  },
  'duplicate release': (x) => {
    x.releases.push(x.releases[0])
  },
  'unapproved font': (x) => {
    x.fonts[0].finalStatus = 'REVIEW'
  },
  'source mismatch': (x) => {
    x.releases[0].sourceCommit = 'c'.repeat(40)
  },
  'RFN derivative': (x) => {
    x.fonts[0].reservedFontNames = ['Reserved']
  },
  'missing preview object': (x) => {
    delete x.releases[0].preview
  },
  'unexpected entry': (x) => {
    x.index.releases.unknown = x.index.releases.inter
  },
  'nonobject releases': (x) => {
    x.index.releases = []
  },
}
for (const [name, mutate] of Object.entries(mutations)) {
  test(`rejects ${name}`, () => {
    const data = fixture()
    mutate(data)
    assert.notEqual(validate(data).length, 0)
  })
}

test('known download-only RFN release requires no fabricated coverage', () => {
  const data = fixture()
  data.fonts[0].reservedFontNames = ['Reserved']
  data.releases[0].previewStatus = 'UNAVAILABLE_RFN'
  delete data.releases[0].preview
  data.index.releases = {}
  assert.deepEqual(validate(data), [])
})

test('package build command cannot skip offline index guard', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.equal(pkg.scripts.build, 'pnpm check:previews && vite build')
  assert.equal(pkg.scripts['check:previews'], 'node scripts/check-font-preview-coverage.mjs')
  assert.ok(pkg.scripts.verify.includes('pnpm test:preview-guard'))
})

test('CLI exits nonzero for empty index and zero for valid evidence', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'fontodyssey-guard-'))
  const item = fixture()
  const script = fileURLToPath(
    new URL('../scripts/check-font-preview-coverage.mjs', import.meta.url),
  )
  try {
    mkdirSync(resolve(root, 'src/data'), { recursive: true })
    writeFileSync(
      resolve(root, 'src/data/font-catalog.json'),
      JSON.stringify({ fonts: item.fonts }),
    )
    writeFileSync(resolve(root, 'src/data/font-asset-releases.json'), JSON.stringify(item.releases))
    const path = resolve(root, 'src/data/font-preview-coverage.json')
    writeFileSync(path, JSON.stringify({ version: 1, releases: {} }))
    assert.equal(spawnSync(process.execPath, [script, '--root', root]).status, 1)
    writeFileSync(path, JSON.stringify(item.index))
    assert.equal(spawnSync(process.execPath, [script, '--root', root]).status, 0)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
