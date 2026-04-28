import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import {
  Easing,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native'
import {
  View,
  H1,
  Pressable,
  Input,
  Button,
  ScreenLayout,
  useTheme,
} from 'design'
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
import { touchAudioFile, updateAudioName } from 'api/db/audio'

export type PropsT = ScreenPropsT<'Player'>

const MusicPlayer = (props: PropsT) => {
  const { id: audioId } = props.route.params.musicData
  useKeepAwake()
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>

  useEffect(() => {
    touchAudioFile(audioId).catch(() => {})
  }, [audioId])
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

  const [trackName, setTrackName] = React.useState(details.trackName)

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
          <FontAwesome5 name="chevron-left" size={24} color={colors.text} />
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
          <FontAwesome5 name="pencil-alt" size={22} color={colors.text} />
        </Pressable>
      ),
    })
  }, [props, colors.text])

  return (
    <>
      <ScreenLayout padding={3}>
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
              {trackName}
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
            onPlayAudio={playAudio}
            onSeekToPosition={setAudioPosition}
            audioId={audioId}
          />
        </View>
      </ScreenLayout>

      <Dialog
        isVisible={isVisible}
        onBackdropPress={closeDialog}
        overlayStyle={{ backgroundColor: colors.surfaceElevated }}
      >
        <Dialog.Title
          title="Rename audio"
          titleStyle={{ color: colors.text }}
        />
        <Input
          placeholder="New name"
          sx={{ mt: 3 }}
          value={inputValue}
          onChange={onInputValueChange}
        />
        <View
          sx={{
            flexDirection: 'row',
            mt: 3,
            justifyContent: 'flex-end',
            gap: 3,
          }}
        >
          <Button variant="ghost" size="sm" onPress={closeDialog}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onPress={onRenameAudio}>
            Save
          </Button>
        </View>
      </Dialog>
    </>
  )
}

export default MusicPlayer
