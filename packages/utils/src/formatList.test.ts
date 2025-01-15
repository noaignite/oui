import { expect, test } from 'vitest'
import { formatList } from './formatList'

const ENGLISH_LIST = ['Apple', 'Kiwi', 'Banana', 'Cherry']
const SWEDISH_LIST = ['Äpple', 'Kiwi', 'Banan', 'Körsbär']
const JAPANESE_LIST = ['リンゴ', 'キウイ', 'バナナ', 'チェリー']

test('accepts various locale expressions', () => {
  const formattedEnglishUS = formatList(ENGLISH_LIST, 'en-US')
  const formattedSwedishSE = formatList(SWEDISH_LIST, 'sv-SE')
  const formattedJapaneseJP = formatList(JAPANESE_LIST, 'ja-JP')

  const formattedJapaneseJPAlternativeCalendar = formatList(JAPANESE_LIST, 'ja-JP-u-ca-japanese')
  const formattedBadLocaleWithFallback = formatList(ENGLISH_LIST, ['bad-locale', 'en-US'])
  const formattedMixedLocales = formatList(ENGLISH_LIST, ['sv-SE', 'en-US'])

  expect(formattedEnglishUS).toBe('Apple, Kiwi, Banana, Cherry')
  expect(formattedSwedishSE).toBe('Äpple, Kiwi, Banan, Körsbär')
  expect(formattedJapaneseJP).toBe('リンゴ キウイ バナナ チェリー')

  expect(formattedJapaneseJPAlternativeCalendar).toBe('リンゴ キウイ バナナ チェリー')
  expect(formattedBadLocaleWithFallback).toBe('Apple, Kiwi, Banana, Cherry')
  expect(formattedMixedLocales).toBe('Apple, Kiwi, Banana, Cherry')
})

test('modifies output with varying configurable options', () => {
  const formattedEnglishUSNarrowConjunction = formatList(ENGLISH_LIST, 'en-US', {
    style: 'narrow',
    type: 'conjunction',
  })
  const formattedSwedishSENarrowConjunction = formatList(SWEDISH_LIST, 'sv-SE', {
    style: 'narrow',
    type: 'conjunction',
  })

  const formattedEnglishUSLongConjunction = formatList(ENGLISH_LIST, 'en-US', {
    style: 'long',
    type: 'conjunction',
  })
  const formattedSwedishSELongConjunction = formatList(SWEDISH_LIST, 'sv-SE', {
    style: 'long',
    type: 'conjunction',
  })

  const formattedEnglishUSShortDisjunction = formatList(ENGLISH_LIST, 'en-US', {
    style: 'short',
    type: 'disjunction',
  })
  const formattedSwedishSEShortDisjunction = formatList(SWEDISH_LIST, 'sv-SE', {
    style: 'short',
    type: 'disjunction',
  })

  expect(formattedEnglishUSNarrowConjunction).toBe('Apple, Kiwi, Banana, Cherry')
  expect(formattedSwedishSENarrowConjunction).toBe('Äpple, Kiwi, Banan, Körsbär')

  expect(formattedEnglishUSLongConjunction).toBe('Apple, Kiwi, Banana, and Cherry')
  expect(formattedSwedishSELongConjunction).toBe('Äpple, Kiwi, Banan och Körsbär')

  expect(formattedEnglishUSShortDisjunction).toBe('Apple, Kiwi, Banana, or Cherry')
  expect(formattedSwedishSEShortDisjunction).toBe('Äpple, Kiwi, Banan eller Körsbär')
})
