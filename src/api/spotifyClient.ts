import axios, { AxiosError, AxiosResponse } from 'axios'

import { getSpotifyAccessToken, clearSpotifyAuth } from 'hooks/useSpotifyAuth'

const spotifyClient = axios.create({
  baseURL: 'https://api.spotify.com/v1',
})

spotifyClient.interceptors.request.use(async (config) => {
  const token = await getSpotifyAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

spotifyClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearSpotifyAuth()
    }
    throw error
  }
)

export type SpotifyTrack = {
  id: string
  uri: string
  name: string
  duration_ms: number
  album: { name: string; images: Array<{ url: string }> }
  artists: Array<{ id: string; name: string }>
}

export type SpotifyPlaylist = {
  id: string
  name: string
  images: Array<{ url: string }>
  tracks: { total: number }
  owner: { display_name: string }
}

export type SpotifyUser = {
  id: string
  display_name: string | null
  product: 'premium' | 'free' | 'open'
  email?: string
}

export type SpotifyPlayerState = {
  is_playing: boolean
  progress_ms: number | null
  item: SpotifyTrack | null
  device?: { id: string; is_active: boolean; name: string }
}

export type SpotifyDevice = {
  id: string | null
  is_active: boolean
  is_restricted: boolean
  name: string
  type: string
  volume_percent: number | null
}

export const getMe = async (): Promise<SpotifyUser> => {
  const r: AxiosResponse<SpotifyUser> = await spotifyClient.get('/me')
  return r.data
}

export const searchTracks = async (
  q: string,
  limit = 20
): Promise<SpotifyTrack[]> => {
  if (!q.trim()) return []
  const r = await spotifyClient.get<{ tracks: { items: SpotifyTrack[] } }>(
    '/search',
    { params: { q, type: 'track', limit } }
  )
  return r.data.tracks.items
}

export const getUserPlaylists = async (
  limit = 50
): Promise<SpotifyPlaylist[]> => {
  const r = await spotifyClient.get<{ items: SpotifyPlaylist[] }>(
    '/me/playlists',
    { params: { limit } }
  )
  return r.data.items
}

export const getPlaylistTracks = async (
  playlistId: string,
  limit = 100
): Promise<SpotifyTrack[]> => {
  const r = await spotifyClient.get<{
    items: Array<{ track: SpotifyTrack | null }>
  }>(`/playlists/${playlistId}/tracks`, { params: { limit } })
  return r.data.items
    .map((i) => i.track)
    .filter((t): t is SpotifyTrack => t != null)
}

export const getTrack = async (trackId: string): Promise<SpotifyTrack> => {
  const r = await spotifyClient.get<SpotifyTrack>(`/tracks/${trackId}`)
  return r.data
}

export const getPlayerState = async (): Promise<SpotifyPlayerState | null> => {
  const r = await spotifyClient.get<SpotifyPlayerState | ''>('/me/player')
  if (!r.data) return null
  return r.data as SpotifyPlayerState
}

export const playOnSpotify = async (params?: {
  uris?: string[]
  position_ms?: number
  device_id?: string
}) => {
  const { device_id, ...body } = params ?? {}
  await spotifyClient.put(
    '/me/player/play',
    Object.keys(body).length ? body : undefined,
    { params: device_id ? { device_id } : undefined }
  )
}

export const pauseOnSpotify = async () => {
  await spotifyClient.put('/me/player/pause')
}

export const seekOnSpotify = async (positionMs: number) => {
  await spotifyClient.put('/me/player/seek', null, {
    params: { position_ms: Math.max(0, Math.floor(positionMs)) },
  })
}

export const transferPlayback = async (deviceId: string, play = false) => {
  await spotifyClient.put('/me/player', { device_ids: [deviceId], play })
}

export const getDevices = async (): Promise<SpotifyDevice[]> => {
  const r = await spotifyClient.get<{ devices: SpotifyDevice[] }>(
    '/me/player/devices'
  )
  return r.data.devices
}

export const trackIdFromUri = (uri: string): string | null => {
  const m = uri.match(/^spotify:track:([A-Za-z0-9]+)/)
  return m ? m[1] : null
}

export default spotifyClient
