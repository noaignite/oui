import type { Concatenate } from '@noaignite/types'

type TWArray = (string | number | boolean | null | undefined)[]

type TWReturn<T extends TWArray> = T extends [infer I, ...infer A]
  ? A extends (string | number)[]
    ? I extends string | number
      ? Concatenate<[I, ...A], ' '>
      : TWReturn<A>
    : A extends TWArray
      ? I extends string | number
        ? `${I}`
        : TWReturn<A>
      : undefined
  : undefined

type Filter<T extends unknown[]> = T extends [infer I, ...infer A]
  ? I extends '' | false | null | undefined
    ? Filter<A>
    : [I, ...Filter<A>]
  : []

/**
 * Concatenates any arguments that evaluate to `string | number` with
 * a `' '` separator and discards rest.
 *
 * @param args - Arguments to concatenate.
 *
 * @returns Concatenated `string` or `undefined`.
 *
 * @example
 * ```ts
 * const foo = true, bar = false;
 *
 * tw('hello', 'world') // 'hello world'
 * tw('hello', foo && 'world') // 'hello world'
 * tw('hello', bar && 'world') // 'hello'
 * tw(null) // undefined
 * tw(1, '2', 3) // '1 2 3'
 * tw(foo ? 'good' : 'evil') // 'good' | 'evil'
 * tw(foo ? 'page' : undefined) // 'page' | undefined
 * ```
 */
export function tw<T extends TWArray>(...args: T): TWReturn<Filter<T>>
export function tw(...args: TWArray[]): string | undefined {
  const array = args.filter(Boolean)
  return array.length ? array.join(' ') : undefined
}
