import { useEffect } from 'react'
import { Platform } from 'react-native'
import { useAuthRequest } from 'expo-auth-session'

import * as Linking from 'expo-linking'

import * as SecureStore from 'expo-secure-store'
import { checkDropboxAuth, dropboxAddAuth } from 'api/dropboxClient'

export const DROPBOX_AUTH_STATE_KEY = 'ChoreoCue_Dropbox'

type PropsT = {
  onCheckAuth: (authenticated: boolean) => void
}

const discovery = {
  authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
  tokenEndpoint: 'https://www.dropbox.com/oauth2/token',
}

const useDropBoxAuth = ({ onCheckAuth }: PropsT) => {
  const [, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_DROPBOX_CLIENT_ID || '',
      // There are no scopes so just pass an empty array
      scopes: [],
      // Dropbox doesn't support PKCE
      usePKCE: false,
      responseType: 'token',
      redirectUri: Linking.createURL('/redirect'),
    },
    discovery
  )

  useEffect(() => {
    if (response?.type === 'success') {
      const auth = response.params
      const storageValue = JSON.stringify(auth)

      if (Platform.OS !== 'web') {
        // Securely store the auth on your device
        SecureStore.setItemAsync(DROPBOX_AUTH_STATE_KEY, storageValue)
      }

      dropboxAddAuth(auth.access_token)
      onCheckAuth(true)
    } else if (response?.type === 'error') {
      console.error('[Dropbox Authentication] Unhandled error')
    }
  }, [response])

  const authenticate = async () => {
    try {
      const storageValue = await SecureStore.getItemAsync(
        DROPBOX_AUTH_STATE_KEY
      )
      const auth = JSON.parse(storageValue ?? '{}')
      dropboxAddAuth(auth.access_token)
      await checkDropboxAuth()
      onCheckAuth(true)
    } catch (e) {
      promptAsync()
    }
  }

  return {
    authenticate,
  }
}

export default useDropBoxAuth
