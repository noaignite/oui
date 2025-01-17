export type RelativeTimeFormatterOptions = Intl.RelativeTimeFormatOptions

/** Default, most universal formatting options. */
const defaultOptions: RelativeTimeFormatterOptions = {
  style: 'long',
  numeric: 'auto',
}

/**
 * Accepts a `locale` and optional formatting `options`, returning a function that
 * formats relative time ranges according to the specified configuration.
 *
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link RelativeTimeFormatterOptions} Configurable options.
 *
 * @returns Formatting function for quick re-use with a specified configuration.
 *
 * @example
 * ```ts
 * const format = relativeTimeFormatter('en-US', { style: 'long' });
 *
 * format(-1, 'days'); //=> 'yesterday'
 * ```
 */
export const relativeTimeFormatter = (
  locale: string | string[] | undefined,
  options?: RelativeTimeFormatterOptions,
) => {
  const relativeTimeOptions = { ...defaultOptions, ...options }
  const relativeTimeFormat = new Intl.RelativeTimeFormat(locale, relativeTimeOptions)

  return (value: number, unit: Intl.RelativeTimeFormatUnit) =>
    relativeTimeFormat.format(value, unit)
}

/**
 * Formats a number and unit of time into a human-readable string.
 *
 * @param value - A number to format.
 * @param unit - A unit of time to format.
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link RelativeTimeFormatterOptions} Configurable options.
 *
 * @returns A formatted list string.
 *
 * @example
 * ```ts
 * formatRelativeTime(1, 'days', 'en-US'); //=> 'tomorrow'
 * formatRelativeTime(2, 'hours', 'sv-SE', { style: 'short' }); //=> 'om 2 tim'
 * ```
 */
export const formatRelativeTime = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string | string[] | undefined,
  options?: RelativeTimeFormatterOptions,
) => relativeTimeFormatter(locale, options)(value, unit)
