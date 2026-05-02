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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — exported by the manual mock
import { __mockPlayer } from 'expo-audio'

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
    }
  })
})

it('activates iOS lock screen controls when a local track loads and clears on unmount', async () => {
  __mockPlayer.setActiveForLockScreen.mockClear()

  const { unmount } = doRenderWithProviders({
    musicData: {
      name: 'Toosie Slide - Drake.mp3',
      uri: 'file://song.mp3',
      id: 1,
    },
  })

  await waitFor(() => {
    expect(__mockPlayer.setActiveForLockScreen).toHaveBeenCalledWith(
      true,
      { title: 'Toosie Slide - Drake.mp3' },
      { showSeekForward: true, showSeekBackward: true }
    )
  })

  unmount()

  expect(__mockPlayer.setActiveForLockScreen).toHaveBeenLastCalledWith(false)
})

it('should display audio title', async () => {
  const { queryAllByText } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '', id: 1 },
  })

  await waitFor(() => {
    // TextTicker renders Text twice as it's implementation
    const elements = queryAllByText('Toosie Slide - Drake.mp3')

    expect(elements[0]).toBeDefined()
  })
})

it.skip('should play and pause audio', async () => {
  const { getByLabelText, getByText } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '', id: 1 },
  })

  await waitFor(() => {})

  expect(getByText('0:00')).toBeDefined()
  await act(async () => {
    fireEvent.press(getByLabelText('Play button'))

    await new Promise((res) => {
      setTimeout(() => res({}), 1500)
    })
  })
  act(() => fireEvent.press(getByLabelText('Pause button')))

  await waitFor(() => expect(getByText('0:01')).toBeDefined())
}, 10000)

it('should change tempo of the audio', async () => {
  const { getByLabelText, getByText, getByTestId } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '', id: 1 },
  })

  await waitFor(() => {})

  expect(getByText('0:00')).toBeDefined()

  const slider = getByTestId('tempo-slider')
  fireEvent(slider, 'onValueChange', 0.5)

  await act(async () => {
    fireEvent.press(getByLabelText('Play button'))

    await new Promise((res) => {
      setTimeout(() => res({}), 2200)
    })
    fireEvent.press(getByLabelText('Pause button'))
  })

  await waitFor(() => expect(getByText('0:01')).toBeDefined())
}, 10000)

it('should navigate to the correct time after pressing a cue', async () => {
  const { getByLabelText, getByText, queryAllByText } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '', id: 1 },
  })

  await waitFor(() => {})

  expect(getByText('0:00')).toBeDefined()

  fireEvent.press(getByLabelText('Skip forward 10 seconds'))
  fireEvent.press(getByLabelText('Skip forward 10 seconds'))

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
