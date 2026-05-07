export type RepeatMode = 'off' | 'song' | 'cue'

export const REPEAT_MODES: RepeatMode[] = ['off', 'song', 'cue']

export const isRepeatMode = (v: unknown): v is RepeatMode =>
  typeof v === 'string' && (REPEAT_MODES as string[]).includes(v)
