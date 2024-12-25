'use client'

import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useIsomorphicEffect } from './useIsomorphicEffect'

export type UseIntersectionObserverCallback = (entry: IntersectionObserverEntry) => void

export type IntersectionObserverOptions = IntersectionObserverInit & {
  /**
   * A `boolean` indicating whether the hook is enabled.
   *
   * @defaultValue true
   */
  when?: boolean
  /**
   * A `boolean` indicating whether the first intersection should terminate the observer.
   *
   * @defaultValue false
   */
  once?: boolean
}

/**
 * Registers an `IntersectionObserver` on `ref` and executes `callback` when
 * the observed element intersects with the `root` element.
 *
 * @param ref - A `RefObject` of the element to observe.
 * @param callback - A function to execute when the observed element intersection changes.
 * @param options - Configurable options
 *
 * @returns void
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLSpanElement>(null);
 * const [shouldLoadImage, setShouldLoadImage] = useState(false);
 *
 * useIntersectionObserver(ref, (entry) => {
 *   setShouldLoadImage(entry.isIntersecting);
 * }, { once: true })
 * ```
 */
export const useIntersectionObserver = (
  ref: RefObject<Element | null>,
  callback: UseIntersectionObserverCallback,
  { when = true, once = false, root, rootMargin, threshold }: IntersectionObserverOptions = {},
) => {
  const [isTerminated, setIsTerminated] = useState(false)

  const savedCallback = useRef(callback)
  useIsomorphicEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!when || isTerminated) return

    const element = ref.current
    if (!(element instanceof Element)) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        savedCallback.current(entry)
        setIsTerminated(Boolean(entry.isIntersecting && once))
      },
      { root, rootMargin, threshold },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- Compare threshold as string
  }, [ref, when, isTerminated, once, root, rootMargin, JSON.stringify(threshold)])
}
