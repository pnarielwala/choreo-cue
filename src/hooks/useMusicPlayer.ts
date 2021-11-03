import { Audio } from 'expo-av'
import { AVPlaybackSource, AVPlaybackStatus } from 'expo-av/build/AV'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

import rollbar from 'resources/rollbar'

// TODO: Remove when expo sdk updated to v43
const adjustURIForAndroid = (sound: Exclude<AVPlaybackSource, number>) => {
  let uri = sound.uri
  if (uri.includes('%40')) {
    uri = uri.replace('%40', '%2540')
  }
  if (uri.includes('%2F')) {
    uri = uri.replace('%2F', '%252F')
  }
  uri = 'file://' + uri

  return { ...sound, uri }
}

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
      const track =
        Platform.OS === 'android'
          ? await sound.loadAsync(adjustURIForAndroid(data))
          : await sound.loadAsync(data)

      if (track.isLoaded) {
        track.durationMillis && setDuration(track.durationMillis)
      }
    } catch (error: any) {
      rollbar.error('Expo Audio loadAsync failed', error)
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
    source ? loadSoundFromData(source) : rollbar.error('Sound missing!')
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
