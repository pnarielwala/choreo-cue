const withSpotifyIos = require('./withSpotifyIos')
const withSpotifyAndroid = require('./withSpotifyAndroid')

const withSpotify = (config) => {
  config = withSpotifyIos(config)
  config = withSpotifyAndroid(config)
  return config
}

module.exports = withSpotify
