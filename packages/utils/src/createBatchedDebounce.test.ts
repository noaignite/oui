import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBatchedDebounce } from './createBatchedDebounce'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createBatchedDebounce', () => {
  it('flushes queue after specified time', () => {
    const wait = 5000 // milliseconds

    let results = []
    const batchedDebounce = createBatchedDebounce((queue: string[]) => {
      results = queue
    }, wait)

    batchedDebounce('foo')
    batchedDebounce('bar')
    batchedDebounce('baz')

    expect(results.length).toBe(0)

    vi.advanceTimersByTime(wait + 5)
    expect(results.length).toBe(3)
  })

  it('flushes queue upon returned `true` from `shouldFlush`', () => {
    const wait = 5000

    let results = []
    const batchedDebounce = createBatchedDebounce(
      (queue: string[]) => {
        results = queue
      },
      wait,
      (queue) => queue.length > 4,
    )

    batchedDebounce('foo')
    batchedDebounce('bar')
    batchedDebounce('qux')
    batchedDebounce('quux')
    // Exceeding 4 entries, should therefore flush queue.
    batchedDebounce('corge')

    expect(results.length).toBe(5)
  })
})
