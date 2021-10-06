import React from 'react'
import { Alert } from 'react-native'

import {
  fireEvent,
  renderWithProviders,
  waitFor,
  cleanup,
  act,
} from '__test-utils__/rntl'

import Cues, { PropsT } from './Cues'

const defaultProps: PropsT = {
  currentPosition: 0,
  onPlayFromPosition: jest.fn(),
}

afterEach(cleanup)

const doRender = (overrides: Partial<PropsT> = {}) =>
  renderWithProviders(<Cues {...defaultProps} {...overrides} />)

it('displays 4 buttons', () => {
  const { queryAllByText } = doRender()

  const elements = queryAllByText('Hold to Set')

  expect(elements).toHaveLength(4)
})
it('cue button saves current position', async () => {
  const { queryAllByText, queryByText } = doRender({
    currentPosition: 23 * 1000, // 23 seconds
  })

  const elements = queryAllByText('Hold to Set')

  fireEvent(elements[1], 'onLongPress')

  await waitFor(() => expect(queryByText('0:23')).toBeDefined())
})
it('cue button sets current position from saved', async () => {
  const { queryAllByText, queryByText, rerender, getByText } = doRender({
    currentPosition: 23 * 1000, // 23 seconds
  })

  const elements = queryAllByText('Hold to Set')

  fireEvent(elements[1], 'onLongPress')

  await waitFor(() => expect(queryByText('0:23')).toBeDefined())

  rerender(<Cues {...defaultProps} currentPosition={50 * 1000} />) // position at 50 seconds

  fireEvent.press(getByText('0:23'))

  expect(defaultProps.onPlayFromPosition).toHaveBeenCalledWith(23 * 1000)
})
it('all cue buttons are reset', async () => {
  const { queryAllByText, queryByText, getByText } = doRender({
    currentPosition: 23 * 1000, // 23 seconds
  })

  const elements = queryAllByText('Hold to Set')

  fireEvent(elements[1], 'onLongPress')

  await waitFor(() => expect(queryByText('0:23')).toBeDefined())

  jest
    .spyOn(Alert, 'alert')
    .mockImplementationOnce((...args) => args[2]?.[1].onPress?.())
  act(() => fireEvent.press(getByText('Reset Cues')))

  expect(Alert.alert).toHaveBeenCalledWith(
    'Are you sure?',
    'This will clear all your cues',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      expect.objectContaining({
        text: 'Reset',
        style: 'destructive',
      }),
    ]
  )

  await act(
    async () => await waitFor(() => expect(queryByText('0:23')).toBeNull())
  )
})
