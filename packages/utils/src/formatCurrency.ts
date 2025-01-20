import type { DistributiveOmit } from '@noaignite/types'

export type CurrencyFormatterOptions = DistributiveOmit<
  Intl.NumberFormatOptions,
  'style' | 'currency'
>

/** Default, most universal formatting options. */
const defaultOptions: Intl.NumberFormatOptions = {
  style: 'currency',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}

/**
 * Accepts a `locale` and optional formatting `options`, returning function that
 * formats currency number values according to specified configuration.
 *
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link CurrencyFormatterOptions} Configurable options.
 *
 * @returns Formatting function for quick re-use a specified configuration.
 *
 * @example
 * ```ts
 * const format = currencyFormatter('en-US', 'USD', { currencyDisplay: 'symbol' })
 *
 * format(19.99) // $19.99
 * format(0.50) // $0.50
 * ```
 */
export const currencyFormatter = (
  locale: string | string[] | undefined,
  currency: string,
  options?: CurrencyFormatterOptions,
) => {
  const currencyOptions = { ...defaultOptions, ...options, currency }
  const numberFormat = new Intl.NumberFormat(locale, currencyOptions)

  return (value: number) => numberFormat.format(value)
}

/**
 * Formats a currency number `value` according to the specified `locale` and `options`.
 *
 * @param value - A number to format as a currency.
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link CurrencyFormatterOptions} Configurable options.
 *
 * @returns A formatted currency string.
 *
 * @remarks To prevent hydration errors, ensure the locale on server matches the client.
 *
 * @example
 * ```ts
 * formatCurrency(19.99, 'en-US', 'USD', { currencyDisplay: 'symbol' }) // $19.99
 * formatCurrency(0.50, 'sv-SE', 'SEK', { currencyDisplay: 'symbol' }) // 0,50 kr
 * ```
 */
export const formatCurrency = (
  value: number,
  locale: string | string[] | undefined,
  currency: string,
  options?: CurrencyFormatterOptions,
) => currencyFormatter(locale, currency, options)(value)
