import React from 'react'
import { Linking } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

import {
  renderWithProviders,
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '__test-utils__/rntl'
import mock from '__test-utils__/mock'

import SelectSource from './SelectSource'
import { StacksT } from 'App'

import useSpotifyAuth, { SpotifyAuthResult } from 'hooks/useSpotifyAuth'
import useDropBoxAuth from 'hooks/useDropboxAuth'
import { getMe } from 'api/spotifyClient'

jest.mock('hooks/useSpotifyAuth')
jest.mock('hooks/useDropboxAuth')
jest.mock('api/spotifyClient')

afterEach(cleanup)

const Stack = createStackNavigator<StacksT>()

let spotifyOnCheckAuth: (result: SpotifyAuthResult) => void = () => {}
const spotifyAuthenticate = jest.fn()

beforeEach(() => {
  spotifyAuthenticate.mockReset()
  mock(useSpotifyAuth).mockImplementation(({ onCheckAuth }) => {
    spotifyOnCheckAuth = onCheckAuth
    return { authenticate: spotifyAuthenticate, signOut: jest.fn() }
  })
  mock(useDropBoxAuth).mockReturnValue({
    authenticate: jest.fn(),
    signOut: jest.fn(),
  } as any)
})

const doRender = () =>
  renderWithProviders(
    <Stack.Navigator initialRouteName="SelectSource">
      <Stack.Screen name="SelectSource" component={SelectSource} />
      <Stack.Screen name="SpotifyNavigator">{() => null}</Stack.Screen>
    </Stack.Navigator>
  )

it('shows the limitations dialog when Spotify is tapped, without authenticating', () => {
  doRender()

  fireEvent.press(screen.getByText('Spotify'))

  expect(screen.getByText('Before you connect Spotify')).toBeOnTheScreen()
  expect(
    screen.getByText(/only allowlisted accounts can connect/i)
  ).toBeOnTheScreen()
  expect(spotifyAuthenticate).not.toHaveBeenCalled()
})

it('cancels without authenticating', () => {
  doRender()

  fireEvent.press(screen.getByText('Spotify'))
  fireEvent.press(screen.getByText('Cancel'))

  expect(spotifyAuthenticate).not.toHaveBeenCalled()
  expect(screen.queryByText('Before you connect Spotify')).toBeNull()
})

it('continues to Spotify auth when Continue is pressed', () => {
  doRender()

  fireEvent.press(screen.getByText('Spotify'))
  fireEvent.press(screen.getByText('Continue'))

  expect(spotifyAuthenticate).toHaveBeenCalledTimes(1)
})

it('shows the auth-error dialog when authentication fails with reason error', async () => {
  doRender()

  fireEvent.press(screen.getByText('Spotify'))
  fireEvent.press(screen.getByText('Continue'))

  act(() => {
    spotifyOnCheckAuth({ authenticated: false, reason: 'error' })
  })

  await waitFor(() => {
    expect(screen.getByText("Couldn't connect to Spotify")).toBeOnTheScreen()
  })
})

it('does not show the auth-error dialog when the user cancels the auth sheet', async () => {
  doRender()

  fireEvent.press(screen.getByText('Spotify'))
  fireEvent.press(screen.getByText('Continue'))

  act(() => {
    spotifyOnCheckAuth({ authenticated: false, reason: 'cancelled' })
  })

  await waitFor(() => {
    expect(screen.queryByText("Couldn't connect to Spotify")).toBeNull()
  })
})

it('opens a mailto URL when Request access is pressed', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any)

  doRender()

  fireEvent.press(screen.getByText('Spotify'))
  fireEvent.press(screen.getByText('Continue'))
  act(() => {
    spotifyOnCheckAuth({ authenticated: false, reason: 'error' })
  })

  await waitFor(() => {
    expect(screen.getByText('Request access')).toBeOnTheScreen()
  })

  fireEvent.press(screen.getByText('Request access'))

  expect(openURL).toHaveBeenCalledTimes(1)
  expect(openURL.mock.calls[0][0]).toMatch(/^mailto:pnariewlala@gmail\.com/)
  expect(openURL.mock.calls[0][0]).toContain('subject=')

  openURL.mockRestore()
})

it('does not show the auth-error dialog on a successful Premium auth', async () => {
  mock(getMe).mockResolvedValue({ product: 'premium' } as any)

  doRender()

  fireEvent.press(screen.getByText('Spotify'))
  fireEvent.press(screen.getByText('Continue'))

  act(() => {
    spotifyOnCheckAuth({ authenticated: true })
  })

  await waitFor(() => {
    expect(getMe).toHaveBeenCalled()
  })
  expect(screen.queryByText("Couldn't connect to Spotify")).toBeNull()
})
