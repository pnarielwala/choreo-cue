import React from 'react'

import { renderWithProviders } from '__test-utils__/rntl'

import TrackSlider, { PropsT } from './TrackSlider'

const defaultProps: PropsT = {
  currentPosition: 0,
  disabled: false,
  duration: 4 * 60 * 1000, // 4 minutes
  onPositionChange: jest.fn(),
}

const doRender = (overrides: Partial<PropsT> = {}) =>
  renderWithProviders(<TrackSlider {...defaultProps} {...overrides} />)

it('should reflect the current position and remaining seconds', async () => {
  const { queryByText } = doRender({
    currentPosition: 1 * 60 * 1000 + 23 * 1000,
    duration: 4 * 60 * 1000, // 4 minutes
  })

  expect(queryByText('1:23')).toBeDefined()
  expect(queryByText('2:37')).toBeDefined()
})
