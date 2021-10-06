import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import { H2, Button, View, Flex } from 'design'

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
    <View>
      <H2>Cues</H2>
      <Flex sx={{ flexWrap: 'wrap', mx: -1 }}>
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

      <View sx={{ mt: 2 }}>
        <Button
          onPress={() => displayResetConfirmation()}
          title="Reset Cues"
          color="red"
        >
          Reset
        </Button>
      </View>
    </View>
  )
}

export default Cues
