import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import {
  useAuthRequest,
  exchangeCodeAsync,
  refreshAsync,
  ResponseType,
  TokenResponse,
} from 'expo-auth-session'
import * as Linking from 'expo-linking'
import * as SecureStore from 'expo-secure-store'

import analytics from 'resources/analytics'

export const SPOTIFY_AUTH_STATE_KEY = 'ChoreoCue_Spotify'

const CLIENT_ID = process.env.EXPO_SPOTIFY_CLIENT_ID || ''

export const SCOPES = [
  'app-remote-control',
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative',
]

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
}

export type StoredSpotifyAuth = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const REFRESH_BUFFER_MS = 60_000

let memoryAuth: StoredSpotifyAuth | null = null

const persist = async (auth: StoredSpotifyAuth) => {
  memoryAuth = auth
  if (Platform.OS !== 'web') {
    await SecureStore.setItemAsync(SPOTIFY_AUTH_STATE_KEY, JSON.stringify(auth))
  }
}

const loadFromStorage = async (): Promise<StoredSpotifyAuth | null> => {
  if (memoryAuth) return memoryAuth
  if (Platform.OS === 'web') return null
  const raw = await SecureStore.getItemAsync(SPOTIFY_AUTH_STATE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredSpotifyAuth
    memoryAuth = parsed
    return parsed
  } catch {
    return null
  }
}

const refreshIfNeeded = async (
  auth: StoredSpotifyAuth
): Promise<StoredSpotifyAuth> => {
  if (Date.now() < auth.expiresAt - REFRESH_BUFFER_MS) {
    return auth
  }
  const refreshed = await refreshAsync(
    { clientId: CLIENT_ID, refreshToken: auth.refreshToken },
    discovery
  )
  const next: StoredSpotifyAuth = {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? auth.refreshToken,
    expiresAt:
      Date.now() +
      (refreshed.expiresIn ? refreshed.expiresIn * 1000 : 3600_000),
  }
  await persist(next)
  return next
}

export const getSpotifyAccessToken = async (): Promise<string | null> => {
  const auth = await loadFromStorage()
  if (!auth) return null
  const fresh = await refreshIfNeeded(auth)
  return fresh.accessToken
}

export const clearSpotifyAuth = async () => {
  memoryAuth = null
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(SPOTIFY_AUTH_STATE_KEY)
  }
}

type PropsT = {
  onCheckAuth: (authenticated: boolean) => void
}

const useSpotifyAuth = ({ onCheckAuth }: PropsT) => {
  const redirectUri = Linking.createURL('/spotify-callback')

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[Spotify] redirect URI:', redirectUri)
  }

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: SCOPES,
      usePKCE: true,
      responseType: ResponseType.Code,
      redirectUri,
    },
    discovery
  )

  const requestRef = useRef(request)
  requestRef.current = request

  useEffect(() => {
    if (response?.type === 'success') {
      const code = response.params.code
      const verifier = requestRef.current?.codeVerifier
      if (!code || !verifier) {
        analytics.error('[Spotify Auth] missing code or verifier')
        onCheckAuth(false)
        return
      }
      exchangeCodeAsync(
        {
          clientId: CLIENT_ID,
          code,
          redirectUri,
          extraParams: { code_verifier: verifier },
        },
        discovery
      )
        .then((token: TokenResponse) => {
          const stored: StoredSpotifyAuth = {
            accessToken: token.accessToken,
            refreshToken: token.refreshToken ?? '',
            expiresAt:
              Date.now() +
              (token.expiresIn ? token.expiresIn * 1000 : 3600_000),
          }
          return persist(stored)
        })
        .then(() => onCheckAuth(true))
        .catch((e) => {
          analytics.error('[Spotify Auth] code exchange failed', e)
          onCheckAuth(false)
        })
    } else if (response?.type === 'error') {
      analytics.error('[Spotify Auth] authorization error')
      onCheckAuth(false)
    }
  }, [response])

  const authenticate = async () => {
    const cached = await loadFromStorage()
    if (cached) {
      try {
        await refreshIfNeeded(cached)
        onCheckAuth(true)
        return
      } catch {
        await clearSpotifyAuth()
      }
    }
    promptAsync()
  }

  return {
    authenticate,
    signOut: clearSpotifyAuth,
  }
}

export default useSpotifyAuth
