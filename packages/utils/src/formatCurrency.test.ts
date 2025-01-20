import { expect, test } from 'vitest'
import { formatCurrency } from './formatCurrency'

/**
 * @remarks The non-breaking spaces below are intentional as the standards mandate (\\u00A0)
 * to be used for currency formatting in tested locales under certain conditions.
 */

const LOW_VALUE = 0.5
const MEDIUM_VALUE = 19.99
const HIGH_VALUE = 1549

test('accepts various locale expressions', () => {
  const lowUSD = formatCurrency(LOW_VALUE, 'en-US', 'USD')
  const mediumUSD = formatCurrency(MEDIUM_VALUE, 'en-US', 'USD')
  const highUSD = formatCurrency(HIGH_VALUE, 'en-US', 'USD')

  const lowSEK = formatCurrency(LOW_VALUE, 'sv-SE', 'SEK')
  const mediumSEK = formatCurrency(MEDIUM_VALUE, 'sv-SE', 'SEK')
  const highSEK = formatCurrency(HIGH_VALUE, 'sv-SE', 'SEK')

  const lowJPYAlternativeCalendar = formatCurrency(LOW_VALUE, 'ja-JP-u-ca-japanese', 'JPY')
  const mediumBadLocaleWithFallback = formatCurrency(MEDIUM_VALUE, ['bad-locale', 'en-US'], 'USD')
  const highMixedLocaleCurrency = formatCurrency(HIGH_VALUE, ['nb-NO'], 'USD')

  expect(lowUSD).equals('$0.5')
  expect(mediumUSD).equals('$19.99')
  expect(highUSD).equals('$1,549')

  expect(lowSEK).equals('0,5 kr')
  expect(mediumSEK).equals('19,99 kr')
  expect(highSEK).equals('1 549 kr')

  expect(lowJPYAlternativeCalendar).equals('￥0.5')
  expect(mediumBadLocaleWithFallback).equals('$19.99')
  expect(highMixedLocaleCurrency).equals('1 549 $')
})

test('modifies output with varying configurable options', () => {
  const withCurrencyCode = formatCurrency(LOW_VALUE, 'en-US', 'USD', { currencyDisplay: 'code' })
  const withCurrencyName = formatCurrency(LOW_VALUE, 'en-US', 'USD', { currencyDisplay: 'name' })
  const alwaysTwoDecimals = formatCurrency(LOW_VALUE, 'en-US', 'USD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const roundToZeroDecimals = formatCurrency(LOW_VALUE, 'en-US', 'USD', {
    maximumFractionDigits: 0,
  })

  expect(withCurrencyCode).equals('USD 0.5')
  expect(withCurrencyName).equals('0.5 US dollars')
  expect(alwaysTwoDecimals).equals('$0.50')
  expect(roundToZeroDecimals).equals('$1')
})
