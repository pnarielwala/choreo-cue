import {
  requireNativeModule,
  EventEmitter,
  type EventSubscription,
} from 'expo-modules-core'
import { Platform } from 'react-native'

export type CueSlot = {
  number: 1 | 2 | 3 | 4
  positionMs: number | null
}

export type ActivityState = {
  audioId: number
  trackName: string
  isPlaying: boolean
  currentMs: number
  durationMs: number
  cues: CueSlot[]
}

export type CueTapEvent = {
  audioId: number
  cueNumber: 1 | 2 | 3 | 4
}

type LiveActivityNativeModule = {
  startActivity(state: ActivityState): Promise<string | null>
  updateActivity(activityId: string, state: ActivityState): Promise<void>
  endActivity(activityId: string): Promise<void>
  areActivitiesEnabled(): boolean
}

const noop: LiveActivityNativeModule = {
  startActivity: async () => null,
  updateActivity: async () => {},
  endActivity: async () => {},
  areActivitiesEnabled: () => false,
}

const native: LiveActivityNativeModule =
  Platform.OS === 'ios'
    ? (() => {
        try {
          return requireNativeModule('LiveActivityModule')
        } catch {
          return noop
        }
      })()
    : noop

const emitter =
  Platform.OS === 'ios'
    ? (() => {
        try {
          return new EventEmitter(requireNativeModule('LiveActivityModule'))
        } catch {
          return null
        }
      })()
    : null

export function startActivity(state: ActivityState): Promise<string | null> {
  return native.startActivity(state)
}

export function updateActivity(
  activityId: string,
  state: ActivityState
): Promise<void> {
  return native.updateActivity(activityId, state)
}

export function endActivity(activityId: string): Promise<void> {
  return native.endActivity(activityId)
}

export function areActivitiesEnabled(): boolean {
  return native.areActivitiesEnabled()
}

export function addCueTapListener(
  listener: (event: CueTapEvent) => void
): EventSubscription {
  if (!emitter) {
    return { remove: () => {} }
  }
  return (emitter as any).addListener('onCueTap', listener)
}
