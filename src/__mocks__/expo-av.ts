export const Audio = {
  setAudioModeAsync: jest.fn(),
  Sound: class Sound {
    status = {
      isPlaying: false,
      positionMillis: 0,
      isLoaded: false,
      rate: 1,
    }

    timePlayStart: number = 0

    positionTimeout
    updateCallback = (status: any) => {}

    playLoop = () => {
      this.status.positionMillis = Math.floor(
        (Date.now() - this.timePlayStart) * this.status.rate
      )
      this.updateCallback(this.status)
      this.positionTimeout = setTimeout(this.playLoop, 0)
    }

    setOnPlaybackStatusUpdate = (callback: any) =>
      (this.updateCallback = callback)
    loadAsync = async () => {
      this.status.isLoaded = true
      return {
        isLoaded: true,
        durationMillis: 4 * 60 * 1000,
      }
    }
    playAsync = () => {
      this.status.isPlaying = true
      this.timePlayStart = Date.now() - this.status.positionMillis
      this.playLoop()
    }
    pauseAsync = () => {
      clearTimeout(this.positionTimeout)
      this.status.isPlaying = false
      this.timePlayStart = 0
      this.updateCallback(this.status)
    }
    setPositionAsync = async (position: number) => {
      this.status.positionMillis = position
      this.updateCallback(this.status)
    }
    setRateAsync = (tempo) => {
      this.status.rate = tempo

      this.updateCallback(this.status)
    }
    unloadAsync = async () => {
      this.pauseAsync()
      this.status.isLoaded = false
    }
  },
}
