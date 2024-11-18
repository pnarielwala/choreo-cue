import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import {
  Easing,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native'
import { View, SafeAreaView, H1, Pressable, Text, Input } from 'design'
import TextTicker from 'react-native-text-ticker'
import { useKeepAwake } from 'expo-keep-awake'

import { FontAwesome5 } from '@expo/vector-icons'

import TrackSlider from './components/TrackSlider'
import Cues from './components/Cues'
import Controls from './components/Controls/Controls'
import Tempo from './components/Tempo'
import useMusicPlayer from 'hooks/useMusicPlayer'
import { ScreenPropsT } from 'App'
import { Dialog } from 'react-native-elements'
import { updateAudioName } from 'api/db/audio'

export type PropsT = ScreenPropsT<'Player'>

const MusicPlayer = (props: PropsT) => {
  const { id: audioId } = props.route.params.musicData
  useKeepAwake()
  const {
    isSoundLoaded,
    playAudio,
    pauseAudio,
    setAudioPosition,
    setAudioSpeed,
    isPlaying,
    currentPosition,
    duration,
    details,
  } = useMusicPlayer(audioId)

  const [trackName, setTrackName] = React.useState(details.trackName)

  useEffect(() => {
    setTrackName(details.trackName)
  }, [details.trackName])

  const [isVisible, setIsVisible] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(
    props.route.params.musicData.name
  )

  const onInputValueChange = (
    event: NativeSyntheticEvent<TextInputChangeEventData>
  ) => {
    setInputValue(event.nativeEvent.text)
  }

  const onRenameAudio = async () => {
    await updateAudioName(audioId, inputValue)
    setTrackName(inputValue)
    closeDialog()
  }

  const closeDialog = () => {
    setIsVisible(false)
  }

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
          <FontAwesome5 name="chevron-left" size={24} />
        </Pressable>
      ),
      headerTitle: 'Music Player',
      headerRight: () => (
        <Pressable
          onPress={() => {
            setIsVisible(true)
          }}
          hitSlop={48}
          accessibilityLabel="Rename audio"
        >
          <FontAwesome5 name="pencil-alt" size={24} />
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
              <H1>{trackName}</H1>
            </View>

            <Controls
              playSound={playAudio}
              pauseSound={pauseAudio}
              currentPosition={currentPosition}
              isPlaying={isPlaying}
              setPosition={setAudioPosition}
              isEnabled={isSoundLoaded}
            />

            <TrackSlider
              duration={duration}
              currentPosition={currentPosition}
              onPositionChange={setAudioPosition}
              disabled={false}
            />

            <Tempo
              setRate={setAudioSpeed}
              disabled={details.source === 'Spotify' || !isSoundLoaded}
            />
          </View>
          <View sx={{ flex: 1, alignItems: 'flex-start' }}>
            <Cues
              currentPosition={currentPosition}
              onPlayFromPosition={setAudioPosition}
              audioId={audioId}
            />
          </View>
        </View>
      </SafeAreaView>

      <Dialog isVisible={isVisible} onBackdropPress={closeDialog}>
        <Dialog.Title title="Rename audio" />
        <Input
          placeholder="New name"
          sx={{ mt: 3 }}
          value={inputValue}
          onChange={onInputValueChange}
        />
        <View
          sx={{
            display: 'flex',
            flexDirection: 'row',
            mt: 3,
            justifyContent: 'flex-end',
            gap: 3,
          }}
        >
          <Pressable onPress={closeDialog}>
            <Text>Cancel</Text>
          </Pressable>
          <Pressable onPress={onRenameAudio}>
            <Text>Save</Text>
          </Pressable>
        </View>
      </Dialog>
    </>
  )
}

export default MusicPlayer
