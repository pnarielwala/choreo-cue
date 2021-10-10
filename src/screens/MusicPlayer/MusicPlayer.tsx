import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { Easing } from 'react-native'
import { View, SafeAreaView, H1, Pressable, Icon } from 'design'
import Spinner from 'react-native-loading-spinner-overlay'
import TextTicker from 'react-native-text-ticker'
import { useKeepAwake } from 'expo-keep-awake'

import LeftArrow from 'assets/left_arrow.svg'

import TrackSlider from './components/TrackSlider'
import Cues from './components/Cues'
import Controls from './components/Controls/Controls'
import Tempo from './components/Tempo'
import useMusicPlayer from 'hooks/useMusicPlayer'
import { ScreenPropsT } from 'App'
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

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => {
            props.navigation.goBack()
          }}
          hitSlop={48}
          accessibilityLabel="Back"
        >
          <Icon
            as={LeftArrow}
            width={24}
            height={24}
            sx={{
              // ml: 3,
              color: 'secondary',
            }}
          />
        </Pressable>
      ),
    })
  }, [props])

  return (
    <>
      <SafeAreaView
        sx={{
          flex: 1,
          bg: 'background',
        }}
      >
        <View sx={{ px: 3, flex: 1 }}>
          <View sx={{ height: 'auto' }}>
            <View sx={{ alignItems: 'flex-start', width: '100%' }}>
              <H1
                as={TextTicker}
                // @ts-ignore TODO: Fix TS typing for Dripsy on "as" prop
                loop={false}
                bounce={false}
                repeatSpacer={20}
                scrollSpeed={200}
                easing={Easing.linear}
                marqueeDelay={1000}
              >
                {details.trackName}
              </H1>
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
          </View>
          <View sx={{ flex: 1, alignItems: 'flex-start' }}>
            <Cues
              currentPosition={currentPosition}
              onPlayFromPosition={setAudioPosition}
            />
          </View>
        </View>
      </SafeAreaView>

      <Spinner visible={false} />
    </>
  )
}

export default MusicPlayer
