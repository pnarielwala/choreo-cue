import React from 'react'

import { renderWithProviders, screen, fireEvent } from '__test-utils__/rntl'

import Tempo, { PropsT } from './Tempo'

const defaultProps: PropsT = {
  setRate: jest.fn(),
}

const doRender = (overrides: Partial<PropsT> = {}) =>
  renderWithProviders(<Tempo {...defaultProps} {...overrides} />)

describe('Tempo', () => {
  it('renders correctly', () => {
    doRender()

    expect(screen.getByText('Tempo')).toBeTruthy()
    expect(screen.getByText('1x')).toBeTruthy()
  })

  it('calls setRate with the correct value when slider value changes', () => {
    const setRateMock = jest.fn()
    doRender({ setRate: setRateMock })

    const slider = screen.getByTestId('tempo-slider')
    fireEvent(slider, 'onValueChange', 1.2)

    expect(setRateMock).toHaveBeenCalledWith(1.2)
    expect(screen.getByText('1.2x')).toBeTruthy()
  })

  it('updates the tempo text when slider value changes', () => {
    doRender()

    const slider = screen.getByTestId('tempo-slider')
    fireEvent(slider, 'onValueChange', 0.8)

    expect(screen.getByText('0.8x')).toBeTruthy()
  })

  it('renders with the correct initial tempo value', () => {
    doRender()

    const slider = screen.getByTestId('tempo-slider')

    expect(slider.props.value).toBe(1)
  })

  it('applies the correct styles from the theme', () => {
    doRender()

    const slider = screen.getByTestId('tempo-slider')

    expect(slider.props.minimumTrackTintColor).toBeDefined()
    expect(slider.props.maximumTrackTintColor).toBeDefined()
    expect(slider.props.thumbTintColor).toBeDefined()
  })
})
