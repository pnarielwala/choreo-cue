import { useEffect, useRef } from 'react'

import {
  startActivity,
  updateActivity,
  endActivity,
  addCueTapListener,
  type ActivityState,
  type CueSlot,
} from 'live-activity'

type Args = {
  audioId: number
  trackName: string
  isPlaying: boolean
  currentMs: number
  durationMs: number
  cuesByNumber: Record<number, number>
  onCueTap: (cueNumber: 1 | 2 | 3 | 4) => void
}

const SLOT_NUMBERS: ReadonlyArray<1 | 2 | 3 | 4> = [1, 2, 3, 4]
const POSITION_UPDATE_INTERVAL_MS = 1000

const buildCueSlots = (cuesByNumber: Record<number, number>): CueSlot[] =>
  SLOT_NUMBERS.map((n) => ({
    number: n,
    positionMs: cuesByNumber[n] ?? null,
  }))

const useLiveActivity = (args: Args) => {
  const activityIdRef = useRef<string | null>(null)
  const lastPositionUpdateRef = useRef<number>(0)
  const onCueTapRef = useRef(args.onCueTap)
  onCueTapRef.current = args.onCueTap

  // Subscribe once to cue-tap events from the widget extension.
  useEffect(() => {
    const sub = addCueTapListener((event) => {
      if (event.audioId !== args.audioId) return
      onCueTapRef.current(event.cueNumber)
    })
    return () => sub.remove()
  }, [args.audioId])

  // Start / end the activity for the lifetime of the screen.
  useEffect(() => {
    let cancelled = false
    const initialState: ActivityState = {
      audioId: args.audioId,
      trackName: args.trackName,
      isPlaying: args.isPlaying,
      currentMs: args.currentMs,
      durationMs: args.durationMs,
      cues: buildCueSlots(args.cuesByNumber),
    }
    startActivity(initialState)
      .then((id) => {
        if (cancelled && id) {
          endActivity(id).catch(() => {})
          return
        }
        activityIdRef.current = id
      })
      .catch(() => {})
    return () => {
      cancelled = true
      const id = activityIdRef.current
      activityIdRef.current = null
      if (id) {
        endActivity(id).catch(() => {})
      }
    }
    // Intentionally only on audioId: a new track means a new activity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.audioId])

  // Push state updates. Throttle position-only changes; push immediately
  // on play-state, cue, or track-name changes.
  const cuesSignature = SLOT_NUMBERS.map(
    (n) => args.cuesByNumber[n] ?? -1
  ).join(',')
  useEffect(() => {
    const id = activityIdRef.current
    if (!id) return
    const state: ActivityState = {
      audioId: args.audioId,
      trackName: args.trackName,
      isPlaying: args.isPlaying,
      currentMs: args.currentMs,
      durationMs: args.durationMs,
      cues: buildCueSlots(args.cuesByNumber),
    }
    updateActivity(id, state).catch(() => {})
    lastPositionUpdateRef.current = Date.now()
  }, [
    args.audioId,
    args.trackName,
    args.isPlaying,
    args.durationMs,
    cuesSignature,
  ])

  useEffect(() => {
    const id = activityIdRef.current
    if (!id) return
    const now = Date.now()
    if (now - lastPositionUpdateRef.current < POSITION_UPDATE_INTERVAL_MS) {
      return
    }
    lastPositionUpdateRef.current = now
    updateActivity(id, {
      audioId: args.audioId,
      trackName: args.trackName,
      isPlaying: args.isPlaying,
      currentMs: args.currentMs,
      durationMs: args.durationMs,
      cues: buildCueSlots(args.cuesByNumber),
    }).catch(() => {})
  }, [args.currentMs])
}

export default useLiveActivity
