import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio'
import { useEffect } from 'react'

import analytics from 'resources/analytics'
import type { PlayerHookResult } from './playerTypes'

const useLocalPlayer = (
  source: { uri: string; name: string } | undefined
): PlayerHookResult => {
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

  // expo-audio occasionally releases its native shared object before our
  // own cleanups run (e.g. fast back-to-back navigation between two
  // tracks). Wrap the calls so a stale-handle exception doesn't surface as
  // a render error.
  const playAudio = () => {
    try {
      player.play()
    } catch {
      /* native object already released */
    }
  }
  const pauseAudio = () => {
    try {
      player.pause()
    } catch {
      /* native object already released */
    }
  }
  const setAudioPosition = async (position: number) => {
    try {
      await player.seekTo(position / 1000)
    } catch {
      /* native object already released */
    }
  }
  const setAudioSpeed = (tempo: number) => {
    try {
      player.setPlaybackRate(tempo)
    } catch {
      /* native object already released */
    }
  }

  return {
    playAudio,
    pauseAudio,
    setAudioPosition,
    setAudioSpeed,
    isPlaying: status.playing,
    currentPosition: Math.round(status.currentTime * 1000),
    duration: Math.round(status.duration * 1000),
    details: { trackName: source?.name || 'Unnamed audio' },
    capabilities: { tempo: true },
    connectionState: 'connected',
    hasActiveSession: true,
  }
}

export default useLocalPlayer
