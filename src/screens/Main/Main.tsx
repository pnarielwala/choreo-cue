import React from 'react';
import { View, Image, SafeAreaView } from 'dripsy';

import * as DocumentPicker from 'expo-document-picker';

import { TouchableOpacity } from 'react-native-gesture-handler';

import { getFolderContents } from 'api/dropboxClient';
import { useQueryClient } from 'react-query';
import { ScreenPropsT } from 'App';
import useDropBoxAuth from 'hooks/useDropboxAuth';

export type PropsT = ScreenPropsT<'Home'>;

const Main = (props: PropsT) => {
  const queryClient = useQueryClient();

  const { authenticate } = useDropBoxAuth({
    onCheckAuth: async (authenticated) => {
      if (authenticated) {
        if (!queryClient.getQueryData(['dropbox-contents', ''])) {
          await queryClient.prefetchQuery(['dropbox-contents', ''], () =>
            getFolderContents(''),
          );
        }
        props.navigation.push('DropboxNavigator', {
          path: '',
          name: 'Home',
        });
      }
    },
  });

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
          testID="logo-image"
        />
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
            testID="icloud-source"
          >
            <Image
              source={require('assets/icloud.png')}
              resizeMode="contain"
              style={{ width: 50, height: 50 }}
              testID="icloud-image"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              authenticate();
            }}
            testID="dropbox-source"
          >
            <Image
              source={require('assets/dropbox.png')}
              resizeMode="contain"
              style={{ width: 50, height: 50 }}
              testID="dropbox-image"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Main;
