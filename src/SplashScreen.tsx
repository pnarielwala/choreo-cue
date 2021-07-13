import React, { useEffect, useState } from 'react';
import { View, Image, SafeAreaView, Platform } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

import type { PropsT as MusicPlayerPropsT } from './MusicPlayer';
import * as DocumentPicker from 'expo-document-picker';

import { TouchableOpacity } from 'react-native-gesture-handler';

import DropboxAuthButton from './DropboxAuth';
import { getFolderContents } from './api/dropboxClient';

export default function SplashScreen(
  props: StackScreenProps<{
    Home: undefined;
    Player: MusicPlayerPropsT;
    DropboxAuth: undefined;
  }>,
) {
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
          source={require('./assets/splash.png')}
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
                console.log('result', result);
                props.navigation.push('Player', { musicData: result });
              }
            }}
          >
            <Image
              source={require('./assets/icloud.png')}
              resizeMode="contain"
              style={{ width: 50, height: 50 }}
            />
          </TouchableOpacity>
          <DropboxAuthButton
            onCheckAuth={(authenticated) => {
              if (authenticated) {
                getFolderContents('').then((data) => {
                  const files = data.data.entries.map((entry) => entry.name);
                  console.log('files', files);
                });
              }
            }}
          />
          <TouchableOpacity>
            <Image
              source={require('./assets/google-drive.png')}
              resizeMode="contain"
              style={{ width: 50, height: 50 }}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
