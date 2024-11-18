import axios, { AxiosResponse } from 'axios'

const spotifyClient = axios.create({
  baseURL: 'https://api.spotify.com/v1',
})

export const spotifyAddAuth = (access_token: string) => {
  spotifyClient.defaults.headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  } as any
}

export const checkSpotifyAuth = async () => await spotifyClient.get('/me', {})

export const searchSpotifyTracks = async (query: string) =>
  await spotifyClient.get<SpotifyApi.SearchResponse>('/search', {
    params: {
      q: encodeURIComponent(query),
      type: 'track',
      limit: 10,
    },
  })

export const getSpotifyTrack = async (id: string) =>
  await spotifyClient.get<SpotifyApi.TrackObjectFull>(`/tracks/${id}`)

export const startPlayback = async (params: {
  uris: string[]
  position_ms: number
}) => await spotifyClient.put('/me/player/play', params)

export const pausePlayback = async () =>
  await spotifyClient.put('/me/player/pause')

export const seekToPosition = async (position: number) =>
  await spotifyClient.put(
    '/me/player/seek',
    {},
    {
      params: {
        position_ms: position,
      },
    }
  )

export const getAvailableDevices = async () =>
  await spotifyClient.get<SpotifyApi.UserDevicesResponse>('/me/player/devices')

export const getCurrentlyPlaying = async () =>
  await spotifyClient.get<SpotifyApi.CurrentPlaybackResponse>(
    '/me/player/currently-playing'
  )

export const setRepeatMode = async (state: 'track' | 'context' | 'off') =>
  await spotifyClient.put('/me/player/repeat', {}, { params: { state } })
