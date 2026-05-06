import React, { useMemo, useState } from 'react'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'
import { FontAwesome5 } from '@expo/vector-icons'

import {
  Pressable,
  View,
  Flex,
  Text,
  SectionHeader,
  Button,
  getCueColorKey,
  useTheme,
} from 'design'
import type { CueSlot as DesignCueSlot } from 'design'

import CueButton from './components/CueButton'
import EditCueModal from './components/EditCueModal'
import useCues, {
  Cue,
  useDeleteAllCues,
  useDeleteCue,
  useReorderCues,
  useSaveCue,
  useUpdateCue,
} from 'hooks/useCues'

export type PropsT = {
  currentPosition: number
  onSeekToCue: (cue: Cue) => void
  onPlayCue: (cue: Cue) => void
  audioId: number
}

const SLOT_COUNT = 4
const SLOTS: DesignCueSlot[] = [1, 2, 3, 4]

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const Cues = (props: PropsT) => {
  const { data } = useCues(props.audioId)
  const cues = useMemo<Cue[]>(() => data ?? [], [data])
  const saveCue = useSaveCue(props.audioId)
  const updateCue = useUpdateCue(props.audioId)
  const deleteCue = useDeleteCue(props.audioId)
  const deleteAll = useDeleteAllCues(props.audioId)
  const reorder = useReorderCues(props.audioId)
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>

  const [editMode, setEditMode] = useState(false)
  const [editingCue, setEditingCue] = useState<Cue | null>(null)

  const cueAtSlot = (slot: DesignCueSlot): Cue | undefined => cues[slot - 1]

  const nextFreeCueNumber = (): number => {
    const used = new Set(cues.map((c) => c.cueNumber))
    for (let n = 1; n <= SLOT_COUNT; n++) {
      if (!used.has(n)) return n
    }
    return SLOT_COUNT
  }

  const setCueAtSlot = async (slot: DesignCueSlot) => {
    const existing = cueAtSlot(slot)
    if (existing) {
      await updateCue.mutateAsync({
        id: existing.id,
        start: props.currentPosition,
      })
      return
    }
    const cueNumber = nextFreeCueNumber()
    await saveCue.mutateAsync({
      start: props.currentPosition,
      cueNumber,
      orderIndex: cues.length + 1,
    })
  }

  const handleEdit = (cue: Cue) => setEditingCue(cue)
  const closeEdit = () => setEditingCue(null)
  const handleSaveEdit = async (patch: {
    label: string | null
    loopDurationMs: number | null
  }) => {
    if (!editingCue) return
    await updateCue.mutateAsync({ id: editingCue.id, ...patch })
  }

  const handleDelete = (cue: Cue) => {
    const name = cue.label?.trim() || `Cue ${cue.slot}`
    Alert.alert('Delete cue?', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCue.mutateAsync(cue.id)
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Cue deleted',
            visibilityTime: 1000,
          })
        },
      },
    ])
  }

  const handleSortByTime = async () => {
    const sorted = [...cues].sort((a, b) => a.start - b.start).map((c) => c.id)
    await reorder.mutateAsync(sorted)
  }

  const handleResetAll = () =>
    Alert.alert('Are you sure?', 'This will clear all your cues', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await deleteAll.mutateAsync()
          setEditMode(false)
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Cues cleared!',
            visibilityTime: 1000,
          })
        },
      },
    ])

  return (
    <View sx={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
      <SectionHeader
        rightSlot={
          <View sx={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
            {editMode && cues.length > 1 && (
              <Pressable
                onPress={handleSortByTime}
                hitSlop={12}
                accessibilityLabel="Sort cues by time"
              >
                <FontAwesome5
                  name="sort-amount-down"
                  size={16}
                  color={colors.text}
                />
              </Pressable>
            )}
            <Pressable
              onPress={() => setEditMode((v) => !v)}
              hitSlop={12}
              accessibilityLabel={editMode ? 'Done editing cues' : 'Edit cues'}
            >
              <FontAwesome5
                name={editMode ? 'check' : 'pencil-alt'}
                size={16}
                color={colors.text}
              />
            </Pressable>
          </View>
        }
      >
        Cues
      </SectionHeader>

      {editMode ? (
        <>
          <EditModeList
            cues={cues}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={async (orderedIds) => {
              await reorder.mutateAsync(orderedIds)
            }}
          />
          {cues.length > 0 && (
            <Flex sx={{ width: '100%', justifyContent: 'center', mt: 1 }}>
              <Pressable onPress={handleResetAll} hitSlop={12}>
                <Text sx={{ color: 'danger', fontWeight: '600' }}>
                  Reset all cues
                </Text>
              </Pressable>
            </Flex>
          )}
        </>
      ) : (
        <Flex
          sx={{ flexWrap: 'wrap', mx: [-1, null, -2], flex: 3 }}
          testID="cue-grid"
        >
          {SLOTS.map((slot) => {
            const cue = cueAtSlot(slot)
            return (
              <CueButton
                key={slot}
                slot={slot}
                cueNumber={(cue?.cueNumber ?? slot) as DesignCueSlot}
                savedPosition={cue?.start}
                label={cue?.label ?? null}
                loopDurationMs={cue?.loopDurationMs ?? null}
                editMode={false}
                onPress={() => cue && props.onSeekToCue(cue)}
                onDoublePress={() => cue && props.onPlayCue(cue)}
                onSaveCue={() => setCueAtSlot(slot)}
              />
            )
          })}
        </Flex>
      )}

      {/* Bottom spacer keeps the grid / list off the safe-area edge. */}
      <Flex sx={{ flex: 2, width: '100%' }} />

      <EditCueModal
        cue={editingCue}
        isVisible={editingCue !== null}
        onClose={closeEdit}
        onSave={handleSaveEdit}
      />
    </View>
  )
}

type EditModeListProps = {
  cues: Cue[]
  onEdit: (cue: Cue) => void
  onDelete: (cue: Cue) => void
  onReorder: (orderedIds: number[]) => Promise<void>
}

const EditModeList = ({
  cues,
  onEdit,
  onDelete,
  onReorder,
}: EditModeListProps) => {
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>

  if (cues.length === 0) {
    return (
      <View sx={{ p: 3, alignItems: 'center' }}>
        <Text sx={{ color: 'textMuted' }}>
          No cues yet. Exit edit mode and long-press a slot to set one.
        </Text>
      </View>
    )
  }

  const swap = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= cues.length) return
    const next = cues.slice()
    const tmp = next[idx]
    next[idx] = next[target]
    next[target] = tmp
    onReorder(next.map((c) => c.id))
  }

  return (
    <View sx={{ width: '100%' }}>
      {cues.map((item, idx) => {
        const colorKey = getCueColorKey(item.cueNumber as DesignCueSlot)
        const displayLabel =
          item.label && item.label.trim().length > 0
            ? item.label
            : `Cue ${item.slot}`
        const canMoveUp = idx > 0
        const canMoveDown = idx < cues.length - 1
        return (
          <View
            key={item.id}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colorKey,
              borderRadius: 'md',
              px: 3,
              py: 2,
              mb: 2,
              gap: 3,
            }}
          >
            <View sx={{ flexDirection: 'column', alignItems: 'center' }}>
              <Pressable
                onPress={() => swap(idx, -1)}
                disabled={!canMoveUp}
                hitSlop={10}
                accessibilityLabel={`Move ${displayLabel} up`}
                sx={{ opacity: canMoveUp ? 1 : 0.3, py: 1 }}
              >
                <FontAwesome5
                  name="chevron-up"
                  size={14}
                  color={colors.cueBorder}
                />
              </Pressable>
              <Pressable
                onPress={() => swap(idx, 1)}
                disabled={!canMoveDown}
                hitSlop={10}
                accessibilityLabel={`Move ${displayLabel} down`}
                sx={{ opacity: canMoveDown ? 1 : 0.3, py: 1 }}
              >
                <FontAwesome5
                  name="chevron-down"
                  size={14}
                  color={colors.cueBorder}
                />
              </Pressable>
            </View>
            <View sx={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                sx={{ color: 'cueBorder', fontWeight: '700' }}
              >
                {displayLabel}
              </Text>
              <View
                sx={{
                  flexDirection: 'row',
                  gap: 2,
                  alignItems: 'center',
                  mt: 1,
                }}
              >
                <Text sx={{ color: 'cueBorder', opacity: 0.85 }}>
                  {formatTime(item.start)}
                </Text>
                {item.loopDurationMs != null && (
                  <View
                    sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}
                  >
                    <FontAwesome5
                      name="redo"
                      size={10}
                      color={colors.cueBorder}
                    />
                    <Text
                      sx={{ color: 'cueBorder', opacity: 0.85, fontSize: 12 }}
                    >
                      {Math.round(item.loopDurationMs / 1000)}s
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Pressable
              onPress={() => onEdit(item)}
              hitSlop={12}
              accessibilityLabel={`Edit ${displayLabel}`}
            >
              <FontAwesome5
                name="pencil-alt"
                size={16}
                color={colors.cueBorder}
              />
            </Pressable>
            <Pressable
              onPress={() => onDelete(item)}
              hitSlop={12}
              accessibilityLabel={`Delete ${displayLabel}`}
            >
              <FontAwesome5 name="trash" size={16} color={colors.cueBorder} />
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}

export default Cues
