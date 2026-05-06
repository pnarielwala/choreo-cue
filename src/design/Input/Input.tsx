import React, { ComponentProps, useState } from 'react'

import { TextInput as DripsyTextInput, useDripsyTheme } from 'dripsy'

type PropsT = ComponentProps<typeof DripsyTextInput>

const TextInput = (props: PropsT) => {
  const [focused, setFocused] = useState(false)
  const { theme } = useDripsyTheme()
  const themeColors = theme.colors as Record<string, string> | undefined
  const defaultPlaceholderColor = themeColors?.textMuted

  return (
    <DripsyTextInput
      placeholderTextColor={
        props.placeholderTextColor ?? defaultPlaceholderColor
      }
      {...props}
      onFocus={(event) => {
        props.onFocus?.(event)
        setFocused(true)
      }}
      onBlur={(event) => {
        props.onBlur?.(event)
        setFocused(false)
      }}
      sx={{
        backgroundColor: 'surfaceMuted',
        borderRadius: 8,
        borderWidth: 1,
        padding: 2,
        fontSize: 16,
        color: 'text',
        ...props.sx,
        borderColor: focused
          ? 'accent'
          : (props.sx?.['borderColor'] ?? 'textMuted'),
      }}
    />
  )
}

export default TextInput
