import 'react-native-gesture-handler'
import React, { useEffect, useRef } from 'react'
import {
  Easing,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native'
import {
  View,
  H1,
  Text,
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
import useCues from 'hooks/useCues'
import useLiveActivity from 'hooks/useLiveActivity'
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

  // Pause playback when the user leaves the player screen. Using a ref so
  // we always invoke the latest pauseAudio (which closes over the current
  // connection state etc.) on unmount, instead of a stale first-render copy.
  const pauseRef = useRef<() => void>(() => {})
  const {
    playAudio,
    pauseAudio,
    setAudioPosition,
    setAudioSpeed,
    isPlaying,
    currentPosition,
    duration,
    details,
    capabilities,
    connectionState,
    hasActiveSession,
  } = useMusicPlayer(props.route.params.musicData)
  const isSpotify = props.route.params.musicData.source === 'Spotify'
  const showOpenSpotifyBanner =
    isSpotify && connectionState === 'disconnected' && !hasActiveSession

  pauseRef.current = pauseAudio
  useEffect(() => {
    return () => {
      try {
        pauseRef.current()
      } catch {
        // expo-audio may have already released the native shared object
        // by the time this cleanup fires (especially when navigating
        // between two tracks back-to-back). Safe to ignore.
      }
    }
  }, [])

  const [trackName, setTrackName] = React.useState(details.trackName)

  const { data: cues } = useCues(audioId)
  const cuesArr = cues ?? []

  type ActiveLoop = { cueId: number; start: number; durationMs: number }
  const [activeLoop, setActiveLoop] = React.useState<ActiveLoop | null>(null)
  const lastLoopSeekAtRef = useRef<number>(0)

  // Drive the loop: when playing within an active loop, jump back once we
  // reach (start + durationMs). Guard against re-firing during the seek.
  useEffect(() => {
    if (!activeLoop || !isPlaying) return
    if (currentPosition < activeLoop.start) return
    const elapsed = currentPosition - activeLoop.start
    if (elapsed < activeLoop.durationMs) return
    const now = Date.now()
    if (now - lastLoopSeekAtRef.current < 250) return
    lastLoopSeekAtRef.current = now
    setAudioPosition(activeLoop.start)
  }, [currentPosition, activeLoop, isPlaying, setAudioPosition])

  // Pause cancels any active loop so we don't unexpectedly resume + jump.
  useEffect(() => {
    if (!isPlaying && activeLoop) setActiveLoop(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying])

  // Clear the loop on unmount.
  useEffect(() => () => setActiveLoop(null), [])

  const onCueActivated = (cue: {
    id: number
    start: number
    loopDurationMs: number | null
  }) => {
    if (cue.loopDurationMs != null) {
      setActiveLoop({
        cueId: cue.id,
        start: cue.start,
        durationMs: cue.loopDurationMs,
      })
      lastLoopSeekAtRef.current = 0
    } else {
      setActiveLoop(null)
    }
  }

  useLiveActivity({
    audioId,
    trackName,
    isPlaying,
    currentMs: currentPosition,
    durationMs: duration,
    cues: cuesArr.map((c) => ({
      positionMs: c.start,
      label: c.label,
      loopDurationMs: c.loopDurationMs,
      colorSlot: c.cueNumber as 1 | 2 | 3 | 4,
    })),
    onCueTap: async (slot) => {
      const cue = cuesArr[slot - 1]
      console.log(
        '[LiveActivity] onCueTap handler: slot=',
        slot,
        'cueId=',
        cue?.id
      )
      if (!cue) return
      try {
        onCueActivated(cue)
        await setAudioPosition(cue.start)
        console.log('[LiveActivity] setAudioPosition resolved')
        playAudio()
        console.log('[LiveActivity] playAudio called')
      } catch (err) {
        console.log('[LiveActivity] seek/play failed:', err)
      }
    },
  })

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

          {showOpenSpotifyBanner ? (
            <View
              sx={{
                backgroundColor: 'surfaceMuted',
                borderRadius: 8,
                p: 3,
                mt: 3,
                width: '100%',
              }}
            >
              <Text sx={{ mb: 3, color: 'text' }}>
                Spotify isn't running. Tap resume to wake it back up - if no
                Spotify device is active we'll bounce you into the app to start
                playback.
              </Text>
              <Button variant="primary" size="sm" onPress={() => playAudio()}>
                Resume playback
              </Button>
            </View>
          ) : (
            <Tempo setRate={setAudioSpeed} disabled={!capabilities.tempo} />
          )}
        </View>
        <View sx={{ flex: 1, alignItems: 'flex-start' }}>
          <Cues
            currentPosition={currentPosition}
            onSeekToCue={async (cue) => {
              onCueActivated(cue)
              await setAudioPosition(cue.start)
            }}
            onPlayCue={async (cue) => {
              onCueActivated(cue)
              await setAudioPosition(cue.start)
              playAudio()
            }}
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
