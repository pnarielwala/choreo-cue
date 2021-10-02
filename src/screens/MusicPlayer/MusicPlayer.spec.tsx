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
} from '__test-utils__/rntl'

import { act } from 'react-test-renderer'

afterEach(cleanup)

type ScreenParamsT = ScreenPropsT<'Player'>['route']['params']

const Stack = createStackNavigator<StacksT>()

const doRenderWithProviders = (
  initialParams: ScreenParamsT = {
    musicData: { name: 'Hello world.mp3', uri: '' },
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

it('should display audio title', async () => {
  const { queryAllByText } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '' },
  })

  await waitFor(() => {})

  // TextTicker renders Text twice as it's implementation
  const elements = queryAllByText('Toosie Slide - Drake.mp3')

  expect(elements[0]).toBeDefined()
})

it('should play and pause audio', async () => {
  const { getByA11yLabel, getByText } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '' },
  })

  await waitFor(() => {})

  expect(getByText('0:00')).toBeDefined()
  await act(async () => {
    fireEvent.press(getByA11yLabel('Play button'))

    await new Promise((res) => {
      setTimeout(() => res({}), 1500)
    })
    fireEvent.press(getByA11yLabel('Pause button'))
  })

  await waitFor(() => expect(getByText('0:01')).toBeDefined())
}, 10000)

it('should change tempo of the audio', async () => {
  const { getByA11yLabel, getByText } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '' },
  })

  await waitFor(() => {})

  expect(getByText('0:00')).toBeDefined()

  fireEvent.press(getByText('0.5x'))
  await act(async () => {
    fireEvent.press(getByA11yLabel('Play button'))

    await new Promise((res) => {
      setTimeout(() => res({}), 2200)
    })
    fireEvent.press(getByA11yLabel('Pause button'))
  })

  await waitFor(() => expect(getByText('0:01')).toBeDefined())
}, 10000)

it('should navigate to the correct time after pressing a cue', async () => {
  const { getByA11yLabel, getByText, queryAllByText } = doRenderWithProviders({
    musicData: { name: 'Toosie Slide - Drake.mp3', uri: '' },
  })

  await waitFor(() => {})

  expect(getByText('0:00')).toBeDefined()

  fireEvent.press(getByA11yLabel('Skip forward 10 seconds'))
  fireEvent.press(getByA11yLabel('Skip forward 10 seconds'))

  expect(getByText('0:20')).toBeDefined()

  const cues = queryAllByText('Press & Hold to Set')

  const firstCue = cues[0]

  fireEvent(firstCue, 'onLongPress')

  fireEvent.press(getByA11yLabel('Skip forward 10 seconds'))
  expect(getByText('0:30')).toBeDefined()

  fireEvent.press(getByText('0:20'))

  expect(queryAllByText('0:20')).toHaveLength(2)
})
