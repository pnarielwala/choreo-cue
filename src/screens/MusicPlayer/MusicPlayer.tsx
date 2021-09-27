import 'react-native-gesture-handler'
import React from 'react'
import { StyleSheet, View, Easing, SafeAreaView } from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'
import TextTicker from 'react-native-text-ticker'
import { useKeepAwake } from 'expo-keep-awake'

import TrackSlider from './components/TrackSlider'
import Cues from './components/CuesContainer/Cues'
import Controls from './components/Controls/Controls'
import Tempo from './components/Tempo'
import useMusicPlayer from 'hooks/useMusicPlayer'
import { ScreenPropsT } from 'App'
import { Box } from 'design'

export type PropsT = ScreenPropsT<'Player'>

const MusicPlayer = (props: PropsT) => {
  useKeepAwake()
  const {
    playAudio,
    pauseAudio,
    setAudioPosition,
    setAudioSpeed,
    isPlaying,
    currentPosition,
    duration,
    details,
  } = useMusicPlayer(props.route.params.musicData)

  return (
    <>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <View style={{ alignItems: 'flex-start', width: '100%' }}>
            <Box
              as={TextTicker}
              // @ts-ignore TODO: Fix TS typing for Dripsy on "as" prop
              loop={false}
              bounce={false}
              sx={{
                fontSize: [18, 32],
                fontWeight: 'bold',
              }}
              repeatSpacer={20}
              scrollSpeed={200}
              easing={Easing.linear}
              marqueeDelay={1000}
            >
              {details.trackName}
            </Box>
          </View>

          <Controls
            playSound={playAudio}
            pauseSound={pauseAudio}
            currentPosition={currentPosition}
            isPlaying={isPlaying}
            setPosition={setAudioPosition}
          />

          <TrackSlider
            duration={duration}
            currentPosition={currentPosition}
            onPositionChange={setAudioPosition}
            disabled={false}
          />

          <Tempo setRate={setAudioSpeed} />

          <Cues
            currentPosition={currentPosition}
            onPlayFromPosition={setAudioPosition}
          />
        </View>
      </SafeAreaView>

      <Spinner visible={false} />
    </>
  )
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
})

export default MusicPlayer
