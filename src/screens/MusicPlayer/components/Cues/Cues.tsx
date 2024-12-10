import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import { H2, Pressable, View, Flex, Text } from 'design'

import CueButton from './components/CueButton'
import { deleteAllCues, getAllCues, saveCue } from 'api/db/cues'
import { useQuery } from '@tanstack/react-query'

export type PropsT = {
  currentPosition: number
  onPlayAudio: () => Promise<void>
  onSeekToPosition: (position: number) => void
  audioId: number
}

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
      {
        text: 'Cancel',
        style: 'cancel',
      },
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
      <H2 as={Text} sx={{ height: 'auto' }}>
        Cues
      </H2>
      <Flex
        sx={{ flexWrap: 'wrap', mx: [-1, null, -2], flex: 2 }}
        testID="cue-grid"
      >
        <CueButton
          savedPosition={cues[1]}
          onPress={props.onSeekToPosition}
          onDoublePress={props.onPlayAudio}
          onSaveCue={() => setCue(1)}
          color="red"
        />
        <CueButton
          savedPosition={cues[2]}
          onPress={props.onSeekToPosition}
          onDoublePress={props.onPlayAudio}
          onSaveCue={() => setCue(2)}
          color="blue"
        />
        <CueButton
          savedPosition={cues[3]}
          onPress={props.onSeekToPosition}
          onDoublePress={props.onPlayAudio}
          onSaveCue={() => setCue(3)}
          color="green"
        />
        <CueButton
          savedPosition={cues[4]}
          onPress={props.onSeekToPosition}
          onDoublePress={props.onPlayAudio}
          onSaveCue={() => setCue(4)}
          color="yellow"
        />
      </Flex>

      <Flex sx={{ mt: 2, flex: 1, width: '100%', justifyContent: 'center' }}>
        <Pressable onPress={displayResetConfirmation}>
          <Text
            sx={{
              color: 'red',
            }}
          >
            Reset Cues
          </Text>
        </Pressable>
      </Flex>
    </View>
  )
}

export default Cues
