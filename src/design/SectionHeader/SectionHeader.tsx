import React from 'react'
import { Text, View } from 'dripsy'

type PropsT = {
  children: React.ReactNode
  /** Optional right-aligned slot (e.g. an action button). */
  rightSlot?: React.ReactNode
  testID?: string
  /** Forwarded for accessibility linkage with the list it heads. */
  id?: string
}

const SectionHeader = ({ children, rightSlot, testID, id }: PropsT) => {
  return (
    <View
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        mt: 3,
        mb: 2,
      }}
      testID={testID}
    >
      <Text
        // @ts-ignore — Dripsy text accepts variant
        variant="h2"
        // @ts-ignore — id is valid on RN Web; ignored on native
        id={id}
        accessible
      >
        {children}
      </Text>
      {rightSlot}
    </View>
  )
}

export default SectionHeader
