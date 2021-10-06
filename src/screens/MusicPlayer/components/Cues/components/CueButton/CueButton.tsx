import formatDuration from 'format-duration'
import React, { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'
import { Pressable, Text, Box } from 'design'

type PropsT = {
  currentPosition: number
  onPress: (position: number) => void
  triggerReset: boolean
  color: string
}

const CueButton = ({
  currentPosition,
  onPress,
  triggerReset,
  color,
}: PropsT) => {
  const [position, setPosition] = useState<number | undefined>()

  useEffect(() => {
    if (triggerReset) {
      setPosition(undefined)
    }
  }, [triggerReset])

  return (
    <Box sx={{ width: '50%', p: [1, null, 2] }}>
      <Pressable
        sx={{
          width: '100%',
          bg: color,
          height: [50, 80, 200],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
          borderWidth: Number(position !== undefined) * 3,
          borderColor: 'black',
          opacity: position !== undefined ? 1 : 0.6,
        }}
        onLongPress={() => {
          setPosition(currentPosition)
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Cue set!',
            visibilityTime: 1000,
          })
        }}
        onPress={() => position !== undefined && onPress(position)}
      >
        <Text
          sx={{
            // @ts-ignore FIXME: fix dripsy typing for variant
            variant: ['text.bodySmall', 'text.body'],
            fontWeight: position !== undefined ? 'bold' : 'normal',
          }}
        >
          {position !== undefined
            ? formatDuration(Math.floor((position ?? 0) / 1000) * 1000)
            : 'Hold to Set'}
        </Text>
      </Pressable>
    </Box>
  )
}

export default CueButton
