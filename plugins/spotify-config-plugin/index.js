const withSpotifyIos = require('./withSpotifyIos')
const withSpotifyBitcodeStrip = require('./withSpotifyBitcodeStrip')
const withSpotifyAndroid = require('./withSpotifyAndroid')

const withSpotify = (config) => {
  config = withSpotifyIos(config)
  config = withSpotifyBitcodeStrip(config)
  config = withSpotifyAndroid(config)
  return config
}

module.exports = withSpotify
