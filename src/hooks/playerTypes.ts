export type PlayerConnectionState =
  | 'connected'
  | 'app-remote'
  | 'web-api'
  | 'disconnected'

export type PlayerCapabilities = {
  tempo: boolean
}

export type PlayerHookResult = {
  playAudio: () => void
  pauseAudio: () => void
  setAudioPosition: (positionMs: number) => Promise<void> | void
  setAudioSpeed: (tempo: number) => void
  isPlaying: boolean
  currentPosition: number
  duration: number
  details: { trackName: string }
  capabilities: PlayerCapabilities
  connectionState: PlayerConnectionState
  hasActiveSession: boolean
  resumeOnSpotify?: () => Promise<void>
}
