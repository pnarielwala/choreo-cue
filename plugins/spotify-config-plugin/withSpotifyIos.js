const { withInfoPlist } = require('@expo/config-plugins')

const withSpotifyIos = (config) => {
  return withInfoPlist(config, (config) => {
    const existing = config.modResults.LSApplicationQueriesSchemes || []
    if (!existing.includes('spotify')) {
      config.modResults.LSApplicationQueriesSchemes = [...existing, 'spotify']
    }
    return config
  })
}

module.exports = withSpotifyIos
