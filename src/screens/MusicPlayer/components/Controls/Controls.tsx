import React from 'react'
import { Pressable, View, Flex, useTheme } from 'design'

import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import type { RepeatMode } from 'types/Music'

const SKIP_STEP = 10 * 1000 // 10 seconds

export type PropsT = {
  playSound: () => void
  pauseSound: () => void
  currentPosition: number
  setPosition: (position: number) => void
  isPlaying: boolean
  repeatMode: RepeatMode
  onCycleRepeatMode: () => void
}

const repeatIconFor = (mode: RepeatMode) => {
  if (mode === 'song') return 'repeat'
  if (mode === 'cue') return 'repeat-once'
  return 'repeat-off'
}

const repeatLabelFor = (mode: RepeatMode) => {
  if (mode === 'song') return 'Repeat: song'
  if (mode === 'cue') return 'Repeat: back to cue'
  return 'Repeat: off'
}

const Controls = ({
  isPlaying,
  playSound,
  pauseSound,
  setPosition,
  currentPosition,
  repeatMode,
  onCycleRepeatMode,
}: PropsT) => {
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>
  const iconColor = colors.text
  const repeatColor = repeatMode === 'off' ? colors.textMuted : colors.accent

  return (
    <Flex sx={{ width: '100%', justifyContent: 'center' }}>
      <View
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          mt: [2, 4],
          justifyContent: 'space-between',
          width: '90%',
          maxWidth: 320,
        }}
      >
        <Pressable
          onPress={() => setPosition(0)}
          accessibilityLabel="Jump to beginning"
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="skip-previous"
            size={40}
            color={iconColor}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            setPosition(currentPosition - SKIP_STEP)
          }}
          accessibilityLabel={`Skip back ${SKIP_STEP / 1000} seconds`}
        >
          <MaterialCommunityIcons
            name="rewind-10"
            size={48}
            color={iconColor}
          />
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
            color={iconColor}
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
            color={iconColor}
          />
        </Pressable>

        <Pressable
          onPress={onCycleRepeatMode}
          accessibilityLabel={repeatLabelFor(repeatMode)}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name={repeatIconFor(repeatMode)}
            size={36}
            color={repeatColor}
          />
        </Pressable>
      </View>
    </Flex>
  )
}

export default Controls
