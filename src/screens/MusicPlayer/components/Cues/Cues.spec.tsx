import React from 'react'

import mockKnex from 'mock-knex'

import {
  fireEvent,
  renderWithProviders,
  waitFor,
  cleanup,
} from '__test-utils__/rntl'

import Cues, { PropsT } from './Cues'

const defaultProps: PropsT = {
  currentPosition: 0,
  onSeekToCue: jest.fn(),
  onPlayCue: jest.fn(),
  audioId: 1,
}

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

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
    currentPosition: 23 * 1000,
  })

  const elements = queryAllByText('Hold to Set')

  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([
        {
          id: 1,
          audio_id: 1,
          start: 23 * 1000,
          cue_number: 1,
          label: null,
          loop_duration_ms: null,
          order_index: 1,
        },
      ])
    } else if (query.method === 'insert' && query.sql.includes('into `cues`')) {
      query.response([1])
    }
  })

  fireEvent(elements[1], 'onLongPress')

  await waitFor(() => expect(queryByText('0:23')).toBeOnTheScreen())
})

it('double-tapping a saved cue triggers onPlayCue', async () => {
  const onSeekToCue = jest.fn()
  const onPlayCue = jest.fn()
  const { queryByText } = doRender({
    currentPosition: 50 * 1000,
    onSeekToCue,
    onPlayCue,
  })

  // Render with a pre-existing cue
  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([
        {
          id: 7,
          audio_id: 1,
          start: 23 * 1000,
          cue_number: 1,
          label: null,
          loop_duration_ms: null,
          order_index: 1,
        },
      ])
    }
  })

  // Wait for the cue to render
  await waitFor(() => expect(queryByText('0:23')).toBeOnTheScreen())

  const cueLabel = queryByText('Cue 1')!
  fireEvent.press(cueLabel)
  fireEvent.press(cueLabel)

  expect(onSeekToCue).toHaveBeenCalledWith(
    expect.objectContaining({ id: 7, start: 23 * 1000 })
  )
  expect(onPlayCue).toHaveBeenCalledWith(
    expect.objectContaining({ id: 7, start: 23 * 1000 })
  )
})
