import * as React from 'react'
import { screen } from '@testing-library/react'
import { createRender, describeConformance } from 'test/utils'
import TestProvider from '../../test/TestProvider'
import InView from './InView'

describe('<InView />', () => {
  const render = createRender({ wrapper: TestProvider })

  describeConformance(<InView />, () => ({
    inheritComponent: 'div',
    refInstanceof: window.HTMLDivElement,
    render,
    testComponentPropWith: 'span',
    skip: ['rootClass'],
  }))

  describe('should render with', () => {
    it('content of nested children', () => {
      render(
        <InView data-testid="root">
          <img src="foo.jpg" alt="" data-testid="img" />
        </InView>,
      )
      expect(screen.getByTestId('img')).toBeInTheDocument()
    })
  })
})
