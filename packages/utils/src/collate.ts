import type { DistributiveOmit } from '@noaignite/types'

/** A subset of `Intl.Collator` options. */
export type CollateOptions = DistributiveOmit<Intl.CollatorOptions, 'usage'>

/**
 * Accepts a `locale` and optional formatting `options`, returning function that
 * compares two string values according to specifiec configuration.
 *
 * @param locale - A locale string or array of locale strings.
 * @param options - {@link CollateOptions} Configurable options.
 *
 * @returns A compare function used when sorting.
 *
 * @example
 * ```tsx
 * const cities = ['Tokyo', 'Berlin', 'Amsterdam']
 * const names = ['Jason', 'Michelle', 'Timothy']
 *
 * const collatorDE = collator('de-DE');
 *
 * const sortedCities = cities.toSorted(collatorDE);
 * const sortedNames = names.toSorted(collatorDE);
 * ```
 */
export const collator =
  (locale: string | string[] | undefined, options?: CollateOptions) => (a: string, b: string) =>
    new Intl.Collator(locale, options).compare(a, b)

/**
 * A compare function, that can be used with `Array.prototype.sort` and / or
 * `Array.prototype.toSorted` to sort strings based on a given locale ISO
 * specification.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @param locales - A locale string or array of locale strings.
 * @param options - {@link CollateOptions} Configurable options.
 *
 * @returns A number indicating the sort order.
 *
 * @remarks To prevent hydration mismatches, ensure locale on server matches client.
 *
 * @example
 * ```tsx
 * const data = [
 *   { name: 'Åland Jeans' },
 *   { name: 'Berlin Hoodie' },
 *   { name: 'Acapulco Coat' },
 * ]
 *
 * const sortedSE = data.toSorted((a, b) => collate(a.name, b.name, 'de-DE'));
 * // [{ name: 'Acapulco Coat' }, { name: 'Berlin Hoodie' }, { name: 'Åland Jeans' }]
 *
 * const sortedDE = data.toSorted((a, b) => collate(a.name, b.name, 'de-DE'));
 * // [{ name: 'Acapulco Coat' }, { name: 'Åland Jeans' }, { name: 'Berlin Hoodie' }]
 * ```
 */
export const collate = (
  a: string,
  b: string,
  locales: string | string[],
  options?: CollateOptions,
) => collator(locales, options)(a, b)
