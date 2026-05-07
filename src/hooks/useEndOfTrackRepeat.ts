import { useEffect, useRef } from 'react'

import type { RepeatMode } from 'types/Music'

const NEAR_END_THRESHOLD_MS = 250
const REPEAT_THROTTLE_MS = 1000

export const pickRepeatTarget = (
  mode: RepeatMode,
  lastCueStart: number | null,
  firstCueStart: number | null
): number | null => {
  if (mode === 'off') return null
  if (mode === 'song') return 0
  return lastCueStart ?? firstCueStart ?? 0
}

type Args = {
  isPlaying: boolean
  currentPosition: number
  duration: number
  repeatMode: RepeatMode
  lastActivatedCueStart: number | null
  firstCueStart: number | null
  setAudioPosition: (positionMs: number) => Promise<void> | void
  playAudio: () => void
}

// Detects end-of-track via the playing→paused transition while near `duration`,
// then re-seeks and resumes per the active repeat mode.
const useEndOfTrackRepeat = ({
  isPlaying,
  currentPosition,
  duration,
  repeatMode,
  lastActivatedCueStart,
  firstCueStart,
  setAudioPosition,
  playAudio,
}: Args) => {
  const prevIsPlayingRef = useRef(false)
  const lastRepeatAtRef = useRef(0)

  useEffect(() => {
    const wasPlaying = prevIsPlayingRef.current
    prevIsPlayingRef.current = isPlaying
    if (repeatMode === 'off') return
    if (!wasPlaying || isPlaying) return
    if (duration <= 0) return
    if (currentPosition < duration - NEAR_END_THRESHOLD_MS) return
    const now = Date.now()
    if (now - lastRepeatAtRef.current < REPEAT_THROTTLE_MS) return
    lastRepeatAtRef.current = now
    const target = pickRepeatTarget(
      repeatMode,
      lastActivatedCueStart,
      firstCueStart
    )
    if (target == null) return
    // Both useLocalPlayer and useSpotifyPlayer log/swallow their own native
    // errors, so we don't expect rejections here. The catch is a safety net
    // to keep a future implementation from producing an unhandled rejection.
    Promise.resolve()
      .then(() => setAudioPosition(target))
      .then(() => playAudio())
      .catch(() => {})
  }, [
    isPlaying,
    currentPosition,
    duration,
    repeatMode,
    lastActivatedCueStart,
    firstCueStart,
    setAudioPosition,
    playAudio,
  ])
}

export default useEndOfTrackRepeat
