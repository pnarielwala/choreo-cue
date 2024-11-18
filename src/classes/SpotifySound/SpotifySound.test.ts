import SpotifySound from './SpotifySound'
import { AxiosError } from 'axios'

import {
  getAvailableDevices,
  pausePlayback,
  seekToPosition,
  setRepeatMode,
  startPlayback,
} from 'api/spotifyClient'
import Toast from 'react-native-toast-message'
import {
  anActiveUserDevice,
  anInactiveUserDevice,
} from '__test-utils__/builders/spotifyBuilder'
import {
  anApiErrorResponse,
  anApiResponse,
} from '__test-utils__/builders/apiResponseBuilder'

jest.mock('api/spotifyClient')
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}))
jest.mock('resources/rollbar', () => ({
  error: jest.fn(),
}))

describe('SpotifySound', () => {
  let spotifySound: SpotifySound
  const mockTrack = {
    uri: 'spotify:track:123',
    duration_ms: 300000,
  } as SpotifyApi.TrackObjectFull

  beforeEach(() => {
    spotifySound = new SpotifySound(mockTrack)
  })

  afterEach(() => {
    jest.clearAllMocks()
    spotifySound.unloadAsync()
  })

  it('should call setRepeatMode and getAvailableDevices on loadAsync', async () => {
    jest.mocked(getAvailableDevices).mockResolvedValue(
      anApiResponse({
        data: { devices: [anActiveUserDevice(), anInactiveUserDevice()] },
      })
    )
    await spotifySound.loadAsync()
    expect(getAvailableDevices).toHaveBeenCalled()
    expect(setRepeatMode).toHaveBeenCalledWith('track')
  })

  it('should call startPlayback on playAsync', async () => {
    await spotifySound.playAsync()
    expect(startPlayback).toHaveBeenCalledWith({
      uris: [mockTrack.uri],
      position_ms: 0,
    })
  })

  it('should call pausePlayback on pauseAsync is already playing', async () => {
    await spotifySound.pauseAsync()
    expect(pausePlayback).toHaveBeenCalled()
  })

  it('should call seekToPosition on setPositionAsync', async () => {
    spotifySound.isPlaying = true
    await spotifySound.setPositionAsync(1000)
    expect(seekToPosition).toHaveBeenCalledWith(1000)
  })

  it('should handle errors in loadAsync', async () => {
    jest.mocked(getAvailableDevices).mockResolvedValue(
      anApiResponse({
        data: { devices: [anActiveUserDevice(), anInactiveUserDevice()] },
      })
    )
    const error = anApiErrorResponse({
      status: 401,
      data: { error: { message: 'Unauthorized' } },
    })
    jest.mocked(setRepeatMode).mockRejectedValue(error)
    await spotifySound.loadAsync()
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Spotify Unauthorized',
      text2: 'Try loading the project again',
    })
  })

  it('should handle errors in playAsync', async () => {
    const error = anApiErrorResponse({
      status: 401,
      data: { error: { message: 'Unauthorized' } },
    })
    ;(startPlayback as jest.Mock).mockRejectedValue(error)
    await spotifySound.playAsync()
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Spotify Unauthorized',
      text2: 'Try loading the project again',
    })
  })

  it('should handle errors in pauseAsync', async () => {
    const error = anApiErrorResponse({
      status: 401,
      data: { error: { message: 'Unauthorized' } },
    })
    ;(pausePlayback as jest.Mock).mockRejectedValue(error)
    await spotifySound.pauseAsync()
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Spotify Unauthorized',
      text2: 'Try loading the project again',
    })
  })

  it('should handle errors in setPositionAsync', async () => {
    const error = anApiErrorResponse({
      status: 401,
      data: { error: { message: 'Unauthorized' } },
    })
    ;(seekToPosition as jest.Mock).mockRejectedValue(error)
    spotifySound.isPlaying = true
    await spotifySound.setPositionAsync(1000)
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Spotify Unauthorized',
      text2: 'Try loading the project again',
    })
  })
})
