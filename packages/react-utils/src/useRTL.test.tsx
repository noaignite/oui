import { act, render } from '@testing-library/react'
import { useRef } from 'react'
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest'
import { useRTL } from './useRTL'

class MutationObserverStub {
  private callback: MutationCallback
  private static targets = new WeakMap<Node, MutationCallback>()

  constructor(callback: MutationCallback) {
    this.callback = callback
  }

  observe(target: Node, options: MutationObserverInit) {
    if (options.attributes) {
      MutationObserverStub.targets.set(target, this.callback)
    }
  }

  disconnect() {
    if (!(this instanceof Node)) return
    MutationObserverStub.targets.delete(this)
  }

  static triggerAttributeChange(target: Node, attributeName: string) {
    const callback = MutationObserverStub.targets.get(target)

    if (callback) {
      const mutationRecord: MutationRecord = {
        type: 'attributes',
        target,
        attributeName,
        attributeNamespace: null,
        oldValue: null,
        addedNodes: NodeList.prototype,
        nextSibling: null,
        previousSibling: null,
        removedNodes: NodeList.prototype,
      }
      callback(
        [mutationRecord],
        new MutationObserver(() => {
          void 0
        }),
      )
    }
  }
}

beforeAll(() => {
  vi.stubGlobal('MutationObserver', MutationObserverStub)
})

afterEach(() => {
  document.documentElement.removeAttribute('dir')
})

afterAll(() => {
  vi.unstubAllGlobals()
})

function Scenario1() {
  const isRTL = useRTL()
  return <div data-is-rtl={isRTL} title="Target" />
}

test('defaults to LTR when no `dir` attribute is set on `HTMLHtmlElement`', async () => {
  const { findByTitle } = render(<Scenario1 />)

  const target = await findByTitle('Target')
  expect(target.getAttribute('data-is-rtl')).toBe('false')
})

test('respects `dir` attribute of `HTMLHtmlElement`', async () => {
  document.documentElement.dir = 'rtl'

  const { findByTitle } = render(<Scenario1 />)

  const target = await findByTitle('Target')
  expect(target.getAttribute('data-is-rtl')).toBe('true')
})

test('changes to `dir` attribute on `HTMLHtmlElement` updates return value', async () => {
  const { findByTitle } = render(<Scenario1 />)

  const target = await findByTitle('Target')
  expect(target.getAttribute('data-is-rtl')).toBe('false')

  act(() => {
    document.documentElement.dir = 'rtl'
    MutationObserverStub.triggerAttributeChange(document.documentElement, 'dir')
  })

  expect(target.getAttribute('data-is-rtl')).toBe('true')

  act(() => {
    document.documentElement.dir = 'ltr'
    MutationObserverStub.triggerAttributeChange(document.documentElement, 'dir')
  })

  expect(target.getAttribute('data-is-rtl')).toBe('false')
})

function Scenario2({
  containerDir,
  targetDir,
  when = true,
}: {
  containerDir?: 'ltr' | 'rtl'
  targetDir?: 'ltr' | 'rtl'
  when?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isRTL = useRTL({ ref, when })

  return (
    <div dir={containerDir}>
      <div data-is-rtl={isRTL} dir={targetDir} ref={ref} title="Target" />
    </div>
  )
}

test('defaults to closest `Element` with a `dir` attribute if referenced element does not have `dir` attribute', async () => {
  const { findByTitle } = render(<Scenario2 containerDir="rtl" />)

  const target = await findByTitle('Target')
  expect(target.getAttribute('data-is-rtl')).toBe('true')
})

test('defaults to referenced element if referenced element has `dir` attribute', async () => {
  const { findByTitle } = render(<Scenario2 containerDir="rtl" targetDir="ltr" />)

  const target = await findByTitle('Target')
  expect(target.getAttribute('data-is-rtl')).toBe('false')
})

test('changes to `dir` attribute on referenced element updates return value', async () => {
  const { findByTitle } = render(<Scenario2 targetDir="ltr" />)

  const target = await findByTitle('Target')
  expect(target.getAttribute('data-is-rtl')).toBe('false')

  act(() => {
    target.dir = 'rtl'
    MutationObserverStub.triggerAttributeChange(target, 'dir')
  })

  expect(target.getAttribute('data-is-rtl')).toBe('true')

  act(() => {
    target.dir = 'ltr'
    MutationObserverStub.triggerAttributeChange(target, 'dir')
  })

  expect(target.getAttribute('data-is-rtl')).toBe('false')
})

test('when disabled, retains return value and does not observe for changes', async () => {
  const { findByTitle } = render(<Scenario2 targetDir="rtl" when={false} />)

  const target = await findByTitle('Target')
  expect(target.getAttribute('data-is-rtl')).toBe('true')

  act(() => {
    target.dir = 'ltr'
    MutationObserverStub.triggerAttributeChange(target, 'dir')
  })

  expect(target.getAttribute('data-is-rtl')).toBe('true')
})

test('when unmounted, retains return value and does not observe for changes', async () => {
  const { findByTitle, unmount } = render(<Scenario2 targetDir="ltr" />)

  const target = await findByTitle('Target')
  expect(target.getAttribute('data-is-rtl')).toBe('false')

  unmount()

  act(() => {
    target.dir = 'ltr'
    MutationObserverStub.triggerAttributeChange(target, 'dir')
  })

  expect(target.getAttribute('data-is-rtl')).toBe('false')
})
