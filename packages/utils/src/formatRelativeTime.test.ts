import { expect, test } from 'vitest'
import { formatRelativeTime } from './formatRelativeTime'

test('accepts both before / after points in time', () => {
  const in3DaysUS = formatRelativeTime(3, 'days', 'en-US')
  const ago1DaysUS = formatRelativeTime(-1, 'days', 'en-US')
  const ago2DaysUS = formatRelativeTime(-2, 'days', 'en-US')

  expect(in3DaysUS).equals('in 3 days')
  expect(ago1DaysUS).equals('yesterday')
  expect(ago2DaysUS).equals('2 days ago')
})

test('accepts various locale expressions', () => {
  const inUS = formatRelativeTime(3, 'seconds', 'en-US')
  const inSE = formatRelativeTime(3, 'seconds', 'sv-SE')
  const inJP = formatRelativeTime(3, 'seconds', 'ja-JP')

  const inJPAlternativeCalendar = formatRelativeTime(3, 'seconds', 'ja-JP-u-ca-japanese')
  const inBadLocaleWithFallback = formatRelativeTime(3, 'seconds', ['bad-locale', 'en-US'])

  expect(inUS).equals('in 3 seconds')
  expect(inSE).equals('om 3 sekunder')
  expect(inJP).equals('3 秒後')
  expect(inJPAlternativeCalendar).equals('3 秒後')
  expect(inBadLocaleWithFallback).equals('in 3 seconds')
})

test('modifies output with varying configurable options', () => {
  const longIn1Years = formatRelativeTime(1, 'years', 'en-US', { style: 'long' })
  const shortIn1Years = formatRelativeTime(1, 'years', 'en-US', { style: 'short' })
  const narrowIn1Years = formatRelativeTime(1, 'years', 'en-US', { style: 'narrow' })

  const numericLongIn1Years = formatRelativeTime(1, 'years', 'en-US', {
    style: 'long',
    numeric: 'always',
  })

  const numericShortIn1Years = formatRelativeTime(1, 'years', 'en-US', {
    style: 'short',
    numeric: 'always',
  })

  const numericNarrowIn1Years = formatRelativeTime(1, 'years', 'en-US', {
    style: 'narrow',
    numeric: 'always',
  })

  expect(longIn1Years).equals('next year')
  expect(shortIn1Years).equals('next yr.')
  expect(narrowIn1Years).equals('next yr.')

  expect(numericLongIn1Years).equals('in 1 year')
  expect(numericShortIn1Years).equals('in 1 yr.')
  expect(numericNarrowIn1Years).equals('in 1y')
})
