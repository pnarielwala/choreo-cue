import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import * as MediaLibrary from 'expo-media-library';

import * as DocumentPicker from 'expo-document-picker';

import Slider from 'react-native-slider';

import RNFetchBlob from 'rn-fetch-blob';

import PlayButton from './PlayButton';
import TrackSlider from './TrackSlider';

import { Audio, AVPlaybackStatus } from 'expo-av';
import Cues from './CuesContainer/Cues';

export default function App() {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [trackName, setTrackName] = useState('');

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setTimeElapsed(status.positionMillis);
    }
  };

  async function loadSound() {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    const sound = new Audio.Sound();
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    setSound(sound);

    console.log('Loading Sound');
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.type !== 'success') return;

    const track = await sound.loadAsync(result);

    if (track.isLoaded) {
      setIsLoaded(true);
      setTrackName(result.name);
      track.durationMillis && setDuration(track.durationMillis);
    }
  }

  async function playSound() {
    console.log('Playing Sound');
    await sound?.playFromPositionAsync(timeElapsed);
  }

  async function pauseSound() {
    await sound?.pauseAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, []);

  return (
    <View style={styles.container}>
      {/* <View>
        <Button
          onPress={() => {
            loadSound();
          }}
          title="Press Me"
        />
      </View> */}
      <Text>{trackName}</Text>
      <PlayButton
        onPress={() => {
          if (isLoaded) {
            if (isPlaying === false) {
              playSound();
            } else {
              pauseSound();
            }
            setIsPlaying((value) => !value);
          }
        }}
        state={isPlaying ? 'pause' : 'play'}
      />
      <TrackSlider
        duration={duration}
        currentPosition={timeElapsed}
        onPositionChange={(value) => {
          sound?.setPositionAsync(value);
        }}
      />
      <Cues
        currentPosition={timeElapsed}
        onPlayFromPosition={(position) => sound?.setPositionAsync(position)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
