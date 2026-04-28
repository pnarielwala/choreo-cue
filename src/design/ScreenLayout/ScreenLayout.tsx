import React from 'react'
import { View, ScrollView } from 'dripsy'

type PropsT = {
  children: React.ReactNode
  /** Horizontal content padding (theme space index). Default 4 (=20px). */
  padding?: number
  /** Currently a no-op alias for the inner content view; kept for API forward-compat with safe-area handling. */
  safeArea?: boolean
  /** Wrap content in a vertical ScrollView. */
  scroll?: boolean
  testID?: string
}

const ScreenLayout = ({ children, padding = 4, scroll, testID }: PropsT) => {
  return (
    <View
      sx={{
        flex: 1,
        backgroundColor: 'background',
      }}
      testID={testID}
    >
      {scroll ? (
        <ScrollView
          contentContainerSx={{ flexGrow: 1, mx: padding, pb: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View sx={{ flex: 1, mx: padding }}>{children}</View>
      )}
    </View>
  )
}

export default ScreenLayout
