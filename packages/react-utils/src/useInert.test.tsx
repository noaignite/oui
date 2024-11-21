import { render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { expect, test } from 'vitest'
import { useFocusReturn } from './useFocusReturn'
import { useInert } from './useInert'

/**
 * Focuses the next _actually_ focusable element.
 * Needed, since `@testing-library/user-event` does not take `inert` elements
 * into account when simulating `.tab()`.
 *
 * Should not break if they add support for inert elements in the future.
 */
const tab = async () => {
  let isFound

  do {
    await userEvent.tab()

    const active = document.activeElement

    if (!active?.hasAttribute('inert')) {
      isFound = true
    }
  } while (!isFound)
}

function Scenario1() {
  const scopeRef = useRef<HTMLDivElement>(null)

  const [isInitiated, setIsInitiated] = useState(false)

  useFocusReturn(isInitiated)
  useInert(isInitiated, scopeRef)

  const initiate = setIsInitiated.bind(null, true)
  const terminate = setIsInitiated.bind(null, false)

  return (
    <>
      <style title="Excluded" />
      <template title="Excluded" />

      <button onClick={initiate} type="button">
        Initiator
      </button>

      <button type="button">Filler</button>

      <div ref={scopeRef} title="Scope">
        <button onClick={terminate} type="button">
          Terminator
        </button>
      </div>
    </>
  )
}

test('applies inert to all elements except scope', async () => {
  const { findByText, findByTitle } = render(<Scenario1 />)

  const initiator = await findByText('Initiator')
  const scope = await findByTitle('Scope')
  const filler = await findByText('Filler')

  await userEvent.click(initiator)

  expect([initiator, filler].every((e) => e.hasAttribute('inert'))).toBe(true)
  expect(scope.hasAttribute('data-inert-exclude')).toBe(true)
})

test('does not apply inert on a select few elements outside scope', async () => {
  const { findByText, findAllByTitle } = render(<Scenario1 />)

  const initiator = await findByText('Initiator')
  const excluded = await findAllByTitle('Excluded')

  await userEvent.click(initiator)

  expect(
    excluded.every((e) => !e.hasAttribute('inert') && !e.hasAttribute('data-inert-exclude')),
  ).toBe(true)
})

test('when disabled, reverts DOM manipulations made by `useInert`', async () => {
  const { findByText, findByTitle } = render(<Scenario1 />)

  const initiator = await findByText('Initiator')
  const terminator = await findByText('Terminator')
  const scope = await findByTitle('Scope')

  await userEvent.click(initiator)

  expect(initiator.hasAttribute('inert')).toBe(true)
  expect(scope.hasAttribute('data-inert-exclude')).toBe(true)

  await userEvent.click(terminator)

  expect(initiator.hasAttribute('inert')).toBe(false)
  expect(scope.hasAttribute('data-inert-exclude')).toBe(false)
})

test('on unmount, reverts DOM manipulations made by `useInert`', async () => {
  const { findByText, findByTitle, unmount } = render(<Scenario1 />)

  const initiator = await findByText('Initiator')
  const scope = await findByTitle('Scope')

  await userEvent.click(initiator)

  expect(initiator.hasAttribute('inert')).toBe(true)
  expect(scope.hasAttribute('data-inert-exclude')).toBe(true)

  unmount()

  expect(initiator.hasAttribute('inert')).toBe(false)
  expect(scope.hasAttribute('data-inert-exclude')).toBe(false)
})

test('with `useFocusReturn`, return focus to initiator', async () => {
  const { findByText } = render(<Scenario1 />)

  const initiator = await findByText('Initiator')
  const terminator = await findByText('Terminator')

  await userEvent.click(initiator)
  await tab()

  expect(document.activeElement).toBe(terminator)

  await userEvent.click(terminator)

  expect(document.activeElement).toBe(initiator)
})

function Scenario2() {
  const scopeOuterRef = useRef<HTMLDivElement>(null)
  const scopeInnerRef = useRef<HTMLDivElement>(null)

  const [isOuterInitiated, setIsOuterInitiated] = useState(false)
  const [isInnerInitiated, setIsInnerInitiated] = useState(false)

  useFocusReturn(isOuterInitiated)
  useFocusReturn(isInnerInitiated)

  useInert(isOuterInitiated, scopeOuterRef)
  useInert(isInnerInitiated, scopeInnerRef)

  const methods = {
    outer: {
      disable: setIsOuterInitiated.bind(null, false),
      enable: setIsOuterInitiated.bind(null, true),
    },
    inner: {
      disable: setIsInnerInitiated.bind(null, false),
      enable: setIsInnerInitiated.bind(null, true),
    },
    all: {
      disable: () => {
        methods.outer.disable()
        methods.inner.disable()
      },
      enable: () => {
        methods.outer.enable()
        methods.inner.enable()
      },
    },
  }

  return (
    <>
      <button onClick={methods.outer.enable} type="button">
        Outer Initiator
      </button>

      <button onClick={methods.all.enable} type="button">
        Initiator
      </button>

      <div ref={scopeOuterRef} title="Scope 1">
        <button onClick={methods.inner.enable} type="button">
          Inner Initiator
        </button>

        <button onClick={methods.outer.disable} type="button">
          Outer Terminator
        </button>

        <div ref={scopeInnerRef} title="Scope 2">
          <button onClick={methods.inner.disable} type="button">
            Inner Terminator
          </button>

          <button onClick={methods.all.disable} type="button">
            Terminator
          </button>
        </div>
      </div>
    </>
  )
}

test('applies and manages multiple `useInert` instance scopes', async () => {
  const { findByText, findByTitle } = render(<Scenario2 />)

  const initiator = await findByText('Initiator')
  const outerInitiator = await findByText('Outer Initiator')
  const innerInitiator = await findByText('Inner Initiator')

  const scope1 = await findByTitle('Scope 1')
  const scope2 = await findByTitle('Scope 2')

  const outerTerminator = await findByText('Outer Terminator')
  const innerTerminator = await findByText('Inner Terminator')

  await userEvent.click(outerInitiator)
  await tab()

  expect(document.activeElement).toBe(innerInitiator)
  expect(initiator.hasAttribute('inert')).toBe(true)
  expect(scope1.hasAttribute('data-inert-exclude')).toBe(true)
  expect(scope2.hasAttribute('data-inert-exclude')).toBe(false)

  await tab()
  expect(document.activeElement).toBe(outerTerminator)

  await tab()
  expect(document.activeElement).toBe(innerTerminator)

  await userEvent.click(innerInitiator)
  await tab()

  expect(document.activeElement).toBe(innerTerminator)
  expect(initiator.hasAttribute('inert')).toBe(true)
  expect(innerInitiator.hasAttribute('inert')).toBe(true)
  expect(scope1.hasAttribute('data-inert-exclude')).toBe(true)
  expect(scope2.hasAttribute('data-inert-exclude')).toBe(true)
})

test('reverts subset of DOM manipulations when some `useInert` instances are disabled', async () => {
  const { findByText, findByTitle } = render(<Scenario2 />)

  const initiator = await findByText('Initiator')
  const outerInitiator = await findByText('Outer Initiator')
  const innerInitiator = await findByText('Inner Initiator')

  const scope1 = await findByTitle('Scope 1')
  const scope2 = await findByTitle('Scope 2')

  const innerTerminator = await findByText('Inner Terminator')

  await userEvent.click(initiator)
  await tab()

  expect(document.activeElement).toBe(innerTerminator)
  expect(initiator.hasAttribute('inert')).toBe(true)
  expect(outerInitiator.hasAttribute('inert')).toBe(true)
  expect(innerInitiator.hasAttribute('inert')).toBe(true)

  await userEvent.click(innerTerminator)

  expect(scope1.hasAttribute('data-inert-exclude')).toBe(true)
  expect(scope2.hasAttribute('data-inert-exclude')).toBe(false)
  expect(initiator.hasAttribute('inert')).toBe(true)
  expect(outerInitiator.hasAttribute('inert')).toBe(true)
  expect(innerInitiator.hasAttribute('inert')).toBe(false)
})

test('reverts DOM manipulations after all `useInert` instances are disabled', async () => {
  const { findByText, findByTitle } = render(<Scenario2 />)

  const initiator = await findByText('Initiator')
  const outerInitiator = await findByText('Outer Initiator')
  const innerInitiator = await findByText('Inner Initiator')

  const scope1 = await findByTitle('Scope 1')
  const scope2 = await findByTitle('Scope 2')

  const terminator = await findByText('Terminator')
  const outerTerminator = await findByText('Outer Terminator')
  const innerTerminator = await findByText('Inner Terminator')

  await userEvent.click(initiator)

  expect(initiator.hasAttribute('inert')).toBe(true)
  expect(outerInitiator.hasAttribute('inert')).toBe(true)
  expect(innerInitiator.hasAttribute('inert')).toBe(true)
  expect(scope1.hasAttribute('data-inert-exclude')).toBe(true)
  expect(scope2.hasAttribute('data-inert-exclude')).toBe(true)

  await userEvent.click(terminator)

  expect(initiator.hasAttribute('inert')).toBe(false)
  expect(outerInitiator.hasAttribute('inert')).toBe(false)
  expect(innerInitiator.hasAttribute('inert')).toBe(false)
  expect(scope1.hasAttribute('data-inert-exclude')).toBe(false)
  expect(scope2.hasAttribute('data-inert-exclude')).toBe(false)

  await userEvent.click(outerInitiator)
  await userEvent.click(innerInitiator)
  await userEvent.click(innerTerminator)
  await userEvent.click(outerTerminator)

  expect(initiator.hasAttribute('inert')).toBe(false)
  expect(outerInitiator.hasAttribute('inert')).toBe(false)
  expect(innerInitiator.hasAttribute('inert')).toBe(false)
  expect(scope1.hasAttribute('data-inert-exclude')).toBe(false)
  expect(scope2.hasAttribute('data-inert-exclude')).toBe(false)
})

test('with `useFocusReturn`, return focus to correct initiator per `useInert` instance', async () => {
  const { findByText } = render(<Scenario2 />)

  const outerInitiator = await findByText('Outer Initiator')
  const innerInitiator = await findByText('Inner Initiator')

  const outerTerminator = await findByText('Outer Terminator')
  const innerTerminator = await findByText('Inner Terminator')

  await tab()

  expect(document.activeElement).toBe(outerInitiator)

  await userEvent.click(outerInitiator)
  await tab()

  expect(document.activeElement).toBe(innerInitiator)

  await userEvent.click(innerInitiator)
  await tab()

  expect(document.activeElement).toBe(innerTerminator)

  await userEvent.click(innerTerminator)

  expect(document.activeElement).toBe(innerInitiator)

  await userEvent.click(outerTerminator)

  expect(document.activeElement).toBe(outerInitiator)
})
