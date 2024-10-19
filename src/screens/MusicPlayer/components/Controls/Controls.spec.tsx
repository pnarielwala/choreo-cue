import React from 'react'

import { fireEvent, renderWithProviders } from '__test-utils__/rntl'

import Controls, { PropsT } from './Controls'

const defaultProps: PropsT = {
  currentPosition: 0,
  isPlaying: false,
  pauseSound: jest.fn(),
  playSound: jest.fn(),
  setPosition: jest.fn(),
}

const doRender = (overrides: Partial<PropsT> = {}) =>
  renderWithProviders(<Controls {...defaultProps} {...overrides} />)

it('plays sound when Play button pressed', () => {
  const mockPlaySound = jest.fn()
  const { getByLabelText } = doRender({ playSound: mockPlaySound })

  fireEvent.press(getByLabelText('Play button'))

  expect(mockPlaySound).toHaveBeenCalled()
})
it('pauses sound when Pause button pressed', () => {
  const mockPauseSound = jest.fn()
  const { getByLabelText } = doRender({
    isPlaying: true,
    pauseSound: mockPauseSound,
  })

  fireEvent.press(getByLabelText('Pause button'))

  expect(mockPauseSound).toHaveBeenCalled()
})
it('setPosition called when skipped forward', () => {
  const mockSetPosition = jest.fn()
  const { getByLabelText } = doRender({
    setPosition: mockSetPosition,
    currentPosition: 25000,
  })

  fireEvent.press(getByLabelText('Skip forward 10 seconds'))

  expect(mockSetPosition).toHaveBeenCalledWith(35000)
})
it('setPosition called when skipped backward', () => {
  const mockSetPosition = jest.fn()
  const { getByLabelText } = doRender({
    setPosition: mockSetPosition,
    currentPosition: 25000,
  })

  fireEvent.press(getByLabelText('Skip back 10 seconds'))

  expect(mockSetPosition).toHaveBeenCalledWith(15000)
})
