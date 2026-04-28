import React, { ComponentProps, useState } from 'react'

import { TextInput as DripsyTextInput } from 'dripsy'

type PropsT = ComponentProps<typeof DripsyTextInput>

const TextInput = (props: PropsT) => {
  const [focused, setFocused] = useState(false)
  return (
    <DripsyTextInput
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
        ...props.sx,
        borderWidth: 1,
        padding: 2,
        fontSize: 16,
        color: 'text',
        borderColor: focused
          ? 'accent'
          : (props.sx?.['borderColor'] ?? 'border'),
      }}
    />
  )
}

export default TextInput
