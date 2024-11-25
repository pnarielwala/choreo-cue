import Sound from 'classes/Sound'
import { Audio, AVPlaybackSource } from 'expo-av'
import { Platform } from 'react-native'
import Toast from 'react-native-toast-message'
import rollbar from 'resources/rollbar'

// TODO: Remove when expo sdk updated to v43
const adjustURIForAndroid = (sound: Exclude<AVPlaybackSource, number>) => {
  let uri = sound.uri
  if (uri.includes('%40')) {
    uri = uri.replace('%40', '%2540')
  }
  if (uri.includes('%2F')) {
    uri = uri.replace('%2F', '%252F')
  }
  uri = 'file://' + uri

  return { ...sound, uri }
}

export default class FileSound extends Sound {
  sound: Audio.Sound
  duration: number = 0
  constructor() {
    super()
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    })
    this.sound = new Audio.Sound()
    this.type = 'iCloud'
  }

  async loadAsync(data: Exclude<AVPlaybackSource, number>) {
    try {
      const track =
        Platform.OS === 'android'
          ? await this.sound.loadAsync(adjustURIForAndroid(data))
          : await this.sound.loadAsync(data)

      // console.log('track', track)
      if (track.isLoaded) {
        this.duration = track.playableDurationMillis ?? 0
      }

      this.isLoaded = track.isLoaded
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Error loading sound from files',
        text2:
          "Try recreating the sound by reimporting the file from it's source",

        visibilityTime: 5000,
      })
      rollbar.error(e.message)
    }
  }

  async playAsync() {
    await this.sound.playAsync()
  }

  async pauseAsync() {
    await this.sound.pauseAsync()
  }

  async setPositionAsync(position) {
    await this.sound.setPositionAsync(position)
  }

  async setRateAsync(tempo: number) {
    await this.sound.setRateAsync(tempo, true)
  }

  playbackListener(callback) {
    this.sound.setOnPlaybackStatusUpdate(callback)
  }

  async unloadAsync() {
    await this.sound.unloadAsync()
  }
}
