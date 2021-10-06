import React, { useState } from 'react'
import { ButtonGroup } from 'react-native-elements'
import { View, H2, useSx } from 'design'

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

  const sx = useSx()

  return (
    <View sx={{ width: '100%', justifyContent: 'flex-start' }}>
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
        containerStyle={sx({
          width: '100%',
          maxWidth: 500,
          mx: 'auto',
          height: [32, 40],
          borderColor: 'divider',
        })}
        buttonStyle={sx({ bg: 'background' })}
        innerBorderStyle={sx({ color: 'divider' })}
        selectedButtonStyle={sx({ bg: 'black' })}
        textStyle={sx({
          // @ts-ignore FIXME: variants can be an array
          variant: ['text.bodySmall', 'text.body'],
          fontFamily: 'nunito',
          fontWeight: 500,
        })}
      />
    </View>
  )
}
