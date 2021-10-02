import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { Easing } from 'react-native'
import { View, SafeAreaView } from 'design'
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
import { deleteAllLocalFiles } from 'api/filesystemClient'

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

  useEffect(() => {
    return () => {
      deleteAllLocalFiles()
    }
  }, [])

  return (
    <>
      <SafeAreaView
        sx={{
          height: '100%',
          bg: 'background',
        }}
      >
        <View sx={{ px: 3, pt: 6 }}>
          <View sx={{ alignItems: 'flex-start', width: '100%' }}>
            <Box
              as={TextTicker}
              // @ts-ignore TODO: Fix TS typing for Dripsy on "as" prop
              loop={false}
              bounce={false}
              sx={{
                fontSize: [18, 24],
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

export default MusicPlayer
