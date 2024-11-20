import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useInterval } from './useInterval'

beforeEach(vi.useFakeTimers)

afterEach(vi.useRealTimers)

test('callback is executed at each interval', () => {
  const callback = vi.fn()
  renderHook(() => {
    useInterval(callback, 1000, { when: true })
  })

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(2)
})

test('callback is not executed when disabled', () => {
  const callback = vi.fn()
  renderHook(() => {
    useInterval(callback, 1000, { when: false })
  })

  vi.advanceTimersByTime(3000)
  expect(callback).not.toHaveBeenCalled()
})

test('stops and starts based on "when" changes', () => {
  const callback = vi.fn()
  const { rerender } = renderHook(
    (initialProps) => {
      useInterval(callback, 1000, initialProps)
    },
    {
      initialProps: { when: true },
    },
  )

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)

  rerender({ when: false })
  vi.advanceTimersByTime(2000)
  expect(callback).toHaveBeenCalledTimes(1)

  rerender({ when: true })
  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(2)
})

test('when unmounted, clears the interval', () => {
  const callback = vi.fn()
  const { unmount } = renderHook(() => {
    useInterval(callback, 1000, { when: true })
  })

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)

  unmount()

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)
})
