import React from 'react'
import { Pressable, View, Flex } from 'design'

import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'

const SKIP_STEP = 10 * 1000 // 10 seconds

export type PropsT = {
  playSound: () => void
  pauseSound: () => void
  currentPosition: number
  setPosition: (position: number) => void
  isPlaying: boolean
}

const Controls = ({
  isPlaying,
  playSound,
  pauseSound,
  setPosition,
  currentPosition,
}: PropsT) => {
  return (
    <Flex sx={{ width: '100%', justifyContent: 'center' }}>
      <View
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          mt: [2, 4],
          justifyContent: 'space-between',
          width: '80%',
          maxWidth: 250,
        }}
      >
        <Pressable
          onPress={() => {
            setPosition(currentPosition - SKIP_STEP)
          }}
          accessibilityLabel={`Skip back ${SKIP_STEP / 1000} seconds`}
        >
          <MaterialCommunityIcons name="rewind-10" size={48} color="black" />
        </Pressable>

        <Pressable
          onPress={() => {
            isPlaying ? pauseSound() : playSound()
          }}
          accessibilityLabel={`${isPlaying ? 'Pause' : 'Play'} button`}
        >
          <FontAwesome5
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={64}
            color="black"
          />
        </Pressable>

        <Pressable
          onPress={() => {
            setPosition(currentPosition + SKIP_STEP)
          }}
          accessibilityLabel={`Skip forward ${SKIP_STEP / 1000} seconds`}
        >
          <MaterialCommunityIcons
            name="fast-forward-10"
            size={48}
            color="black"
          />
        </Pressable>
      </View>
    </Flex>
  )
}

export default Controls
