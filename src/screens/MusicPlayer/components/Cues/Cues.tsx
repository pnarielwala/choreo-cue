import React from 'react'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import { Pressable, View, Flex, Text, SectionHeader } from 'design'

import CueButton from './components/CueButton'
import { deleteAllCues, getAllCues, saveCue } from 'api/db/cues'
import { useQuery } from '@tanstack/react-query'

export type PropsT = {
  currentPosition: number
  onPlayAudio: () => void
  onSeekToPosition: (position: number) => void
  audioId: number
}

const SLOTS = [1, 2, 3, 4] as const

const Cues = (props: PropsT) => {
  const { data, refetch } = useQuery({
    queryKey: ['cues', props.audioId],
    queryFn: () => getAllCues(props.audioId),
    select: (data) =>
      data.reduce(
        (acc, cue) => ({ ...acc, [cue.cueNumber]: cue.start }),
        {} as Record<number, number>
      ),
  })

  const cues = data || {}

  const setCue = async (cue: number) => {
    await saveCue({
      audioId: props.audioId,
      start: props.currentPosition,
      cueNumber: cue,
    })
    await refetch()
  }

  const resetAllCues = async () => {
    await deleteAllCues(props.audioId)
    await refetch()
  }

  const displayResetConfirmation = () =>
    Alert.alert('Are you sure?', 'This will clear all your cues', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await resetAllCues()
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
    <View sx={{ flex: 1, justifyContent: 'flex-start' }}>
      <SectionHeader>Cues</SectionHeader>
      <Flex
        sx={{ flexWrap: 'wrap', mx: [-1, null, -2], flex: 2 }}
        testID="cue-grid"
      >
        {SLOTS.map((slot) => (
          <CueButton
            key={slot}
            slot={slot}
            savedPosition={cues[slot]}
            onPress={props.onSeekToPosition}
            onDoublePress={props.onPlayAudio}
            onSaveCue={() => setCue(slot)}
          />
        ))}
      </Flex>

      <Flex sx={{ mt: 2, flex: 1, width: '100%', justifyContent: 'center' }}>
        <Pressable onPress={displayResetConfirmation}>
          <Text sx={{ color: 'danger', fontWeight: '600' }}>Reset Cues</Text>
        </Pressable>
      </Flex>
    </View>
  )
}

export default Cues
