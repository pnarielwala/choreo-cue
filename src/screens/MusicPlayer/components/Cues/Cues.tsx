import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import { H2, Pressable, View, Flex, Text } from 'design'

import CueButton from './components/CueButton'

export type PropsT = {
  currentPosition: number
  onPlayFromPosition: (position: number) => void
}

const Cues = (props: PropsT) => {
  const [triggerReset, setTriggerReset] = useState(false)

  useEffect(() => {
    if (triggerReset) {
      setTriggerReset(false)
    }
  }, [triggerReset, setTriggerReset])

  const displayResetConfirmation = () =>
    Alert.alert('Are you sure?', 'This will clear all your cues', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setTriggerReset(true)

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
      <Flex sx={{ flexWrap: 'wrap', mx: [-1, null, -2], flex: 2 }}>
        <CueButton
          currentPosition={props.currentPosition}
          onPress={props.onPlayFromPosition}
          triggerReset={triggerReset}
          color="red"
        />
        <CueButton
          currentPosition={props.currentPosition}
          onPress={props.onPlayFromPosition}
          triggerReset={triggerReset}
          color="blue"
        />
        <CueButton
          currentPosition={props.currentPosition}
          onPress={props.onPlayFromPosition}
          triggerReset={triggerReset}
          color="green"
        />
        <CueButton
          currentPosition={props.currentPosition}
          onPress={props.onPlayFromPosition}
          triggerReset={triggerReset}
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
