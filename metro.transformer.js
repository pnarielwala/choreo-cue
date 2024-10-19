const upstreamTransformer = require('@expo/metro-config/babel-transformer')
const svgTransformer = require('react-native-svg-transformer')

module.exports.transform = async ({ src, filename, options }) => {
  // Use react-native-svg-transformer for SVG files
  if (filename.endsWith('.svg')) {
    return svgTransformer.transform({ src, filename, options })
  }
  // Pass the source through the upstream Expo transformer for other files
  return upstreamTransformer.transform({ src, filename, options })
}
