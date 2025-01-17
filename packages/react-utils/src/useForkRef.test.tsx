/* eslint-disable @typescript-eslint/no-explicit-any -- No need to be strict here */

import { render, screen, type RenderResult } from '@testing-library/react'
import {
  cloneElement,
  createRef,
  forwardRef,
  useCallback,
  useState,
  type ReactElement,
  type Ref,
} from 'react'
import { describe, expect, it } from 'vitest'
import { getReactElementRef } from './getReactElementRef'
import { useForkRef } from './useForkRef'

describe('useForkRef', () => {
  it('returns a single ref-setter function that forks the ref to its inputs', () => {
    function Component(props: { innerRef: Ref<any> }) {
      const { innerRef } = props
      const [ref, setRef] = useState<HTMLDivElement | null>(null)

      const handleRef = useForkRef(innerRef, setRef)

      return <div ref={handleRef}>{ref ? 'has a ref' : 'has no ref'}</div>
    }

    const outerRef = createRef<HTMLDivElement | null>()

    expect(() => {
      render(<Component innerRef={outerRef} />)
    }).not.toThrow()
    expect(outerRef.current?.textContent).to.equal('has a ref')
  })

  it('forks if only one of the branches requires a ref', () => {
    const Component = forwardRef(function Component(_props, ref) {
      const [hasRef, setHasRef] = useState(false)
      const handleOwnRef = useCallback(() => {
        setHasRef(true)
      }, [])
      const handleRef = useForkRef(handleOwnRef, ref)

      return (
        <div data-testid="hasRef" ref={handleRef}>
          {String(hasRef)}
        </div>
      )
    })

    expect(() => {
      render(<Component />)
    }).not.toThrow()

    expect(screen.getByTestId('hasRef').textContent).toBe('true')
  })

  it('does nothing if none of the forked branches requires a ref', () => {
    const Outer = forwardRef(function Outer(props: { children: ReactElement<any> }, ref) {
      const { children } = props
      const handleRef = useForkRef(getReactElementRef(children), ref)

      return cloneElement(children, { ref: handleRef })
    })

    function Inner() {
      return <div />
    }

    expect(() => {
      render(
        <Outer>
          <Inner />
        </Outer>,
      )
    }).not.toThrow()
  })

  describe('changing refs', () => {
    function Div(props: { id: string; leftRef?: Ref<any>; rightRef?: Ref<any> }) {
      const { id, leftRef, rightRef } = props
      const handleRef = useForkRef(leftRef, rightRef)

      return <div id={id} ref={handleRef} />
    }

    it('handles changing from no ref to some ref', () => {
      const element = <Div id="test" />
      let view: RenderResult

      expect(() => {
        view = render(element)
      }).not.toThrow()

      const ref = createRef<HTMLDivElement | null>()
      expect(() => {
        view.rerender(cloneElement(element, { leftRef: ref }))
      }).not.toThrow()
      expect(ref.current?.id).toEqual('test')
    })

    it('cleans up detached refs', () => {
      const firstLeftRef = createRef<HTMLDivElement | null>()
      const firstRightRef = createRef<HTMLDivElement | null>()
      const secondRightRef = createRef<HTMLDivElement | null>()
      const element = <Div id="test" leftRef={firstLeftRef} rightRef={firstRightRef} />
      let view: RenderResult

      expect(() => {
        view = render(element)
      }).not.toThrow()

      expect(firstLeftRef.current?.id).toEqual('test')
      expect(firstRightRef.current?.id).toEqual('test')
      expect(secondRightRef.current).toEqual(null)

      expect(() => {
        view.rerender(cloneElement(element, { rightRef: secondRightRef }))
      }).not.toThrow()

      expect(firstLeftRef.current?.id).toEqual('test')
      expect(firstRightRef.current).toEqual(null)
      expect(secondRightRef.current?.id).toEqual('test')
    })
  })
})
