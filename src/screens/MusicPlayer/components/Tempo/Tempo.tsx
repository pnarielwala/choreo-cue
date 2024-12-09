import React, { useState } from 'react'
import { View, H2, Text, useTheme } from 'design'
import Slider from '@react-native-community/slider'
import { Pressable, useSx } from 'dripsy'
import { FontAwesome5 } from '@expo/vector-icons'

export type PropsT = {
  setRate: (tempo: number) => void
}

export default function Tempo({ setRate }: PropsT) {
  const [tempo, setTempo] = useState(1)

  const theme = useTheme()
  const sx = useSx()

  const handleSetTempo = (value: number) => {
    setTempo(value)
    setRate(value)
  }

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
            handleSetTempo(rate)
          }}
          style={{
            flex: 1,
            alignSelf: 'center',
          }}
        />
        <Text sx={{ alignSelf: 'center', minWidth: 45, textAlign: 'right' }}>
          {tempo}x
        </Text>
        <Pressable
          hitSlop={30}
          sx={{
            alignSelf: 'center',
            color: tempo === 1 ? 'text' : 'textMuted',
          }}
          onPress={() => {
            handleSetTempo(1)
          }}
          disabled={tempo === 1}
          aria-label="Reset tempo"
          role="button"
        >
          <FontAwesome5
            name="sync-alt"
            size={24}
            style={sx({
              color: tempo === 1 ? 'muted' : 'text',
            })}
          />
        </Pressable>
      </View>
    </View>
  )
}
