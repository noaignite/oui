import { render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useRef, useState } from 'react'
import { expect, test } from 'vitest'
import { useFocusReturn } from './useFocusReturn'

function Scenario1() {
  const [isInitiated, setIsInitiated] = useState(false)

  const initiate = setIsInitiated.bind(null, true)
  const terminate = setIsInitiated.bind(null, false)

  useFocusReturn(isInitiated)

  return (
    <>
      <button type="button">Filler 1</button>

      <button onClick={initiate} type="button">
        Initiator
      </button>

      <button type="button">Filler 2</button>
      <button type="button">Filler 3</button>

      <button onClick={terminate} type="button">
        Terminator
      </button>

      <button type="button">Filler 4</button>
    </>
  )
}

test('returns focus to the initiator', async () => {
  const { findByText } = render(<Scenario1 />)

  const initiator = await findByText('Initiator')

  await userEvent.click(initiator)

  await userEvent.tab()
  await userEvent.tab()
  await userEvent.tab()

  if (document.activeElement) await userEvent.click(document.activeElement)
  expect(document.activeElement).toBe(initiator)
})

function Scenario2() {
  const ref = useRef<HTMLButtonElement>(null)

  const [isInitiated, setIsInitiated] = useState(false)

  const initiate = setIsInitiated.bind(null, true)
  const terminate = setIsInitiated.bind(null, false)

  useFocusReturn(isInitiated, { returnTo: ref })

  return (
    <>
      <button ref={ref} type="button">
        Receiver
      </button>

      <button onClick={initiate} type="button">
        Initiator
      </button>

      <button type="button">Filler 1</button>
      <button type="button">Filler 2</button>

      <button onClick={terminate} type="button">
        Terminator
      </button>

      <button type="button">Filler 3</button>
    </>
  )
}

test('returns focus to `returnTo` receiver', async () => {
  const { findByText } = render(<Scenario2 />)

  const initiator = await findByText('Initiator')

  await userEvent.click(initiator)

  await userEvent.tab()
  await userEvent.tab()
  await userEvent.tab()

  if (document.activeElement) await userEvent.click(document.activeElement)
  expect(document.activeElement).toBe(await findByText('Receiver'))
})

function Scenario3() {
  const [isInitiated, setIsInitiated] = useState(false)

  const initiate = setIsInitiated.bind(null, true)
  const terminate = setIsInitiated.bind(null, false)

  useFocusReturn(isInitiated)

  return (
    <>
      <button disabled={isInitiated} onClick={initiate} type="button">
        Initiator
      </button>

      <button onClick={terminate} type="button">
        Terminator
      </button>
    </>
  )
}

test('returns focus after state update re-enables the initiator', async () => {
  const { findByText } = render(<Scenario3 />)

  const initiator = await findByText('Initiator')

  await userEvent.click(initiator)

  await userEvent.tab()

  if (document.activeElement) await userEvent.click(document.activeElement)
  expect(document.activeElement).toBe(initiator)
})
