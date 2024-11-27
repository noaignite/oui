import { render } from '@testing-library/react'
import userEvents from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { expect, test } from 'vitest'
import { useDismiss } from './useDismiss'

function Scenario1() {
  const ref = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(true)

  useDismiss(ref, setOpen.bind(null, false), { when: open })

  return (
    <>
      <div>Outside</div>

      <div data-open={open} ref={ref} title="Container">
        <button type="button">Target</button>
      </div>
    </>
  )
}

test('detects clicks outside of element', async () => {
  const { findByTitle, findByText } = render(<Scenario1 />)

  const container = await findByTitle('Container')
  const target = await findByText('Target')
  const outside = await findByText('Outside')

  expect(container.getAttribute('data-open')).toBe('true')

  await userEvents.click(target)
  await userEvents.click(container)

  expect(container.getAttribute('data-open')).toBe('true')

  await userEvents.click(outside)

  expect(container.getAttribute('data-open')).toBe('false')
})

test('detects "Escape" keypress when focus is inside referenced element', async () => {
  const { findByTitle, findByText } = render(<Scenario1 />)

  const container = await findByTitle('Container')
  const target = await findByText('Target')

  await userEvents.keyboard('{Escape}')

  await userEvents.tab()
  expect(document.activeElement).toBe(target)

  expect(container.getAttribute('data-open')).toBe('true')

  await userEvents.keyboard('{Escape}')

  expect(container.getAttribute('data-open')).toBe('false')
})

test('on unmount, does not trigger dismiss events', async () => {
  const { findByTitle, findByText, unmount } = render(<Scenario1 />)

  const container = await findByTitle('Container')
  const outside = await findByText('Outside')

  unmount()

  await userEvents.click(outside)
  expect(container.getAttribute('data-open')).toBe('true')
  expect(container.hasAttribute('data-dismissible')).toBe(false)
})

function Scenario2() {
  const ref = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(true)

  useDismiss(ref, setOpen.bind(null, false), { when: open, keyboard: false, pointer: ['touch'] })

  return (
    <>
      <div>Outside</div>

      <div data-open={open} ref={ref} title="Container">
        <button type="button">Target</button>
      </div>
    </>
  )
}

test('respects configurable options', async () => {
  const { findByTitle, findByText } = render(<Scenario2 />)

  const container = await findByTitle('Container')
  const target = await findByText('Target')
  const outside = await findByText('Outside')

  await userEvents.tab()
  expect(document.activeElement).toBe(target)

  await userEvents.keyboard('{Escape}')
  await userEvents.pointer({ keys: '[MouseLeft]', target: outside })

  expect(container.getAttribute('data-open')).toBe('true')

  await userEvents.pointer({ keys: '[TouchA]', target: outside })
  expect(container.getAttribute('data-open')).toBe('false')
})

function Scenario3() {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const [innerOpen, setInnerOpen] = useState(true)
  const [outerOpen, setOuterOpen] = useState(true)

  useDismiss(outerRef, setOuterOpen.bind(null, false), { when: outerOpen })
  useDismiss(innerRef, setInnerOpen.bind(null, false), { when: innerOpen })

  return (
    <>
      <div>Outside</div>

      <div data-open={outerOpen} ref={outerRef} title="Outer Container">
        <div data-open={innerOpen} ref={innerRef} title="Inner Container">
          <button type="button">Target</button>
        </div>
      </div>
    </>
  )
}

test('nested instances of `useDismiss` do not interfere with each other', async () => {
  const { findByTitle, findByText } = render(<Scenario3 />)

  const outerContainer = await findByTitle('Outer Container')
  const innerContainer = await findByTitle('Inner Container')
  const target = await findByText('Target')
  const outside = await findByText('Outside')

  await userEvents.click(target)

  expect(outerContainer.getAttribute('data-open')).toBe('true')
  expect(innerContainer.getAttribute('data-open')).toBe('true')

  await userEvents.click(outside)

  expect(outerContainer.getAttribute('data-open')).toBe('true')
  expect(innerContainer.getAttribute('data-open')).toBe('false')
})
