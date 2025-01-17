export type DateFormatterOptions = Intl.DateTimeFormatOptions

/** Default, most universal formatting options. */
const defaultOptions: Partial<DateFormatterOptions> = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
}

/**
 * Accepts a `locale` and optional formatting `options`, returning function that
 * formats dates according to specified configuration.
 *
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link DateFormatterOptions} Configurable options.
 *
 * @returns Formatting function for quick re-use a specified configuration.
 *
 * @example
 * ```ts
 * const format = dateFormatter('en-US', { month: 'long' })
 *
 * format('2030-10-01') // 'October 1, 2030'
 * format('2010-01-10') // 'January 10, 2010'
 * ```
 */
export const dateFormatter = (
  locale: string | string[] | undefined,
  options?: Intl.DateTimeFormatOptions,
) => {
  const dateOptions = { ...defaultOptions, ...options }
  const dateFormat = new Intl.DateTimeFormat(locale, dateOptions)

  return (value: Date | string | number) => {
    if (!(value instanceof Date)) return dateFormat.format(new Date(value))
    return dateFormat.format(value)
  }
}

/**
 * Formats a date `value` according to the specified `locale` and `options`.
 *
 * @param value - A `Date` object, date-like string, or timestamp.
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link DateFormatterOptions} Configurable options.
 *
 * @returns A formatted date string.
 *
 * @remarks Returned value may not be compatible with `new Date()` constructor. Do not use for date-parsing after formatting.
 *
 * @remarks A `value` with slash-separators (2030/10/04) or non-padded single digits (2030-1-4) may not be parsed correctly in WebKit browsers. These values are not standard and should be avoided.
 *
 * @remarks To prevent hydration errors, avoid using `Date` objects in server-rendered HTML. Use date-like strings or timestamps instead.
 *
 * @example
 * ```ts
 * formatDate('2030-10-01', 'en-US', { month: 'long' }) // 'October 1, 2030'
 * formatDate(1263081600000, 'en-US', { month: 'long' }) // 'January 10, 2010'
 * ```
 */
export const formatDate = (
  value: Date | string | number,
  locale: string | string[] | undefined,
  options?: DateFormatterOptions,
) => dateFormatter(locale, options)(value)
