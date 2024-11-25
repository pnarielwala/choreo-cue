import { useEffect } from 'react'
import { Platform } from 'react-native'
import * as AuthSession from 'expo-auth-session'
import { ResponseType } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import rollbar from 'resources/rollbar'
import { checkSpotifyAuth, spotifyAddAuth } from 'api/spotifyClient'

export const DROPBOX_AUTH_STATE_KEY = 'ChoreoCue_Spotify'

type PropsT = {
  onCheckAuth?: (authenticated: boolean) => void
}

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
}

const useSpotifyAuth = ({ onCheckAuth }: PropsT = {}) => {
  const [, response, promptAsync] = AuthSession.useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: '63ad4e01f0644c7fa627b578f86c8426',
      scopes: [
        'user-read-email',
        'user-library-read',
        'user-read-recently-played',
        'user-top-read',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'user-read-currently-playing',
        'user-read-playback-state',
        'user-modify-playback-state',
      ],
      redirectUri: AuthSession.makeRedirectUri({
        native: 'choreo-cue://redirect',
        scheme: 'choreo-cue',
        path: '/redirect',
      }),
      usePKCE: false,
    },
    discovery
  )

  useEffect(() => {
    if (response?.type === 'success') {
      const auth = response.params
      console.log('response.params', auth)
      const storageValue = JSON.stringify(auth)

      if (Platform.OS !== 'web') {
        // Securely store the auth on your device
        SecureStore.setItemAsync(DROPBOX_AUTH_STATE_KEY, storageValue)
      }

      spotifyAddAuth(auth.access_token)
      onCheckAuth?.(true)
    } else if (response?.type === 'error') {
      rollbar.error('[Dropbox Authentication] Unhandled error')
    }
  }, [onCheckAuth, response])

  const authenticate = async (): Promise<
    AuthSession.AuthSessionResult['type']
  > => {
    // const { type } = await promptAsync()
    // return type

    try {
      const storageValue = await SecureStore.getItemAsync(
        DROPBOX_AUTH_STATE_KEY
      )
      const auth = JSON.parse(storageValue ?? '{}')
      spotifyAddAuth(auth.access_token)

      await checkSpotifyAuth()

      onCheckAuth?.(true)
      return 'success'
    } catch (e: any) {
      rollbar.info('[Spotify Authentication] No stored auth found', e)
      const { type } = await promptAsync()
      return type
    }
  }

  return {
    authenticate,
  }
}

export default useSpotifyAuth
