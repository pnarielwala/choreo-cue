import React from 'react'
import { View, Pressable, Text } from 'dripsy'

interface ButtonGroupProps {
  buttons: string[]
  onPress: (button: string) => void
  selectedButton: string
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  onPress,
  selectedButton,
}) => {
  return (
    <View
      sx={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        width: '100%',
        borderRadius: 8,
        borderColor: 'border',
        borderWidth: 1,
      }}
    >
      {buttons.map((button, index) => (
        <Pressable
          key={button}
          onPress={() => onPress(button)}
          sx={{
            padding: 10,
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            ...(index === 0 && {
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
            }),
            ...(index === buttons.length - 1 && {
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
            }),
            backgroundColor:
              selectedButton === button ? 'surfaceInverse' : 'transparent',
          }}
        >
          <Text
            sx={{
              color: selectedButton === button ? 'textInverse' : 'text',
            }}
          >
            {button}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

export default ButtonGroup
