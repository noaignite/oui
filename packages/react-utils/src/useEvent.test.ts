import { act, renderHook } from '@testing-library/react'
import { expect, test } from 'vitest'
import { useEvent } from './useEvent'

type References = 'window' | 'document'

const dispatch: Record<References, (t: string, eID?: EventInit) => void> = {
  window: (t, eID) => window.dispatchEvent(new Event(t, eID)),
  document: (t, eID) => document.dispatchEvent(new Event(t, eID)),
}

test('executes callback on a dispatched event', () => {
  let hasExecuted = false

  renderHook(() => {
    useEvent('window', 'resize', () => (hasExecuted = true))
  })

  act(dispatch.window.bind(null, 'resize'))
  expect(hasExecuted).toBe(true)
})

test('does not execute callback on incorrect dispatched event', () => {
  let hasExecuted = false

  renderHook(() => {
    useEvent('window', 'resize', () => (hasExecuted = true))
  })

  act(dispatch.window.bind(null, 'click'))
  expect(hasExecuted).toBe(false)
})

test('event object matches dispatched event', () => {
  let eventType = ''

  renderHook(() => {
    useEvent('window', 'resize', (event) => (eventType = event.type))
  })

  act(dispatch.window.bind(null, 'resize'))
  expect(eventType).toBe('resize')
})

test('target equals context registered on', () => {
  let documentTarget: unknown
  let windowTarget: unknown

  renderHook(() => {
    useEvent('document', 'load', (event) => (documentTarget = event.currentTarget))
  })

  act(dispatch.document.bind(null, 'load'))

  expect(documentTarget).instanceOf(Document)
  expect(documentTarget).not.instanceOf(Window)

  renderHook(() => {
    useEvent('window', 'load', (event) => (windowTarget = event.currentTarget))
  })

  act(dispatch.window.bind(null, 'load'))

  expect(windowTarget).instanceOf(Window)
  expect(windowTarget).not.instanceOf(Document)
})

test('when disabled, does not execute callback', () => {
  let hasExecuted = false

  const { rerender } = renderHook((initialProps: object = { when: false }) => {
    useEvent('window', 'resize', () => (hasExecuted = true), initialProps)
  })

  expect(hasExecuted).toBe(false)
  act(dispatch.window.bind(null, 'resize'))

  rerender({ when: true })

  act(dispatch.window.bind(null, 'resize'))
  expect(hasExecuted).toBe(true)
})

test('respects options and `eventInitDict`', () => {
  let executionCount = 0

  renderHook(() => {
    useEvent(
      'window',
      'scroll',
      (event) => {
        executionCount += 1
        expect(event.cancelable).toBe(true)

        event.preventDefault()
        expect(event.defaultPrevented).toBe(false)
      },
      { passive: true, once: true },
    )
  })

  act(dispatch.window.bind(null, 'scroll', { cancelable: true }))
  act(dispatch.window.bind(null, 'scroll'))

  expect(executionCount).toBe(1)
})

test('when unmounted, removes the listener on target', () => {
  let executionCount = 0

  const handler = () => (executionCount += 1)

  const { unmount } = renderHook(() => {
    useEvent('window', 'resize', handler)
  })

  act(dispatch.window.bind(null, 'resize'))
  expect(executionCount).toBe(1)

  unmount()

  act(dispatch.window.bind(null, 'resize'))
  expect(executionCount).toBe(1)
})
