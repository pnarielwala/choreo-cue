import Toast from 'react-native-toast-message'
import rollbar from 'resources/rollbar'
import FileSound from './FileSound'

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}))

jest.mock('resources/rollbar', () => ({
  error: jest.fn(),
}))

describe('FileSound', () => {
  let fileSound: FileSound

  beforeEach(() => {
    fileSound = new FileSound()
  })

  it('should initialize with default values', () => {
    expect(fileSound.sound).toBeDefined()
    expect(fileSound.duration).toBe(0)
    expect(fileSound.type).toBe('iCloud')
  })

  it('should load sound asynchronously', async () => {
    const data = { uri: 'test-uri' }
    const loadAsyncMock = jest
      .spyOn(fileSound.sound, 'loadAsync')
      .mockResolvedValue({
        isLoaded: true,
        playableDurationMillis: 1000,
        uri: data.uri,
        progressUpdateIntervalMillis: 1000,
        positionMillis: 0,
        shouldPlay: false,
        isPlaying: false,
        isBuffering: false,
        rate: 1.0,
        shouldCorrectPitch: false,
        volume: 1.0,
        isMuted: false,
        isLooping: false,
        didJustFinish: false,
        audioPan: 0.0,
      })

    await fileSound.loadAsync(data)

    expect(loadAsyncMock).toHaveBeenCalledWith(data)
    expect(fileSound.duration).toBe(1000)
    expect(fileSound.isLoaded).toBe(true)
  })

  it('should handle loadAsync errors', async () => {
    const data = { uri: 'test-uri' }
    jest
      .spyOn(fileSound.sound, 'loadAsync')
      .mockRejectedValue(new Error('Load error'))

    await fileSound.loadAsync(data)

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Error loading sound from files',
      text2:
        "Try recreating the sound by reimporting the file from it's source",
      visibilityTime: 5000,
    })
    expect(rollbar.error).toHaveBeenCalledWith('Load error')
  })

  it('should play sound asynchronously', async () => {
    const playAsyncMock = jest.spyOn(fileSound.sound, 'playAsync')

    await fileSound.playAsync()

    expect(playAsyncMock).toHaveBeenCalled()
  })

  it('should pause sound asynchronously', async () => {
    const pauseAsyncMock = jest.spyOn(fileSound.sound, 'pauseAsync')

    await fileSound.pauseAsync()

    expect(pauseAsyncMock).toHaveBeenCalled()
  })

  it('should set position asynchronously', async () => {
    const setPositionAsyncMock = jest.spyOn(fileSound.sound, 'setPositionAsync')
    const position = 500

    await fileSound.setPositionAsync(position)

    expect(setPositionAsyncMock).toHaveBeenCalledWith(position)
  })

  it('should set rate asynchronously', async () => {
    const setRateAsyncMock = jest.spyOn(fileSound.sound, 'setRateAsync')
    const tempo = 1.5

    await fileSound.setRateAsync(tempo)

    expect(setRateAsyncMock).toHaveBeenCalledWith(tempo, true)
  })

  it('should set playback listener', () => {
    const setOnPlaybackStatusUpdateMock = jest.spyOn(
      fileSound.sound,
      'setOnPlaybackStatusUpdate'
    )
    const callback = jest.fn()

    fileSound.playbackListener(callback)

    expect(setOnPlaybackStatusUpdateMock).toHaveBeenCalledWith(callback)
  })

  it('should unload sound asynchronously', async () => {
    const unloadAsyncMock = jest.spyOn(fileSound.sound, 'unloadAsync')

    await fileSound.unloadAsync()

    expect(unloadAsyncMock).toHaveBeenCalled()
  })
})
