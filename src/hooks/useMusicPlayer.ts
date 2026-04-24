import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio'
import { useEffect } from 'react'

import analytics from 'resources/analytics'

const useAudioPlayerHook = (
  source: { uri: string; name: string } | undefined
) => {
  const player = useAudioPlayer(source ? { uri: source.uri } : null)
  const status = useAudioPlayerStatus(player)

  useEffect(() => {
    if (!source) {
      analytics.error('Sound missing!')
      return
    }

    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    })
  }, [])

  const playAudio = () => player.play()
  const pauseAudio = () => player.pause()
  const setAudioPosition = async (position: number) =>
    player.seekTo(position / 1000)
  const setAudioSpeed = (tempo: number) => player.setPlaybackRate(tempo)

  return {
    playAudio,
    pauseAudio,
    setAudioPosition,
    setAudioSpeed,
    isPlaying: status.playing,
    currentPosition: Math.round(status.currentTime * 1000),
    duration: Math.round(status.duration * 1000),
    details: { trackName: source?.name || 'Unnamed audio' },
  }
}

export default useAudioPlayerHook
