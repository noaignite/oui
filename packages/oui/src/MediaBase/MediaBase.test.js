import * as React from 'react'
import { createRender, describeConformance, getClasses } from 'test/utils'
import TestProvider from '../../test/TestProvider'
import MediaBase from './MediaBase'

describe('<MediaBase />', () => {
  const render = createRender({ wrapper: TestProvider })
  let classes

  beforeEach(() => {
    classes = getClasses(<MediaBase src="/foo.jpg" />, render)
  })

  describeConformance(<MediaBase src="/foo.jpg" />, () => ({
    classes,
    inheritComponent: 'img',
    refInstanceof: window.HTMLImageElement,
    render,
    testComponentPropWith: 'picture',
  }))

  describe('should render with', () => {
    it('the `src` attribute specified', () => {
      const { getByTestId } = render(<MediaBase src="/foo.jpg" data-testid="root" />)
      expect(getByTestId('root')).toHaveAttribute('src', '/foo.jpg')
    })

    it('no `src` attribute when `lazy` is specified', () => {
      const { getByTestId } = render(<MediaBase src="/foo.jpg" lazy data-testid="root" />)
      expect(getByTestId('root')).not.toHaveAttribute('src', '/foo.jpg')
    })

    it('content of nested children', () => {
      const { getByTestId } = render(
        <MediaBase component="picture" data-testid="root">
          <img src="foo.jpg" alt="" data-testid="img" />
        </MediaBase>,
      )
      expect(getByTestId('img')).toBeInTheDocument()
    })
  })
})
