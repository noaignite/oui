import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { useWindowSize } from './useWindowSize'

beforeEach(() => {
  window.innerWidth = 800
  window.innerHeight = 600
  window.dispatchEvent(new Event('resize'))
})

const dispatch = (width: number, height: number) => {
  window.innerWidth = width
  window.innerHeight = height
  window.dispatchEvent(new Event('resize'))
}

test('updates on window size changes', () => {
  const { result } = renderHook(() => useWindowSize())

  expect(result.current.innerWidth).toBe(window.innerWidth)
  expect(result.current.innerHeight).toBe(window.innerHeight)

  act(dispatch.bind(null, 1920, 1080))

  // Either all or none of the property values should be numbers
  expect(Object.values(result.current).every((v) => typeof v === 'number'))

  expect(result.current.innerWidth).toBe(1920)
  expect(result.current.innerHeight).toBe(1080)
})

test('when disabled, retains the previous values', () => {
  const { result, rerender } = renderHook(() => useWindowSize())

  expect(result.current.innerWidth).toBe(window.innerWidth)
  expect(result.current.innerHeight).toBe(window.innerHeight)

  // Disable hook from tracking changes
  rerender({ when: false })

  act(dispatch.bind(null, 1920, 1080))

  expect(result.current.innerWidth).toBe(window.innerWidth)
  expect(result.current.innerHeight).toBe(window.innerHeight)

  // Re-enable hook to catch changes made when disabled
  rerender({ when: true })

  expect(result.current.innerWidth).toBe(1920)
  expect(result.current.innerHeight).toBe(1080)
})
