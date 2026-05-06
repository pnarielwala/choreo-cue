import React, { useEffect, useState } from 'react'
import { Dialog } from 'react-native-elements'
import { Button, ButtonGroup, Input, Text, View, useTheme } from 'design'
import type { Cue } from 'hooks/useCues'

type PropsT = {
  cue: Cue | null
  isVisible: boolean
  onClose: () => void
  onSave: (patch: {
    label: string | null
    loopDurationMs: number | null
  }) => void | Promise<void>
}

const LOOP_PRESETS: Array<{ label: string; ms: number | null }> = [
  { label: 'Off', ms: null },
  { label: '4s', ms: 4000 },
  { label: '8s', ms: 8000 },
  { label: '16s', ms: 16000 },
  { label: '32s', ms: 32000 },
]

const EditCueModal = ({ cue, isVisible, onClose, onSave }: PropsT) => {
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>
  const [label, setLabel] = useState('')
  const [loopMs, setLoopMs] = useState<number | null>(null)

  useEffect(() => {
    if (cue) {
      setLabel(cue.label ?? '')
      setLoopMs(cue.loopDurationMs ?? null)
    }
  }, [cue])

  const selectedLoopLabel =
    LOOP_PRESETS.find((p) => p.ms === loopMs)?.label ?? 'Off'

  const handleSave = async () => {
    const trimmed = label.trim()
    await onSave({
      label: trimmed.length > 0 ? trimmed : null,
      loopDurationMs: loopMs,
    })
    onClose()
  }

  return (
    <Dialog
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={{ backgroundColor: colors.surfaceElevated }}
    >
      <Dialog.Title title="Edit cue" titleStyle={{ color: colors.text }} />
      <Text sx={{ color: 'textMuted', mb: 1 }}>Label</Text>
      <Input
        placeholder="e.g. chorus 2"
        value={label}
        onChangeText={setLabel}
        maxLength={24}
      />
      <Text sx={{ color: 'textMuted', mt: 3, mb: 1 }}>Loop back after</Text>
      <ButtonGroup
        buttons={LOOP_PRESETS.map((p) => p.label)}
        selectedButton={selectedLoopLabel}
        onPress={(picked) => {
          const found = LOOP_PRESETS.find((p) => p.label === picked)
          setLoopMs(found?.ms ?? null)
        }}
      />
      <View
        sx={{
          flexDirection: 'row',
          mt: 3,
          justifyContent: 'flex-end',
          gap: 3,
        }}
      >
        <Button variant="ghost" size="sm" onPress={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onPress={handleSave}>
          Save
        </Button>
      </View>
    </Dialog>
  )
}

export default EditCueModal
