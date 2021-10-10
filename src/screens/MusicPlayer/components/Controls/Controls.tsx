import React from 'react'
import { Icon, Pressable, View, Flex } from 'design'

import SkipBack from 'assets/skip_back.svg'
import SkipForward from 'assets/skip_forward.svg'
import Play from 'assets/play.svg'
import Pause from 'assets/pause.svg'

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
          <Icon as={SkipBack} width={48} sx={{ color: 'black' }} />
        </Pressable>

        <Pressable
          onPress={() => {
            isPlaying ? pauseSound() : playSound()
          }}
          accessibilityLabel={`${isPlaying ? 'Pause' : 'Play'} button`}
        >
          <Icon as={isPlaying ? Pause : Play} sx={{ color: 'black' }} />
        </Pressable>

        <Pressable
          onPress={() => {
            setPosition(currentPosition + SKIP_STEP)
          }}
          accessibilityLabel={`Skip forward ${SKIP_STEP / 1000} seconds`}
        >
          <Icon as={SkipForward} width={48} sx={{ color: 'black' }} />
        </Pressable>
      </View>
    </Flex>
  )
}

export default Controls
