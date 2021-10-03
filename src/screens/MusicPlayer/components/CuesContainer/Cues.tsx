import React, { useState } from 'react'
import { Button, View, Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import { H2 } from 'design'

import CueButton from './CueButton'

type PropsT = {
  currentPosition: number
  onPlayFromPosition: (position: number) => void
}

const Cues = (props: PropsT) => {
  const [triggerReset, setTriggerReset] = useState(false)

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
          setTriggerReset(false)

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
    <View
      style={
        {
          // height: '100%',
        }
      }
    >
      <View
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'baseline',
        }}
      >
        <H2>Cues</H2>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -4,
        }}
      >
        <CueButton
          currentPosition={props.currentPosition}
          onPress={props.onPlayFromPosition}
          triggerReset={triggerReset}
          inactiveColor="#f3558880"
          activeColor="#f35588"
        />
        <CueButton
          currentPosition={props.currentPosition}
          onPress={props.onPlayFromPosition}
          triggerReset={triggerReset}
          inactiveColor="#05dfd780"
          activeColor="#05dfd7"
        />
        <CueButton
          currentPosition={props.currentPosition}
          onPress={props.onPlayFromPosition}
          triggerReset={triggerReset}
          inactiveColor="#a3f7bf80"
          activeColor="#a3f7bf"
        />
        <CueButton
          currentPosition={props.currentPosition}
          onPress={props.onPlayFromPosition}
          triggerReset={triggerReset}
          inactiveColor="#fff59180"
          activeColor="#fff591"
        />
      </View>

      <View style={{ marginTop: 12 }}>
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
