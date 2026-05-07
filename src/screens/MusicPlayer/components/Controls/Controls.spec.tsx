import React from 'react'

import { fireEvent, renderWithProviders } from '__test-utils__/rntl'

import Controls, { PropsT } from './Controls'

const defaultProps: PropsT = {
  currentPosition: 0,
  isPlaying: false,
  pauseSound: jest.fn(),
  playSound: jest.fn(),
  setPosition: jest.fn(),
  repeatMode: 'off',
  onCycleRepeatMode: jest.fn(),
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
it('jumps to beginning when Jump to beginning pressed', () => {
  const mockSetPosition = jest.fn()
  const { getByLabelText } = doRender({
    setPosition: mockSetPosition,
    currentPosition: 25000,
  })

  fireEvent.press(getByLabelText('Jump to beginning'))

  expect(mockSetPosition).toHaveBeenCalledWith(0)
})
it('cycles repeat mode when repeat button pressed', () => {
  const mockCycle = jest.fn()
  const { getByLabelText } = doRender({
    repeatMode: 'off',
    onCycleRepeatMode: mockCycle,
  })

  fireEvent.press(getByLabelText('Repeat: off'))

  expect(mockCycle).toHaveBeenCalled()
})
it('shows the song repeat label when in song mode', () => {
  const { getByLabelText } = doRender({ repeatMode: 'song' })

  expect(getByLabelText('Repeat: song')).toBeTruthy()
})
it('shows the back-to-cue repeat label when in cue mode', () => {
  const { getByLabelText } = doRender({ repeatMode: 'cue' })

  expect(getByLabelText('Repeat: back to cue')).toBeTruthy()
})
