import React, { useEffect, useState } from 'react'
import { View, Text, Flex, useSx, useTheme } from 'design'
import Slider from '@sharcoux/slider'
import format from 'format-duration'

export type PropsT = {
  duration: number
  currentPosition: number
  onPositionChange: (value: number) => void
  disabled: boolean
}

const TrackSlider = (props: PropsT) => {
  const [adjustedCurrPosition, setSliderValue] = useState(
    Math.floor(props.currentPosition / 1000) * 1000
  )
  const [isSliding, setIsSliding] = useState(false)

  const adjustedDuration = Math.floor(props.duration / 1000) * 1000

  useEffect(() => {
    if (!isSliding) {
      setSliderValue(Math.floor(props.currentPosition / 1000) * 1000)
    }
  }, [props.currentPosition])

  const sx = useSx()
  const theme = useTheme()

  const formatedCurrentTime = format(adjustedCurrPosition)
  const formattedRemaining = format(adjustedDuration - adjustedCurrPosition)

  return (
    <View
      sx={{
        width: '100%',
        mt: 3,
      }}
    >
      <Slider
        style={sx({
          width: '100%',
        })}
        thumbStyle={sx({
          width: 10,
          height: 10,
        })}
        trackStyle={sx({
          height: 2,
        })}
        minimumTrackTintColor={theme.colors.black}
        maximumTrackTintColor={theme.colors.divider}
        thumbTintColor={theme.colors.black}
        minimumValue={0}
        maximumValue={1}
        enabled={!props.disabled}
        value={
          adjustedDuration > 0 ? adjustedCurrPosition / adjustedDuration : 0
        }
        onValueChange={(value: number) =>
          setSliderValue(value * adjustedDuration)
        }
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={(value: number) => {
          const newPosition = value * props.duration
          props.onPositionChange(newPosition)
          setIsSliding(false)
        }}
      />
      <Flex
        sx={{
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <Text variant="bodySmall">{formatedCurrentTime}</Text>
        <Text variant="bodySmall">-{formattedRemaining}</Text>
      </Flex>
    </View>
  )
}

export default TrackSlider
