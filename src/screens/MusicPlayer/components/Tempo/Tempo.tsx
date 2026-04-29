import React, { useState } from 'react'
import { View, H2, Text, useTheme } from 'design'
import Slider from '@react-native-community/slider'
import { Pressable, useSx } from 'dripsy'
import { FontAwesome5 } from '@expo/vector-icons'

export type PropsT = {
  setRate: (tempo: number) => void
  disabled?: boolean
}

export default function Tempo({ setRate, disabled = false }: PropsT) {
  const [tempo, setTempo] = useState(1)

  const theme = useTheme()
  const sx = useSx()

  const handleSetTempo = (value: number) => {
    if (disabled) return
    setTempo(value)
    setRate(value)
  }

  return (
    <View sx={{ width: '100%', justifyContent: 'flex-start' }}>
      <H2
        as={Text}
        sx={{
          alignSelf: 'flex-start',
          color: disabled ? 'textMuted' : 'text',
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
          opacity: disabled ? 0.5 : 1,
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
          disabled={disabled}
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
          sx={{ alignSelf: 'center' }}
          onPress={() => {
            handleSetTempo(1)
          }}
          disabled={disabled || tempo === 1}
          aria-label="Reset tempo"
          role="button"
        >
          <FontAwesome5
            name="sync-alt"
            size={24}
            style={sx({
              color: disabled || tempo === 1 ? 'textMuted' : 'text',
            })}
          />
        </Pressable>
      </View>
      {disabled && (
        <Text variant="bodySmall" sx={{ color: 'textMuted', mt: 1 }}>
          Tempo isn't available for Spotify tracks.
        </Text>
      )}
    </View>
  )
}
