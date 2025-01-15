/* eslint-disable @typescript-eslint/no-confusing-void-expression -- Disable for tests. */
/* eslint-disable @typescript-eslint/no-unnecessary-condition -- Disable for tests. */

import { describe, expect, expectTypeOf, it } from 'vitest'
import { tw } from './tw'

describe('tw', () => {
  it('is a function and returns a `string` or `undefined`', () => {
    expect(typeof tw).toEqual('function')
    expect(typeof tw('hello', 'world')).toEqual('string')
    expect(typeof tw(null, undefined, false, '')).toEqual('undefined')
  })

  it('returns concatenated values and infers them corrrectly', () => {
    const yes = true
    const no = false

    expect(tw('hello', 'world')).toEqual('hello world')
    expectTypeOf(tw('hello', 'world')).toEqualTypeOf<'hello world'>()

    expect(tw('hello', yes && 'world')).toEqual('hello world')
    expectTypeOf(tw('hello', yes && 'world')).toEqualTypeOf<'hello world'>()

    expect(tw('hello', no && 'world')).toEqual('hello')
    expectTypeOf(tw('hello', no && 'world')).toEqualTypeOf<'hello'>()

    expect(tw(null, undefined, false, '')).toEqual(undefined)
    expectTypeOf(tw(null, undefined, false, '')).toEqualTypeOf<undefined>()

    expect(tw(1, '2', 3)).toEqual('1 2 3')
    expectTypeOf(tw(1, '2', 3)).toEqualTypeOf<'1 2 3'>()

    expect(tw(yes ? 'good' : 'evil')).toEqual('good')
    expectTypeOf(tw(yes ? 'good' : 'evil')).toEqualTypeOf<'good' | 'evil'>()

    expect(tw('', '1', false, '2', 3, undefined)).toEqual('1 2 3')
    expectTypeOf(tw('', '1', false, '2', 3, undefined)).toEqualTypeOf<'1 2 3'>()

    expect(tw()).toEqual(undefined)
    expectTypeOf(tw()).toEqualTypeOf<undefined>()
  })
})
