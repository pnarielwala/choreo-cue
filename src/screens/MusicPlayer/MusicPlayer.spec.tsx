import React from 'react'

import { Text, Pressable } from 'design'

import MusicPlayer from './MusicPlayer'
import { ScreenPropsT, StacksT } from 'App'
import { createStackNavigator } from '@react-navigation/stack'
import {
  fireEvent,
  renderWithProviders,
  waitFor,
  cleanup,
  screen,
  within,
} from '__test-utils__/rntl'
import mockKnex from 'mock-knex'

import { act } from 'react-test-renderer'

afterEach(cleanup)

type ScreenParamsT = ScreenPropsT<'Player'>['route']['params']

const Stack = createStackNavigator<StacksT>()

const doRenderWithProviders = (
  initialParams: ScreenParamsT = {
    musicData: { name: 'Hello world.mp3', uri: '', id: 1 },
  },
  initialRouteName: keyof StacksT = 'Player'
) => {
  return renderWithProviders(
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen
        name="Player"
        initialParams={initialParams}
        component={MusicPlayer}
      />
      <Stack.Screen name="Home">
        {({ navigation }) => (
          <Pressable onPress={() => navigation.push('Player', initialParams)}>
            <Text>Go to player</Text>
          </Pressable>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const tracker = mockKnex.getTracker()
tracker.install()

beforeEach(() => {
  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([])
    } else if (query.sql.includes('select * from `audio`')) {
      query.response([
        {
          id: 1,
          name: 'Toosie Slide - Drake.mp3',
          path: 'file://some-music.mp3',
          source: 'iCloud',
        },
      ])
    }
  })
})

it('should display audio title', async () => {
  doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '', id: 1 },
  })

  await waitFor(() => {
    expect(screen.getByText('Toosie Slide - Drake.mp3')).toBeOnTheScreen()
  })
})

it('should play and pause audio', async () => {
  doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '', id: 1 },
  })

  await waitFor(() => {
    expect(screen.getByText('0:00')).toBeDefined()
  })

  const playButton = await screen.findByRole('button', {
    name: 'Play button',
    disabled: false,
  })
  await act(async () => {
    fireEvent.press(playButton)

    await new Promise((res) => {
      setTimeout(() => res({}), 1500)
    })
    const pauseButton = await screen.findByRole('button', {
      name: 'Pause button',
      disabled: false,
    })
    fireEvent.press(pauseButton)
  })

  await waitFor(() => expect(screen.getByText('0:01')).toBeDefined())
}, 10000)

it('should change tempo of the audio', async () => {
  doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '', id: 1 },
  })

  await waitFor(() => {
    expect(screen.getByText('0:00')).toBeDefined()
  })

  fireEvent.press(
    await screen.findByRole('button', { name: '0.5x', disabled: false })
  )

  const playButton = await screen.findByRole('button', {
    name: 'Play button',
    disabled: false,
  })
  await act(async () => {
    fireEvent.press(playButton)

    await new Promise((res) => {
      setTimeout(() => res({}), 2200)
    })

    const pauseButton = await screen.findByRole('button', {
      name: 'Pause button',
      disabled: false,
    })
    fireEvent.press(pauseButton)
  })

  await waitFor(() => expect(screen.getByText('0:01')).toBeDefined())
}, 10000)

it('should navigate to the correct time after pressing a cue', async () => {
  const { getByLabelText, getByText, queryAllByText } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '', id: 1 },
  })

  await waitFor(() => {})

  expect(getByText('0:00')).toBeDefined()

  const skipForwardButton = await screen.findByRole('button', {
    name: 'Skip forward 10 seconds',
    disabled: false,
  })

  fireEvent.press(skipForwardButton)
  fireEvent.press(skipForwardButton)

  expect(getByText('0:20')).toBeDefined()

  const cues = queryAllByText('Hold to Set')

  const firstCue = cues[0]

  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `cues`')) {
      query.response([{ start: 20 * 1000, cue_number: 1 }])
    } else if (query.method === 'insert' && query.sql.includes('into `cues`')) {
      query.response([1])
    } else if (query.method === 'update' && query.sql.includes('`cues`')) {
      query.response([1])
    }
  })

  fireEvent(firstCue, 'onLongPress')

  const cueGrid = screen.getByTestId('cue-grid')

  await within(cueGrid).findByText('0:20')

  fireEvent.press(getByLabelText('Skip forward 10 seconds'))
  expect(getByText('0:30')).toBeDefined()

  fireEvent.press(getByText('0:20'))

  expect(queryAllByText('0:20')).toHaveLength(2)
})
