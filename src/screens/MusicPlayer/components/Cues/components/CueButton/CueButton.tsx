import formatDuration from 'format-duration'
import React, { useState } from 'react'
import Toast from 'react-native-toast-message'
import { Pressable, Text, Box, getCueColorKey } from 'design'
import type { CueSlot } from 'design'

type PropsT = {
  slot: CueSlot
  savedPosition: number | undefined
  onPress: (position: number) => void
  onDoublePress: (position: number) => void
  onSaveCue: () => Promise<void>
}

const CueButton = ({
  slot,
  savedPosition: position,
  onPress,
  onDoublePress,
  onSaveCue,
}: PropsT) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const colorKey = getCueColorKey(slot)

  const debounceTap = (onSingleTap: () => void, onDoubleTap: () => void) => {
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
      onDoubleTap()
    } else {
      onSingleTap()
      const newTimer = setTimeout(() => {
        setTimer(null)
      }, 200)
      setTimer(newTimer)
    }
  }

  const handlePress = () => {
    debounceTap(
      () => onPress(position ?? 0),
      () => onDoublePress(position ?? 0)
    )
  }

  return (
    <Box
      sx={{ width: '50%', p: [1, null, 2], height: '100%', maxHeight: '50%' }}
    >
      <Pressable
        sx={{
          width: '100%',
          bg: colorKey,
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 'md',
          borderWidth: Number(position !== undefined) * 3,
          borderColor: 'cueBorder',
          opacity: position !== undefined ? 1 : 0.6,
        }}
        onLongPress={async () => {
          await onSaveCue()
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Cue set!',
            visibilityTime: 1000,
          })
        }}
        onPress={handlePress}
      >
        <Text
          variants={['bodySmall', 'body']}
          sx={{
            fontWeight: position !== undefined ? '700' : '400',
            color: 'cueBorder',
          }}
        >
          {position !== undefined
            ? formatDuration(Math.floor((position ?? 0) / 1000) * 1000)
            : 'Hold to Set'}
        </Text>
        {position !== undefined && (
          <Text variant="bodySmall" sx={{ color: 'cueBorder' }}>
            Double tap to auto-play
          </Text>
        )}
      </Pressable>
    </Box>
  )
}

export default CueButton
