import React from 'react';
import { View, Image, SafeAreaView } from 'dripsy';

import * as DocumentPicker from 'expo-document-picker';

import { TouchableOpacity } from 'react-native-gesture-handler';

import DropboxAuthButton from './components/DropboxAuthButton';
import { getFolderContents } from 'api/dropboxClient';
import { useQueryClient } from 'react-query';
import { ScreenPropsT } from 'screens/ScreenProps';

export default function SplashScreen(props: ScreenPropsT<'Home'>) {
  const queryClient = useQueryClient();
  return (
    <View style={{ position: 'relative', height: '100%' }}>
      <SafeAreaView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Image
          style={{
            width: '100%',
            position: 'absolute',
            zIndex: -1,
          }}
          resizeMode="contain"
          source={require('assets/splash.png')}
        />
        {/* 
        Create a button group "bar" to contain
        * iCloud/Files app
        * Dropbox
        * Google Drive
      */}
        <View
          style={{
            position: 'absolute',
            bottom: 50,
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-evenly',
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
              });
              if (result.type === 'success') {
                props.navigation.push('Player', { musicData: result });
              }
            }}
          >
            <Image
              source={require('assets/icloud.png')}
              resizeMode="contain"
              style={{ width: 50, height: 50 }}
            />
          </TouchableOpacity>
          <DropboxAuthButton
            onCheckAuth={async (authenticated) => {
              if (authenticated) {
                if (!queryClient.getQueryData(['dropbox-contents', ''])) {
                  await queryClient.prefetchQuery(
                    ['dropbox-contents', ''],
                    () => getFolderContents(''),
                  );
                }
                props.navigation.push('DropboxNavigator', {
                  path: '',
                  name: 'Home',
                });
              }
            }}
          />
          <TouchableOpacity>
            <Image
              source={require('assets/google-drive.png')}
              resizeMode="contain"
              style={{ width: 50, height: 50 }}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
