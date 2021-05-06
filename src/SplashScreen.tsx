import React from 'react';
import { View, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

import type { PropsT as MusicPlayerPropsT } from './MusicPlayer';
import { Button } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';

export default function SplashScreen(
  props: StackScreenProps<{ Home: undefined; Player: MusicPlayerPropsT }>,
) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        style={{
          width: '100%',
        }}
        resizeMode="contain"
        source={require('./assets/splash.png')}
      />
      <Button
        onPress={async () => {
          const result = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
          });
          if (result.type === 'success') {
            props.navigation.push('Player', { musicData: result });
          }
        }}
        buttonStyle={{ backgroundColor: 'black' }}
        title="Load Music"
        containerStyle={{ position: 'absolute', width: 150, bottom: '30%' }}
      />
    </View>
  );
}
