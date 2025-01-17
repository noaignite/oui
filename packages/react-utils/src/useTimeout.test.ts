import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useTimeout } from './useTimeout'

beforeEach(vi.useFakeTimers)

afterEach(vi.useRealTimers)

test('callback is executed after delay', () => {
  const callback = vi.fn()
  renderHook(useTimeout.bind(null, callback, 1000, { when: true }))

  expect(callback).not.toHaveBeenCalled()

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalled()
})

test('callback is not executed again after first delay', () => {
  const callback = vi.fn()
  renderHook(useTimeout.bind(null, callback, 1000, { when: true }))

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalled()

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)
})

test('callback is executed again after toggling its disabled state', () => {
  const callback = vi.fn()
  const { rerender } = renderHook(
    (initialProps) => {
      useTimeout(callback, 1000, initialProps)
    },
    { initialProps: { when: true } },
  )

  expect(callback).not.toHaveBeenCalled()

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)

  rerender({ when: false })
  rerender({ when: true })

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(2)
})

test('callback is not executed when disabled', () => {
  const callback = vi.fn()
  renderHook(() => {
    useTimeout(callback, 1000, { when: false })
  })

  vi.advanceTimersByTime(3000)
  expect(callback).not.toHaveBeenCalled()
})

test('stops and starts based on "when" changes', () => {
  const callback = vi.fn()
  const { rerender } = renderHook(
    (initialProps) => {
      useTimeout(callback, 1000, initialProps)
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

test('when unmounted, clears the timeout', () => {
  const callback = vi.fn()
  const { unmount } = renderHook(useTimeout.bind(null, callback, 1000, { when: true }))

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)

  unmount()

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalledTimes(1)
})
