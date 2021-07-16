import React, { useEffect } from 'react';
import { Image, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useAuthRequest } from 'expo-auth-session';

import * as SecureStore from 'expo-secure-store';
import { checkDropboxAuth, dropboxAddAuth } from './api/dropboxClient';

const DROPBOX_AUTH_STATE_KEY = 'ChoreoCue_Dropbox';

type PropsT = {
  onCheckAuth: (authenticated: boolean) => void;
};

const discovery = {
  authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
  tokenEndpoint: 'https://www.dropbox.com/oauth2/token',
};

const DropboxAuthButton = ({ onCheckAuth }: PropsT) => {
  const [, response, promptAsync] = useAuthRequest(
    {
      clientId: '7chw5fn2w0v0jkz',
      // There are no scopes so just pass an empty array
      scopes: [],
      // Dropbox doesn't support PKCE
      usePKCE: false,
      responseType: 'token',
      redirectUri: 'exp://expo.io/@pnarielwala/choreo-cue',
    },
    discovery,
  );

  useEffect(() => {
    if (response && response.type === 'success') {
      const auth = response.params;
      const storageValue = JSON.stringify(auth);

      if (Platform.OS !== 'web') {
        // Securely store the auth on your device
        SecureStore.setItemAsync(DROPBOX_AUTH_STATE_KEY, storageValue);
      }

      dropboxAddAuth(auth.access_token);
      onCheckAuth(true);
    }
  }, [response]);

  const authenticate = async () => {
    try {
      const storageValue = await SecureStore.getItemAsync(
        DROPBOX_AUTH_STATE_KEY,
      );
      const auth = JSON.parse(storageValue ?? '{}');
      dropboxAddAuth(auth.access_token);
      await checkDropboxAuth();
      onCheckAuth(true);
    } catch (e) {
      promptAsync();
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        authenticate();
      }}
    >
      <Image
        source={require('./assets/dropbox.png')}
        resizeMode="contain"
        style={{ width: 50, height: 50 }}
      />
    </TouchableOpacity>
  );
};

export default DropboxAuthButton;
