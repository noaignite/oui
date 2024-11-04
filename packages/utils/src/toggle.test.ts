import { describe, expect, it } from 'vitest'
import { toggle } from './toggle'

describe('toggle', () => {
  it('is a function and returns an array', () => {
    expect(typeof toggle).toEqual('function')
    expect(Array.isArray(toggle([], ''))).toBe(true)
  })

  it('toggles given value from the passed array', () => {
    const original = [1, 'foo', true]
    let modified = [...original]

    original.forEach((value) => {
      modified = toggle(modified, value)
      expect(modified.includes(value)).toBe(false)
      modified = toggle(modified, value)
      expect(modified.includes(value)).toBe(true)
    })

    modified = toggle(modified, 'bar')
    expect(modified.includes('bar')).toBe(true)
    modified = toggle(modified, 'bar')
    expect(modified.includes('bar')).toBe(false)
  })
})
