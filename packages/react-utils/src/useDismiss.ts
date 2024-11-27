'use client'

import type { HintedString } from '@noaignite/types'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { useEvent } from './useEvent'
import { useIsomorphicEffect } from './useIsomorphicEffect'

export type DismissOptions = {
  /**
   * A `boolean` indicating whether to listen for `keydown` events involving `Escape` key.
   *
   * @defaultValue true
   */
  keyboard?: boolean
  /**
   * A `boolean` indicating whether to listen for `pointerdown` events.
   * Can be set to listen for any pointer type, or restricted to a specific type(s).
   *
   * @defaultValue true
   */
  pointer?:
    | boolean
    | HintedString<'mouse' | 'touch' | 'pen'>
    | HintedString<'mouse' | 'touch' | 'pen'>[]
  /**
   * A `boolean` indicating whether the hook is enabled.
   *
   * @defaultValue true
   */
  when?: boolean
}

/**
 * Executes `callback` when a `keydown` event involving the `Escape` key or a `pointerdown` event
 * occurs outside of passed `ref` element. Useful when creating components, like dialogs, popovers,
 * dropdowns, etc., that should be dismissed when the user interacts outside of them.
 *
 * @param ref - Element reference to base events on.
 * @param callback - Callback to execute when a `keydown` or `pointerdown` event occurs.
 * @param options - Configurable options
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null)
 * const [isOpen, setIsOpen] = useState(false)
 *
 * useDismiss(ref, setIsOpen.bind(null, false), { when: isOpen })
 *
 * return (
 *   <>
 *     <button type="button" onClick={() => setIsOpen(true)}>Open</button>
 *     {isOpen && (<div ref={ref}>Content</div>)}
 *   </>
 * )
 * ```
 */
export const useDismiss = (
  ref: RefObject<Element | null>,
  callback: (event: PointerEvent | KeyboardEvent) => void,
  { when = true, keyboard = true, pointer = true }: DismissOptions = {},
) => {
  const savedCallback = useRef(callback)
  useIsomorphicEffect(() => {
    savedCallback.current = callback
  }, [callback])

  const handleKeydown = useCallback((event: KeyboardEvent) => {
    if (event.defaultPrevented) return

    const { key } = event
    if (key !== 'Escape') return

    savedCallback.current(event)
    event.preventDefault()
  }, [])

  useEvent(ref, 'keydown', handleKeydown, { when: Boolean(when && keyboard) })

  const handlePointerdown = useCallback(
    (event: PointerEvent) => {
      const element = ref.current
      const target = event.target

      if (!(element instanceof Element) || !(target instanceof Element)) return
      if (Array.isArray(pointer) && !pointer.includes(event.pointerType)) return
      if (typeof pointer === 'string' && event.pointerType !== pointer) return
      if (element.closest('[inert]') ?? element.contains(target)) return
      if (element.querySelector('[data-dismissible]')) return
      if (event.button !== 0) return

      savedCallback.current(event)
      event.preventDefault()
    },
    [ref, pointer],
  )

  useEvent('window', 'pointerdown', handlePointerdown, {
    when: Boolean(when && pointer),
  })

  useEffect(() => {
    if (!when) return

    const element = ref.current
    if (!element) return

    element.setAttribute('data-dismissible', 'true')
    return () => {
      element.removeAttribute('data-dismissible')
    }
  }, [ref, when])
}
