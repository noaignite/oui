import { afterAll, beforeAll, expect, test } from 'vitest'
import type { DateFormatterOptions } from './formatDate'
import { formatDate } from './formatDate'

let originalTZ: string | undefined

beforeAll(() => {
  originalTZ = process.env.TZ
  process.env.TZ = 'UTC'
})

afterAll(() => {
  process.env.TZ = originalTZ
})

const date = '2030-10-04'
const timestamp = 1917302400000

test('accepts `Date` types, date-like strings and timestamps', () => {
  const dateAsDate = new Date(date).toISOString()
  const dateAsString = date
  const dateAsNumber = timestamp

  const dateAsDateFormatted = formatDate(dateAsDate, 'en-US')
  const dateAsStringFormatted = formatDate(dateAsString, 'en-US')
  const dateAsNumberFormatted = formatDate(dateAsNumber, 'en-US')

  expect(dateAsDateFormatted).toEqual(dateAsStringFormatted)
  expect(dateAsStringFormatted).toEqual(dateAsNumberFormatted)
  expect(dateAsNumberFormatted).toEqual(dateAsDateFormatted)
  expect(new Date(dateAsDateFormatted).getTime()).toEqual(timestamp)
})

test('accepts various locale expressions', () => {
  const dateUS = formatDate(date, 'en-US')
  const dateSE = formatDate(date, 'sv-SE')
  const dateEnSE = formatDate(date, 'en-SE')
  const dateJPAlternateCalendar = formatDate(date, 'ja-JP-u-ca-japanese')
  const dateBadLocaleWithFallback = formatDate(date, ['bad-locale', 'en-US'])

  expect(dateUS).toEqual('10/4/2030')
  expect(dateSE).toEqual('2030-10-04')
  expect(dateEnSE).toEqual(dateSE)
  expect(dateJPAlternateCalendar).toEqual('R12/10/4')
  expect(dateBadLocaleWithFallback).toEqual(dateUS)
})

test('modifies output with varying configurable options', () => {
  const dateUS = formatDate(date, 'en-US', { weekday: 'long' })
  const dateSE = formatDate(date, 'sv-SE', { weekday: 'long' })

  expect(dateUS).toEqual('Friday, 10/4/2030')
  expect(dateSE).toEqual('fredag, 2030-10-04')

  const dayTimeOptions: Partial<DateFormatterOptions> = {
    year: undefined,
    month: undefined,
    day: undefined,
    hour: 'numeric',
    minute: 'numeric',
  }

  const dateUSDayTime = formatDate(date, 'en-US', dayTimeOptions)
  const dateSEDayTime = formatDate(date, 'sv-SE', dayTimeOptions)
  const dateSEDayTime12 = formatDate(date, 'sv-SE', {
    ...dayTimeOptions,
    hour12: true,
  })

  expect(dateUSDayTime).toEqual('12:00 AM')
  expect(dateSEDayTime).toEqual('00:00')

  /**
   * Different environments might use different versions of the ICU
   * (International Components for Unicode) library, which in turn
   * depends on specific CLDR (Unicode Common Locale Data Repository)
   * versions.
   *
   * We normalize here to mitigate tests failing on Github Actions,
   * where the ICU version might differ from the one used locally or
   * vice versa.
   */
  const normalizedSETime = dateSEDayTime12 === '12:00 fm' ? '0:00 fm' : dateSEDayTime12
  expect(normalizedSETime).toEqual('0:00 fm')
})
