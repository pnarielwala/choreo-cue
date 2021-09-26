import React, { forwardRef } from 'react'
import { View } from 'react-native'

const SVGMock = forwardRef((props: any, ref) => (
  <View {...props} source="svgMock" ref={ref} />
))

module.exports = SVGMock
module.exports.ReactComponent = SVGMock
