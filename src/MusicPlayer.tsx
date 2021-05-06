import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Easing, SafeAreaView } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import TextTicker from 'react-native-text-ticker';
import { StackScreenProps } from '@react-navigation/stack';

import { Audio, AVPlaybackStatus } from 'expo-av';

import TrackSlider from './TrackSlider';
import Cues from './CuesContainer/Cues';
import Controls from './Controls/Controls';
import Tempo from './Tempo';

export type PropsT = {
  musicData: { uri: string; name: string };
};

export default function MusicPlayer(
  props: StackScreenProps<{ Home: undefined; Player: PropsT }>,
) {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setTimeElapsed(status.positionMillis);
    }
  };

  const loadSoundFromData = async (data: { uri: string; name: string }) => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    const sound = new Audio.Sound();
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    setSound(sound);

    const track = await sound.loadAsync(data);

    if (track.isLoaded) {
      setIsLoaded(true);
      track.durationMillis && setDuration(track.durationMillis);
    }

    setIsLoading(false);
  };

  async function playSound() {
    await sound?.playAsync();
  }

  async function pauseSound() {
    await sound?.pauseAsync();
  }

  useEffect(() => {
    props.route.params && loadSoundFromData(props.route.params?.musicData);

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, []);

  return (
    <>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <View style={{ alignItems: 'flex-start', width: '100%' }}>
            <TextTicker
              loop={false}
              bounce={false}
              style={{
                fontSize: 32,
                fontWeight: 'bold',
              }}
              repeatSpacer={20}
              scrollSpeed={200}
              easing={Easing.linear}
              marqueeDelay={1000}
            >
              {props.route.params?.musicData.name}
            </TextTicker>
          </View>

          <Controls
            playSound={playSound}
            pauseSound={pauseSound}
            currentPosition={timeElapsed}
            isPlaying={isPlaying}
            setPosition={(position) => sound?.setPositionAsync(position)}
          />

          <TrackSlider
            duration={duration}
            currentPosition={timeElapsed}
            onPositionChange={(value) => {
              sound?.setPositionAsync(value);
            }}
            disabled={!isLoaded || isLoading}
          />

          <Tempo setRate={(tempo) => sound?.setRateAsync(tempo, true)} />

          <Cues
            currentPosition={timeElapsed}
            onPlayFromPosition={(position) => sound?.setPositionAsync(position)}
          />
        </View>
      </SafeAreaView>

      <Spinner visible={isLoading} />
    </>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    height: '100%',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 32,
  },
});
