import React from 'react'
import { Alert } from 'react-native'

import mockKnex from 'mock-knex'

import {
  fireEvent,
  renderWithProviders,
  waitFor,
  cleanup,
  act,
  screen,
} from '__test-utils__/rntl'

import Cues, { PropsT } from './Cues'

const defaultProps: PropsT = {
  currentPosition: 0,
  onPlayAudio: jest.fn(),
  onSeekToPosition: jest.fn(),
  audioId: 1,
}

afterEach(cleanup)

const doRender = (overrides: Partial<PropsT> = {}) =>
  renderWithProviders(<Cues {...defaultProps} {...overrides} />)

const tracker = mockKnex.getTracker()
tracker.install()

beforeEach(() => {
  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([])
    }
  })
})

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

  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([{ start: 23 * 1000, cue_number: 1 }])
    } else if (query.method === 'insert' && query.sql.includes('into `cues`')) {
      query.response([1])
    }
  })

  fireEvent(elements[1], 'onLongPress')

  await waitFor(() => expect(queryByText('0:23')).toBeOnTheScreen())
})

// todo - fix
it.skip('cue button sets current position from saved', async () => {
  const { queryAllByText, queryByText, rerender, getByText } = doRender({
    currentPosition: 23 * 1000, // 23 seconds
  })

  const elements = queryAllByText('Hold to Set')

  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([{ start: 23 * 1000, cue_number: 1 }])
    } else if (query.method === 'insert' && query.sql.includes('into `cues`')) {
      query.response([1])
    }
  })

  fireEvent(elements[1], 'onLongPress')

  await waitFor(() => expect(queryByText('0:23')).toBeOnTheScreen())

  rerender(<Cues {...defaultProps} currentPosition={50 * 1000} />) // position at 50 seconds

  fireEvent.press(getByText('0:23'))

  expect(defaultProps.onSeekToPosition).toHaveBeenCalledWith(23 * 1000)

  await new Promise((res) => setTimeout(res, 200))
  fireEvent.press(getByText('0:23'))

  expect(defaultProps.onPlayAudio).not.toHaveBeenCalled()
})

it('cue button sets current position from saved and plays the audio when double pressed', async () => {
  const { queryAllByText, queryByText, rerender, getByText } = doRender({
    currentPosition: 23 * 1000, // 23 seconds
  })

  const elements = queryAllByText('Hold to Set')

  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([{ start: 23 * 1000, cue_number: 1 }])
    } else if (query.method === 'insert' && query.sql.includes('into `cues`')) {
      query.response([1])
    }
  })

  fireEvent(elements[1], 'onLongPress')

  await waitFor(() => expect(queryByText('0:23')).toBeOnTheScreen())

  rerender(<Cues {...defaultProps} currentPosition={50 * 1000} />) // position at 50 seconds

  fireEvent.press(getByText('0:23'))
  fireEvent.press(getByText('0:23'))

  expect(defaultProps.onSeekToPosition).toHaveBeenCalledWith(23 * 1000)
  expect(defaultProps.onPlayAudio).toHaveBeenCalled()
})

// TODO: using custom modal instead of Alert
it.skip('all cue buttons are reset', async () => {
  const { queryAllByText, queryByText, getByText } = doRender({
    currentPosition: 23 * 1000, // 23 seconds
  })

  const elements = queryAllByText('Hold to Set')

  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([{ start: 23 * 1000, cue_number: 1 }])
    } else if (query.method === 'insert' && query.sql.includes('into `cues`')) {
      query.response([1])
    }
  })

  fireEvent(elements[1], 'onLongPress')

  await waitFor(() => expect(queryByText('0:23')).toBeOnTheScreen())

  tracker.on('query', (query) => {
    if (query.method === 'delete' && query.sql.includes('from `cues`')) {
      query.response(1)
    } else if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([])
    }
  })

  let mockReset

  jest
    .spyOn(Alert, 'alert')
    .mockImplementationOnce((...args) => (mockReset = args[2]?.[1].onPress))
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

  await act(async () => await mockReset?.())

  const resetButton = await screen.findByText('Reset')

  fireEvent.press(resetButton)

  await act(
    async () =>
      await waitFor(() => expect(queryByText('0:23')).not.toBeOnTheScreen())
  )
})
