import React from 'react'
import SpotifySearch from './SpotifySearch'
import mockKnex from 'mock-knex'
import { searchSpotifyTracks } from 'api/spotifyClient'
import { StacksT } from 'App'
import { createStackNavigator } from '@react-navigation/stack'
import {
  renderWithProviders,
  waitFor,
  userEvent,
  act,
} from '__test-utils__/rntl'
import { anApiResponse } from '__test-utils__/builders/apiResponseBuilder'
import {
  anAlbum,
  anArtist,
  aTrack,
} from '__test-utils__/builders/spotifyBuilder'
import { View, Text } from 'design'

jest.mock('api/spotifyClient', () => ({
  searchSpotifyTracks: jest.fn(),
}))

const Stack = createStackNavigator<StacksT>()

const doRenderWithProviders = (
  initialRouteName: keyof StacksT = 'SpotifySearch'
) => {
  return renderWithProviders(
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="SpotifySearch" component={SpotifySearch} />
      <Stack.Screen name="Player">
        {(props) => (
          <View>
            <Text>Player Screen</Text>
            <Text>Name: {props.route.params.musicData.name}</Text>
            <Text>URI: {props.route.params.musicData.uri}</Text>
            <Text>ID: {props.route.params.musicData.id}</Text>
          </View>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const tracker = mockKnex.getTracker()
tracker.install()

beforeEach(() => {
  jest.clearAllMocks()
  tracker.on('query', (query) => {
    query.response([
      {
        id: 1,
      },
    ]) // Mock the response of the insert query
  })
})

it('renders correctly', () => {
  const { getByPlaceholderText } = doRenderWithProviders()
  expect(getByPlaceholderText('Search')).toBeTruthy()
})

it('updates search input on change', async () => {
  const { getByPlaceholderText } = doRenderWithProviders()

  const input = getByPlaceholderText('Search')
  await userEvent.type(input, 'test')

  await waitFor(() => {
    expect(input.props.value).toBe('test')
  })
})

it('fetches data when search input is provided', async () => {
  const mockData = anApiResponse({
    data: {
      tracks: {
        items: [
          aTrack({
            name: 'Test Song',
            artists: [anArtist({ name: 'Test Artist' })],
            album: anAlbum({
              name: 'Test Album',
              id: '1',
              images: [{ url: 'test-url' }],
            }),
            track_number: 1,
            id: '1',
          }),
        ],
        href: 'test-url',
        limit: 1,
        next: 'test-url',
        offset: 0,
        previous: null,
        total: 1,
      },
    } as SpotifyApi.SearchResponse,
  })
  jest.mocked(searchSpotifyTracks).mockResolvedValue(mockData)

  const { getByPlaceholderText, getByText } = doRenderWithProviders()

  const input = getByPlaceholderText('Search')
  userEvent.type(input, 'test')

  await waitFor(() => expect(getByText('Test Song')).toBeTruthy())
})

it('navigates to Player screen on track selection', async () => {
  const mockData = anApiResponse({
    data: {
      tracks: {
        items: [
          aTrack({
            name: 'Test Song',
            artists: [anArtist({ name: 'Test Artist' })],
            album: anAlbum({
              name: 'Test Album',
              id: '1',
              images: [{ url: 'test-url' }],
            }),
            track_number: 1,
            id: '1',
          }),
        ],
        href: 'test-url',
        limit: 1,
        next: 'test-url',
        offset: 0,
        previous: null,
        total: 1,
      },
    } as SpotifyApi.SearchResponse,
  })
  jest.mocked(searchSpotifyTracks).mockResolvedValue(mockData)

  const { getByPlaceholderText, getByText } = doRenderWithProviders()

  await act(async () => {
    const input = getByPlaceholderText('Search')
    await userEvent.type(input, 'test')
  })

  await waitFor(() => expect(getByText('Test Song')).toBeOnTheScreen())

  await act(async () => {
    const track = getByText('Test Song')
    await userEvent.press(track)
  })

  await waitFor(() => {
    expect(getByText('Player Screen')).toBeOnTheScreen()
    expect(getByText('Name: Test Song - Test Artist')).toBeOnTheScreen()
    expect(getByText('URI: 1')).toBeOnTheScreen()
    expect(getByText('ID: 1')).toBeOnTheScreen()
  })
})
