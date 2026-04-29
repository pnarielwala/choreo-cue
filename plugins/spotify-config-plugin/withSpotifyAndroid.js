const { withAndroidManifest } = require('@expo/config-plugins')

const SPOTIFY_PACKAGE = 'com.spotify.music'

const withSpotifyAndroid = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest

    if (!Array.isArray(manifest.queries)) {
      manifest.queries = []
    }

    const hasSpotifyQuery = manifest.queries.some((q) =>
      (q.package || []).some(
        (p) => p.$ && p.$['android:name'] === SPOTIFY_PACKAGE
      )
    )

    if (!hasSpotifyQuery) {
      manifest.queries.push({
        package: [{ $: { 'android:name': SPOTIFY_PACKAGE } }],
      })
    }

    return config
  })
}

module.exports = withSpotifyAndroid
