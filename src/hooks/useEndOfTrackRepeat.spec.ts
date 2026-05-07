import { renderHook } from '@testing-library/react-native'

import useEndOfTrackRepeat, { pickRepeatTarget } from './useEndOfTrackRepeat'

describe('pickRepeatTarget', () => {
  it('returns null when mode is off', () => {
    expect(pickRepeatTarget('off', 12345, 6789)).toBeNull()
  })
  it('returns 0 when mode is song', () => {
    expect(pickRepeatTarget('song', 12345, 6789)).toBe(0)
  })
  it('returns lastCueStart when mode is cue and one is set', () => {
    expect(pickRepeatTarget('cue', 12345, 6789)).toBe(12345)
  })
  it('falls back to firstCueStart when no last cue', () => {
    expect(pickRepeatTarget('cue', null, 6789)).toBe(6789)
  })
  it('falls back to 0 when no cues at all', () => {
    expect(pickRepeatTarget('cue', null, null)).toBe(0)
  })
})

type Args = Parameters<typeof useEndOfTrackRepeat>[0]

const baseArgs = (overrides: Partial<Args> = {}): Args => ({
  isPlaying: false,
  currentPosition: 0,
  duration: 60_000,
  repeatMode: 'off',
  lastActivatedCueStart: null,
  firstCueStart: null,
  setAudioPosition: jest.fn().mockResolvedValue(undefined),
  playAudio: jest.fn(),
  ...overrides,
})

const flush = () => new Promise<void>((resolve) => setImmediate(resolve))

describe('useEndOfTrackRepeat', () => {
  it('does nothing when mode is off, even on end-of-track transition', async () => {
    const setAudioPosition = jest.fn().mockResolvedValue(undefined)
    const playAudio = jest.fn()
    const args = baseArgs({
      isPlaying: true,
      currentPosition: 60_000,
      setAudioPosition,
      playAudio,
    })
    const { rerender } = renderHook((p: Args) => useEndOfTrackRepeat(p), {
      initialProps: args,
    })

    rerender({ ...args, isPlaying: false })
    await flush()

    expect(setAudioPosition).not.toHaveBeenCalled()
    expect(playAudio).not.toHaveBeenCalled()
  })

  it('seeks to 0 and plays on song-mode end-of-track', async () => {
    const setAudioPosition = jest.fn().mockResolvedValue(undefined)
    const playAudio = jest.fn()
    const args = baseArgs({
      isPlaying: true,
      currentPosition: 60_000,
      repeatMode: 'song',
      setAudioPosition,
      playAudio,
    })
    const { rerender } = renderHook((p: Args) => useEndOfTrackRepeat(p), {
      initialProps: args,
    })

    rerender({ ...args, isPlaying: false })
    await flush()

    expect(setAudioPosition).toHaveBeenCalledWith(0)
    expect(playAudio).toHaveBeenCalled()
  })

  it('seeks to lastActivatedCueStart on cue-mode end-of-track', async () => {
    const setAudioPosition = jest.fn().mockResolvedValue(undefined)
    const playAudio = jest.fn()
    const args = baseArgs({
      isPlaying: true,
      currentPosition: 60_000,
      repeatMode: 'cue',
      lastActivatedCueStart: 12_345,
      firstCueStart: 999,
      setAudioPosition,
      playAudio,
    })
    const { rerender } = renderHook((p: Args) => useEndOfTrackRepeat(p), {
      initialProps: args,
    })

    rerender({ ...args, isPlaying: false })
    await flush()

    expect(setAudioPosition).toHaveBeenCalledWith(12_345)
    expect(playAudio).toHaveBeenCalled()
  })

  it('falls back to firstCueStart in cue mode when no last cue is activated', async () => {
    const setAudioPosition = jest.fn().mockResolvedValue(undefined)
    const playAudio = jest.fn()
    const args = baseArgs({
      isPlaying: true,
      currentPosition: 60_000,
      repeatMode: 'cue',
      lastActivatedCueStart: null,
      firstCueStart: 999,
      setAudioPosition,
      playAudio,
    })
    const { rerender } = renderHook((p: Args) => useEndOfTrackRepeat(p), {
      initialProps: args,
    })

    rerender({ ...args, isPlaying: false })
    await flush()

    expect(setAudioPosition).toHaveBeenCalledWith(999)
  })

  it('does not fire when paused far from end-of-track (manual pause)', async () => {
    const setAudioPosition = jest.fn().mockResolvedValue(undefined)
    const playAudio = jest.fn()
    const args = baseArgs({
      isPlaying: true,
      currentPosition: 30_000,
      repeatMode: 'song',
      setAudioPosition,
      playAudio,
    })
    const { rerender } = renderHook((p: Args) => useEndOfTrackRepeat(p), {
      initialProps: args,
    })

    rerender({ ...args, isPlaying: false })
    await flush()

    expect(setAudioPosition).not.toHaveBeenCalled()
    expect(playAudio).not.toHaveBeenCalled()
  })

  it('does not fire on isPlaying=false→true transition', async () => {
    const setAudioPosition = jest.fn().mockResolvedValue(undefined)
    const playAudio = jest.fn()
    const args = baseArgs({
      isPlaying: false,
      currentPosition: 60_000,
      repeatMode: 'song',
      setAudioPosition,
      playAudio,
    })
    const { rerender } = renderHook((p: Args) => useEndOfTrackRepeat(p), {
      initialProps: args,
    })

    rerender({ ...args, isPlaying: true })
    await flush()

    expect(setAudioPosition).not.toHaveBeenCalled()
    expect(playAudio).not.toHaveBeenCalled()
  })
})
