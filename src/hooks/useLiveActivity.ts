import { useEffect, useMemo, useRef } from 'react'

import {
  startActivity,
  updateActivity,
  endActivity,
  addCueTapListener,
  areActivitiesEnabled,
  type ActivityState,
  type CueSlot,
} from 'live-activity'

type CueInput = {
  positionMs: number | null
  label: string | null
  loopDurationMs: number | null
  colorSlot?: 1 | 2 | 3 | 4 | null
}

type Args = {
  audioId: number
  trackName: string
  isPlaying: boolean
  currentMs: number
  durationMs: number
  cues: CueInput[]
  onCueTap: (slot: 1 | 2 | 3 | 4) => void
}

const SLOT_NUMBERS: ReadonlyArray<1 | 2 | 3 | 4> = [1, 2, 3, 4]
const POSITION_UPDATE_INTERVAL_MS = 1000

const buildCueSlots = (cues: CueInput[]): CueSlot[] =>
  SLOT_NUMBERS.map((n, idx) => {
    const cue = cues[idx]
    return {
      number: n,
      positionMs: cue?.positionMs ?? null,
      label: cue?.label ?? null,
      loopDurationMs: cue?.loopDurationMs ?? null,
      colorSlot: cue?.colorSlot ?? null,
    }
  })

const useLiveActivity = (args: Args) => {
  const activityIdRef = useRef<string | null>(null)
  const lastPositionUpdateRef = useRef<number>(0)
  const onCueTapRef = useRef(args.onCueTap)
  onCueTapRef.current = args.onCueTap

  useEffect(() => {
    const sub = addCueTapListener((event) => {
      console.log('[LiveActivity] onCueTap event received:', event)
      if (event.audioId !== args.audioId) {
        console.log(
          '[LiveActivity] event audioId',
          event.audioId,
          'does not match current',
          args.audioId,
          '- ignoring'
        )
        return
      }
      console.log('[LiveActivity] dispatching cueNumber', event.cueNumber)
      onCueTapRef.current(event.cueNumber)
    })
    return () => sub.remove()
  }, [args.audioId])

  const cueSlots = useMemo(() => buildCueSlots(args.cues), [args.cues])

  useEffect(() => {
    let cancelled = false
    const initialState: ActivityState = {
      audioId: args.audioId,
      trackName: args.trackName,
      isPlaying: args.isPlaying,
      currentMs: args.currentMs,
      durationMs: args.durationMs,
      cues: cueSlots,
    }
    console.log('[LiveActivity] areActivitiesEnabled:', areActivitiesEnabled())
    console.log('[LiveActivity] startActivity called with state:', initialState)
    startActivity(initialState)
      .then((id) => {
        console.log('[LiveActivity] startActivity resolved with id:', id)
        if (cancelled && id) {
          endActivity(id).catch(() => {})
          return
        }
        activityIdRef.current = id
      })
      .catch((err) => {
        console.log('[LiveActivity] startActivity rejected:', err)
      })
    return () => {
      cancelled = true
      const id = activityIdRef.current
      activityIdRef.current = null
      if (id) {
        endActivity(id).catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.audioId])

  const cuesSignature = cueSlots
    .map(
      (c) =>
        `${c.positionMs ?? -1}:${c.label ?? ''}:${c.loopDurationMs ?? -1}:${c.colorSlot ?? -1}`
    )
    .join('|')

  useEffect(() => {
    const id = activityIdRef.current
    if (!id) return
    updateActivity(id, {
      audioId: args.audioId,
      trackName: args.trackName,
      isPlaying: args.isPlaying,
      currentMs: args.currentMs,
      durationMs: args.durationMs,
      cues: cueSlots,
    }).catch(() => {})
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
      cues: cueSlots,
    }).catch(() => {})
  }, [args.currentMs])
}

export default useLiveActivity
