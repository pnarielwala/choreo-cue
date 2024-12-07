import { Audio } from 'expo-av'
import { AVPlaybackSource, AVPlaybackStatus } from 'expo-av/build/AV'
import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

import analytics from 'resources/analytics'

const useAudioPlayer = (source: { uri: string; name: string } | undefined) => {
  const [sound, setSound] = useState<Audio.Sound>()
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentPosition, setCurrentPosition] = useState(0)

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying)
      setCurrentPosition(status.positionMillis)
    }
  }

  const loadSoundFromData = async (data: Exclude<AVPlaybackSource, number>) => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    })
    const sound = new Audio.Sound()
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
    setSound(sound)

    try {
      const track = await sound.loadAsync(data)

      if (track.isLoaded) {
        track.durationMillis && setDuration(track.durationMillis)
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Sorry! Unable to load audio.',
        text2:
          'Try deleting and re-adding the audio file. If the problem persists, please contact support.',
        text2Style: {
          fontSize: 12,
          flexWrap: 'wrap',
          display: 'flex',
        },
        autoHide: false,
      })
      analytics.error('Expo Audio loadAsync failed', error)
    }
  }

  async function playSound() {
    await sound?.playAsync()
  }

  async function pauseSound() {
    await sound?.pauseAsync()
  }

  const setSoundPosition = async (position: number) =>
    await sound?.setPositionAsync(position)

  const setSoundSpeed = async (tempo: number) =>
    await sound?.setRateAsync(tempo, true)

  useEffect(() => {
    source ? loadSoundFromData(source) : analytics.error('Sound missing!')
  }, [])

  useEffect(() => {
    return () => {
      sound?.unloadAsync()
    }
  }, [sound])

  return {
    playAudio: playSound,
    pauseAudio: pauseSound,
    setAudioPosition: setSoundPosition,
    setAudioSpeed: setSoundSpeed,
    isPlaying,
    currentPosition,
    duration,
    details: {
      trackName: source?.name || 'Unnamed audio',
    },
  }
}

export default useAudioPlayer
