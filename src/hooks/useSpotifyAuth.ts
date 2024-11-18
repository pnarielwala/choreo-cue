import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import * as AuthSession from 'expo-auth-session'
import { ResponseType } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import rollbar from 'resources/rollbar'
import { checkSpotifyAuth, spotifyAddAuth } from 'api/spotifyClient'
import axios from 'axios'

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
        'user-read-playback-state',
        'user-modify-playback-state',
      ],
      redirectUri: AuthSession.makeRedirectUri({}),
      usePKCE: false,
    },
    discovery
  )

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const auth = response.params
  //     const code = auth.code
  //     const state = auth.state

  //     console.log('response.params', auth)

  //     // TODO: move this to a server
  //     axios
  //       .post(
  //         'https://accounts.spotify.com/api/token',
  //         {
  //           code,
  //           redirect_uri: AuthSession.makeRedirectUri({}),
  //           grant_type: 'authorization_code',
  //         },
  //         {
  //           headers: {
  //             'content-type': 'application/x-www-form-urlencoded',
  //             Authorization:
  //               'Basic ' +
  //               btoa(
  //                 '63ad4e01f0644c7fa627b578f86c8426:fbb3fb6b49a1400ca4d6fef34221d3fb'
  //               ),
  //           },
  //         }
  //       )
  //       .then((res) => {
  //         console.log('res', res.data)
  //         const storageValue = JSON.stringify(res.data)
  //         if (Platform.OS !== 'web') {
  //           // Securely store the auth on your device
  //           SecureStore.setItemAsync(DROPBOX_AUTH_STATE_KEY, storageValue)
  //         }

  //         spotifyAddAuth(auth.access_token)
  //       })
  //       .catch((e) => {
  //         console.log('error', e)
  //       })
  //   }
  // }, [response])

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
  }, [response])

  const authenticate = async (): Promise<
    AuthSession.AuthSessionResult['type']
  > => {
    // const {type} = await promptAsync()
    // return type
    try {
      const storageValue = await SecureStore.getItemAsync(
        DROPBOX_AUTH_STATE_KEY
      )
      const auth = JSON.parse(storageValue ?? '{}')
      spotifyAddAuth(auth.access_token)
      await checkSpotifyAuth()
      console.log('user checked!')
      onCheckAuth?.(true)
      return 'success'
    } catch (e) {
      console.log('prompting', e)
      const { type } = await promptAsync()
      return type
    }
  }

  return {
    authenticate,
  }
}

export default useSpotifyAuth
