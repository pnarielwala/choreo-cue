import React, { useState } from 'react'
import { View, H2, Text, ButtonGroup } from 'design'

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
  disabled?: boolean
}

export default function Tempo({ setRate, disabled }: PropsT) {
  const [tempoIndex, setTempoIndex] = useState(2)

  return (
    <View sx={{ width: '100%', justifyContent: 'flex-start' }}>
      <H2
        as={Text}
        sx={{
          alignSelf: 'flex-start',
          color: disabled ? 'muted' : 'black',
        }}
      >
        Tempo
      </H2>
      <ButtonGroup
        onPress={(buttonText) => {
          const index = Object.values(TEMPOS).findIndex(
            (tempo) => tempo.display === buttonText
          )
          setTempoIndex(index)
          setRate(TEMPOS[index].rate)
        }}
        selectedButton={TEMPOS[tempoIndex].display}
        buttons={Object.values(TEMPOS).map((tempo) => tempo.display)}
        disabled={disabled}
      />
    </View>
  )
}
