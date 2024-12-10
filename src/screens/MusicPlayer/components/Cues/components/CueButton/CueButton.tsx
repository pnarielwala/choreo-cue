import formatDuration from 'format-duration'
import React, { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import { Pressable, Text, Box } from 'design'

type PropsT = {
  savedPosition: number | undefined
  onPress: (position: number) => void
  onDoublePress: (position: number) => void
  onSaveCue: () => Promise<void>
  color: string
}

const CueButton = ({
  savedPosition: position,
  onPress,
  onDoublePress,
  onSaveCue,
  color,
}: PropsT) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const debounceTap = (onSingleTap: () => void, onDoubleTap: () => void) => {
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
      onDoubleTap()
    } else {
      onSingleTap()
      let timer = setTimeout(() => {
        setTimer(null)
      }, 200)
      setTimer(timer)
    }
  }

  const handlePress = () => {
    debounceTap(
      () => {
        onPress(position ?? 0)
      },
      () => {
        onDoublePress(position ?? 0)
      }
    )
  }
  return (
    <Box
      sx={{ width: '50%', p: [1, null, 2], height: '100%', maxHeight: '50%' }}
    >
      <Pressable
        sx={{
          width: '100%',
          bg: color,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
          borderWidth: Number(position !== undefined) * 3,
          borderColor: 'black',
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
            fontWeight: position !== undefined ? 'bold' : 'normal',
          }}
        >
          {position !== undefined
            ? formatDuration(Math.floor((position ?? 0) / 1000) * 1000)
            : 'Hold to Set'}
        </Text>
        {position !== undefined && (
          <Text variant="bodySmall">Double tap to auto-play</Text>
        )}
      </Pressable>
    </Box>
  )
}

export default CueButton
