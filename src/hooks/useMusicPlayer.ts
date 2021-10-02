import { Audio } from 'expo-av'
import { AVPlaybackSource, AVPlaybackStatus } from 'expo-av/build/AV'
import { useEffect, useState } from 'react'

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

  const loadSoundFromData = async (data: AVPlaybackSource) => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    })
    const sound = new Audio.Sound()
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
    setSound(sound)

    const track = await sound.loadAsync(data)

    if (track.isLoaded) {
      track.durationMillis && setDuration(track.durationMillis)
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
    source ? loadSoundFromData(source) : console.log('Sound missing!')
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
