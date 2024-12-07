import React, { useState } from 'react'
import { View, H2, Text, useTheme } from 'design'
import Slider from '@react-native-community/slider'

export type PropsT = {
  setRate: (tempo: number) => void
}

export default function Tempo({ setRate }: PropsT) {
  const [tempo, setTempo] = useState(1)

  const theme = useTheme()

  return (
    <View sx={{ width: '100%', justifyContent: 'flex-start' }}>
      <H2
        as={Text}
        sx={{
          alignSelf: 'flex-start',
        }}
      >
        Tempo
      </H2>
      <View
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          gap: 2,
        }}
      >
        <Slider
          testID="tempo-slider"
          minimumTrackTintColor={theme.colors.sliderTrack}
          maximumTrackTintColor={theme.colors.sliderTrackBackground}
          thumbTintColor={theme.colors.sliderThumb}
          minimumValue={0.5}
          maximumValue={1.5}
          step={0.05}
          value={tempo}
          onValueChange={(value: number) => {
            const rate = +value.toPrecision(3)
            setTempo(+value.toPrecision(3))
            setRate(rate)
          }}
          style={{
            flex: 1,
            alignSelf: 'center',
          }}
        />
        <Text sx={{ alignSelf: 'center', minWidth: 50, textAlign: 'right' }}>
          {tempo}x
        </Text>
      </View>
    </View>
  )
}
