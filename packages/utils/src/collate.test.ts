import { expect, test } from 'vitest'
import { collate } from './collate'

const SHORT_LIST = ['ä', 'B', 'ø', 'A', 'a', 'æ', 'Z', '_x']

const LONG_LIST = [
  'Pink Floyd',
  'AC/DC',
  'The Beatles',
  'Daft Punk',
  'The Rolling Stones',
  'Bob Marley',
]

const KANJI_LIST = ['日本語', '仮名', 'ひらがな', 'カタカナ', '漢字']

test('sorts lists in a locale-sensitive manner', () => {
  const shortDE = SHORT_LIST.toSorted((a, b) => collate(a, b, 'de-DE'))
  const shortSE = SHORT_LIST.toSorted((a, b) => collate(a, b, 'sv-SE'))
  const kanji = KANJI_LIST.toSorted((a, b) => collate(a, b, 'ja-JP'))
  const long = LONG_LIST.toSorted((a, b) => collate(a, b, 'en-US'))

  expect(shortDE).toEqual(['_x', 'a', 'A', 'ä', 'æ', 'B', 'ø', 'Z'])
  expect(shortSE).toEqual(['_x', 'a', 'A', 'B', 'Z', 'ä', 'æ', 'ø'])
  expect(kanji).toEqual(['カタカナ', 'ひらがな', '仮名', '漢字', '日本語'])
  expect(long).toEqual([
    'AC/DC',
    'Bob Marley',
    'Daft Punk',
    'Pink Floyd',
    'The Beatles',
    'The Rolling Stones',
  ])
})

test('accepts various locale expressions', () => {
  const shortEN = SHORT_LIST.toSorted((a, b) => collate(a, b, 'en-US'))

  const shortJapaneseJPAlternativeCalendar = SHORT_LIST.toSorted((a, b) =>
    collate(a, b, 'ja-JP-u-ca-japanese'),
  )
  const shortBadLocaleWithFallback = SHORT_LIST.toSorted((a, b) =>
    collate(a, b, ['bad-locale', 'en-US']),
  )
  const shortMixedLocale = SHORT_LIST.toSorted((a, b) => collate(a, b, 'en-SE'))

  expect(shortEN).toEqual(['_x', 'a', 'A', 'ä', 'æ', 'B', 'ø', 'Z'])
  expect(shortJapaneseJPAlternativeCalendar).toEqual(['_x', 'a', 'A', 'ä', 'æ', 'B', 'ø', 'Z'])
  expect(shortBadLocaleWithFallback).toEqual(['_x', 'a', 'A', 'ä', 'æ', 'B', 'ø', 'Z'])
  expect(shortMixedLocale).toEqual(['_x', 'a', 'A', 'ä', 'æ', 'B', 'ø', 'Z'])
})

test('modifies output with varying configurable options', () => {
  const shortENUpper = SHORT_LIST.toSorted((a, b) => collate(a, b, 'en-US', { caseFirst: 'upper' }))
  const shortENBase = SHORT_LIST.toSorted((a, b) => collate(a, b, 'en-US', { sensitivity: 'base' }))
  const shortENNoPunctuation = SHORT_LIST.toSorted((a, b) =>
    collate(a, b, 'en-US', { ignorePunctuation: true }),
  )

  expect(shortENUpper).toEqual(['_x', 'A', 'a', 'ä', 'æ', 'B', 'ø', 'Z'])
  expect(shortENBase).toEqual(['_x', 'ä', 'A', 'a', 'æ', 'B', 'ø', 'Z'])
  expect(shortENNoPunctuation).toEqual(['a', 'A', 'ä', 'æ', 'B', 'ø', '_x', 'Z'])
})
