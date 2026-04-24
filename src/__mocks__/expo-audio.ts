import { useState, useEffect, useRef } from 'react'

let _currentTime = 0
let _playing = false
let _rate = 1
let _listeners: Set<() => void> = new Set()
let _playInterval: ReturnType<typeof setInterval> | null = null

function notify() {
  _listeners.forEach((fn) => fn())
}

const mockPlayer = {
  play: jest.fn(() => {
    _playing = true
    if (_playInterval) clearInterval(_playInterval)
    _playInterval = setInterval(() => {
      _currentTime += 0.05 * _rate
      notify()
    }, 50)
    notify()
  }),
  pause: jest.fn(() => {
    _playing = false
    if (_playInterval) {
      clearInterval(_playInterval)
      _playInterval = null
    }
    notify()
  }),
  seekTo: jest.fn((seconds: number) => {
    _currentTime = seconds
    notify()
  }),
  setPlaybackRate: jest.fn((rate: number) => {
    _rate = rate
  }),
}

function reset() {
  _currentTime = 0
  _playing = false
  _rate = 1
  _listeners.clear()
  if (_playInterval) clearInterval(_playInterval)
  _playInterval = null
  mockPlayer.play.mockClear()
  mockPlayer.pause.mockClear()
  mockPlayer.seekTo.mockClear()
  mockPlayer.setPlaybackRate.mockClear()
}

export const useAudioPlayer = jest.fn(() => {
  useEffect(() => reset, [])
  return mockPlayer
})

export const useAudioPlayerStatus = jest.fn(() => {
  const [, setTick] = useState(0)
  const tickRef = useRef(() => setTick((n) => n + 1))

  useEffect(() => {
    _listeners.add(tickRef.current)
    return () => {
      _listeners.delete(tickRef.current)
    }
  }, [])

  return {
    playing: _playing,
    currentTime: _currentTime,
    duration: 240,
    id: 'mock',
    playbackState: _playing ? 'playing' : 'paused',
    timeControlStatus: _playing ? 'playing' : 'paused',
    reasonForWaitingToPlay: '',
    mute: false,
    loop: false,
    didJustFinish: false,
  }
})

export const setAudioModeAsync = jest.fn()
