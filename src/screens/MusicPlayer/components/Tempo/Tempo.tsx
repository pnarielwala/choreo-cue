import React, { useState } from 'react'
import { View, Dimensions } from 'react-native'
import { ButtonGroup } from 'react-native-elements'
import { H2 } from 'design'

const TEMPOS: { [key: number]: { rate: number; display: string } } = {
  0: {
    rate: 0.5,
    display: '0.5x',
  },
  1: {
    rate: 0.75,
    display: '0.75x',
  },
  2: {
    rate: 1,
    display: '1x',
  },
  3: {
    rate: 1.25,
    display: '1.25x',
  },
}

export type PropsT = {
  setRate: (tempo: number) => void
}

export default function Tempo({ setRate }: PropsT) {
  const [tempoIndex, setTempoIndex] = useState(2)

  return (
    <View style={{ width: '100%', justifyContent: 'flex-start' }}>
      <H2
        sx={{
          alignSelf: 'flex-start',
        }}
      >
        Tempo
      </H2>
      <ButtonGroup
        onPress={(index) => {
          setTempoIndex(index)
          setRate(TEMPOS[index].rate)
        }}
        selectedIndex={tempoIndex}
        buttons={Object.values(TEMPOS).map((tempo) => tempo.display)}
        containerStyle={{
          width: '100%',
          maxWidth: 500,
          marginLeft: 0,
          height: Math.min(Dimensions.get('screen').height * 0.05, 40),
        }}
        selectedButtonStyle={{ backgroundColor: '#ccc' }}
      />
    </View>
  )
}
