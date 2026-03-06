const { getDefaultConfig } = require('@expo/metro-config')
const path = require('path')

module.exports = (() => {
  const config = getDefaultConfig(__dirname)

  const { transformer, resolver } = config

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],

    extraNodeModules: {
      'react-native': path.resolve(__dirname, 'metro-shims/react-native.js'),
    },
  }

  return config
})()
