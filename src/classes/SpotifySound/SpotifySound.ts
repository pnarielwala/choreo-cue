import {
  getAvailableDevices,
  getCurrentlyPlaying,
  pausePlayback,
  seekToPosition,
  setRepeatMode,
  startPlayback,
} from 'api/spotifyClient'
import { AxiosError } from 'axios'
import Sound from 'classes/Sound'
import { AppState, NativeEventSubscription } from 'react-native'
import Toast from 'react-native-toast-message'
import rollbar from 'resources/rollbar'

export default class SpotifySound extends Sound {
  interval: any
  track: SpotifyApi.TrackObjectFull
  isPlaying: boolean = false
  currentPosition: number = 0
  statusCallback?: (status: {
    isPlaying: boolean
    positionMillis: number
    isLoaded: boolean
    durationMillis: number
  }) => void
  appListener: NativeEventSubscription

  constructor(track: SpotifyApi.TrackObjectFull) {
    super()
    this.track = track

    this.type = 'Spotify'
    this.interval = setInterval(() => {
      if (this.isPlaying) {
        // if the track has finished playing
        if (this.currentPosition >= this.track.duration_ms) {
          this.currentPosition = 0
          this.statusCallback?.({
            isPlaying: this.isPlaying,
            positionMillis: this.currentPosition,
            isLoaded: this.isLoaded,
            durationMillis: this.track.duration_ms,
          })
        } else {
          this.currentPosition += 200
          this.statusCallback?.({
            isPlaying: this.isPlaying,
            positionMillis: this.currentPosition,
            isLoaded: this.isLoaded,
            durationMillis: this.track.duration_ms,
          })
        }
      }
    }, 200)

    this.appListener = AppState.addEventListener('change', (nextAppState) => {
      // if the app is back in focus, check if the track is still playing
      if (nextAppState === 'active') {
        getCurrentlyPlaying()
          .then((res) => {
            if (
              !res.data.is_playing ||
              res?.data?.item?.uri !== this.track.uri
            ) {
              this.isPlaying = false
            } else {
              this.isPlaying = true
              this.currentPosition = res.data?.progress_ms || 0
            }
            this.statusCallback?.({
              isPlaying: this.isPlaying,
              positionMillis: this.currentPosition,
              isLoaded: this.isLoaded,
              durationMillis: this.track.duration_ms,
            })
          })
          .catch((e) => {
            this._showUnauthorizedError(e.response)
          })
      }
    })
  }

  /**
   * Set isLoaded to true and set repeat mode to track
   */
  async loadAsync() {
    this.isLoaded = true
    try {
      const devices = await getAvailableDevices()
      const mappedDevices = devices.data.devices.map((device) => ({
        name: device.name,
        id: device.id,
        is_active: device.is_active,
        type: device.type,
      }))

      const activeDevice = mappedDevices.find((device) => device.is_active)
      if (activeDevice) {
        await setRepeatMode('track')
      }
    } catch (e: any) {
      this._showUnauthorizedError(e.response)
    }
  }

  /**
   * Play the track with Spotify API and call
   * the status callback and update isPlaying state
   */
  async playAsync() {
    try {
      await startPlayback({
        uris: [this.track.uri],
        position_ms: this.currentPosition,
      })
      this.isPlaying = true
      this.statusCallback?.({
        isPlaying: this.isPlaying,
        positionMillis: this.currentPosition,
        isLoaded: this.isLoaded,
        durationMillis: this.track.duration_ms,
      })
    } catch (e: any) {
      this._showUnauthorizedError(e.response)
    }
  }

  /**
   * Pause the track with Spotify API and call
   * the status callback and update isPlaying state
   */
  async pauseAsync() {
    try {
      await pausePlayback()
      this.isPlaying = false
      this.statusCallback?.({
        isPlaying: this.isPlaying,
        positionMillis: this.currentPosition,
        isLoaded: this.isLoaded,
        durationMillis: this.track.duration_ms,
      })
    } catch (e: any) {
      this._showUnauthorizedError(e.response)
    }
  }

  async setPositionAsync(position: number) {
    const oldPosition = this.currentPosition
    const newPosition = Math.max(0, Math.min(position, this.track.duration_ms))

    try {
      this.currentPosition = newPosition
      this.statusCallback?.({
        isPlaying: this.isPlaying,
        positionMillis: this.currentPosition,
        isLoaded: this.isLoaded,
        durationMillis: this.track.duration_ms,
      })
      if (this.isPlaying) {
        // this is so that if the user changes the song
        // and then sets a new position, we don't assume that this position
        // is available for the new song
        await seekToPosition(Math.floor(newPosition))
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      this.currentPosition = oldPosition
      this.statusCallback?.({
        isPlaying: this.isPlaying,
        positionMillis: this.currentPosition,
        isLoaded: this.isLoaded,
        durationMillis: this.track.duration_ms,
      })
      this._showUnauthorizedError(error.response)
    }
  }

  async setRateAsync(tempo) {
    // not implemented - unsupported by Spotify
  }

  playbackListener(
    callback: (status: {
      isPlaying: boolean
      positionMillis: number
      isLoaded: boolean
      durationMillis: number
    }) => void
  ) {
    this.statusCallback = callback
  }

  async unloadAsync() {
    if (this.isPlaying) {
      await this.pauseAsync()
    }
    this.appListener.remove()
    clearInterval(this.interval)
  }

  // Private methods

  _showUnauthorizedError(
    error: AxiosError<{ error: { message: string } }>['response']
  ) {
    if (error?.status === 401) {
      Toast.show({
        type: 'error',
        text1: 'Spotify Unauthorized',
        text2: 'Try loading the project again',
      })
    } else if (error?.status === 404) {
      Toast.show({
        type: 'error',
        text1: 'Spotify error',
        text2:
          error?.data.error.message +
          ". Ensure the Spotify app is open on the device you're playing from.",
        visibilityTime: 5000,
      })
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred',
      })
    }
    rollbar.error(
      `Spotify: ${error?.status} - ${error?.data.error.message} (${error?.config.method} ${error?.config?.url})`
    )
  }
}
