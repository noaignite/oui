export type ListFormatterOptions = Intl.ListFormatOptions

/** Default, most universal formatting options. */
const defaultOptions: ListFormatterOptions = {
  type: 'unit',
  style: 'long',
}

/**
 * Accepts a `locale` and optional formatting `options`, returning a function that
 * formats lists of string values according to the specified configuration.
 *
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link ListFormatterOptions} Configurable options.
 *
 * @returns Formatting function for quick re-use with a specified configuration.
 *
 * @example
 * ```ts
 * const format = listFormatter('en-US', { style: 'short' });
 *
 * format(['Apple', 'Banana', 'Cherry']) // "Apple, Banana, and Cherry"
 * ```
 */
export const listFormatter = (
  locale: string | string[] | undefined,
  options?: ListFormatterOptions,
) => {
  const listOptions = { ...defaultOptions, ...options }
  const listFormat = new Intl.ListFormat(locale, listOptions)

  return (value: Iterable<string>) => listFormat.format(value)
}

/**
 * Formats a list of string `value` according to the specified `locale` and `options`.
 *
 * @param value - An iterable of strings to format as a list.
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link ListFormatterOptions} Configurable options.
 *
 * @returns A formatted list string.
 *
 * @example
 * ```ts
 * formatList(['Apple', 'Banana', 'Cherry'], 'en-US', { style: 'short' })
 * // "Apple, Banana, and Cherry"
 *
 * formatList(['Äpple', 'Banan', 'Körsbär'], 'sv-SE', { style: 'long' })
 * // "Äpple, Banan och Körsbär"
 * ```
 */
export const formatList = (
  value: Iterable<string>,
  locale: string | string[] | undefined,
  options?: ListFormatterOptions,
) => listFormatter(locale, options)(value)
