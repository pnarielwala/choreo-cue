class Sound {
  type: 'iCloud' | 'Spotify' = 'iCloud'
  isLoaded: boolean = false

  async loadAsync(data: any) {}

  async playAsync() {}

  async pauseAsync() {}

  async setPositionAsync(position: number) {}

  async setRateAsync(tempo: number, shouldCorrectPitch?: boolean) {}

  playbackListener(callback) {}

  async unloadAsync() {}
}

export default Sound
