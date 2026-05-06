import formatDuration from 'format-duration'
import React, { useState } from 'react'
import Toast from 'react-native-toast-message'
import { FontAwesome5 } from '@expo/vector-icons'
import { Pressable, Text, Box, View, getCueColorKey, useTheme } from 'design'
import type { CueSlot } from 'design'

type PropsT = {
  slot: CueSlot
  /** Stable color identity of this cue (1-4). Falls back to `slot` when empty so
   * unset positions still show a rotating palette. */
  cueNumber?: CueSlot
  savedPosition: number | undefined
  label: string | null
  loopDurationMs: number | null
  editMode: boolean
  onPress: () => void
  onDoublePress: () => void
  onSaveCue: () => Promise<void>
  onEdit?: () => void
  onDelete?: () => void
  onDragStart?: () => void
}

const formatLoop = (ms: number) => {
  const s = Math.round(ms / 1000)
  return `${s}s`
}

const CueButton = ({
  slot,
  cueNumber,
  savedPosition: position,
  label,
  loopDurationMs,
  editMode,
  onPress,
  onDoublePress,
  onSaveCue,
  onEdit,
  onDelete,
  onDragStart,
}: PropsT) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const colorKey = getCueColorKey(cueNumber ?? slot)
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>
  const isSet = position !== undefined

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
    if (editMode) {
      if (isSet) onEdit?.()
      return
    }
    if (!isSet) return
    debounceTap(onPress, onDoublePress)
  }

  const handleLongPress = async () => {
    if (editMode) return
    await onSaveCue()
    Toast.show({
      type: 'success',
      position: 'top',
      text1: isSet ? 'Cue updated!' : 'Cue set!',
      visibilityTime: 1000,
    })
  }

  const displayLabel = label && label.trim().length > 0 ? label : `Cue ${slot}`

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
          borderWidth: Number(isSet) * 3,
          borderColor: 'cueBorder',
          opacity: isSet ? 1 : 0.6,
          paddingHorizontal: 8,
        }}
        onLongPress={handleLongPress}
        onPress={handlePress}
      >
        {isSet ? (
          <>
            <View
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                maxWidth: '100%',
              }}
            >
              <Text
                variants={['bodySmall', 'body']}
                numberOfLines={1}
                sx={{
                  fontWeight: '700',
                  color: 'cueBorder',
                  flexShrink: 1,
                  textAlign: 'center',
                }}
              >
                {displayLabel}
              </Text>
              {loopDurationMs != null && (
                <View
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <FontAwesome5
                    name="redo"
                    size={10}
                    color={colors.cueBorder}
                  />
                  <Text
                    variant="bodySmall"
                    sx={{ color: 'cueBorder', fontWeight: '600' }}
                  >
                    {formatLoop(loopDurationMs)}
                  </Text>
                </View>
              )}
            </View>
            <Text
              variant="bodySmall"
              sx={{ color: 'cueBorder', opacity: 0.85 }}
            >
              {formatDuration(Math.floor((position ?? 0) / 1000) * 1000)}
            </Text>
            {editMode && (
              <View
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  mt: 1,
                }}
              >
                <Pressable
                  hitSlop={12}
                  onPress={onEdit}
                  accessibilityLabel={`Edit ${displayLabel}`}
                >
                  <FontAwesome5
                    name="pencil-alt"
                    size={14}
                    color={colors.cueBorder}
                  />
                </Pressable>
                <Pressable
                  hitSlop={12}
                  onLongPress={onDragStart}
                  delayLongPress={120}
                  accessibilityLabel={`Reorder ${displayLabel}`}
                >
                  <FontAwesome5
                    name="grip-lines"
                    size={14}
                    color={colors.cueBorder}
                  />
                </Pressable>
                <Pressable
                  hitSlop={12}
                  onPress={onDelete}
                  accessibilityLabel={`Delete ${displayLabel}`}
                >
                  <FontAwesome5
                    name="trash"
                    size={14}
                    color={colors.cueBorder}
                  />
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <Text
            variants={['bodySmall', 'body']}
            sx={{ fontWeight: '400', color: 'cueBorder' }}
          >
            Hold to Set
          </Text>
        )}
      </Pressable>
    </Box>
  )
}

export default CueButton
