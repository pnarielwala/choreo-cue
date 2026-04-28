import React from 'react'
import { View } from 'dripsy'

export type CardVariant = 'default' | 'elevated' | 'outlined'

type PropsT = {
  children: React.ReactNode
  variant?: CardVariant
  padding?: number
  testID?: string
}

const variantStyles: Record<CardVariant, Record<string, unknown>> = {
  default: {
    backgroundColor: 'surfaceMuted',
  },
  elevated: {
    backgroundColor: 'surfaceElevated',
    shadowColor: 'text',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  outlined: {
    backgroundColor: 'surface',
    borderWidth: 1,
    borderColor: 'border',
  },
}

const Card = ({
  children,
  variant = 'default',
  padding = 4,
  testID,
}: PropsT) => {
  return (
    <View
      sx={{
        ...variantStyles[variant],
        borderRadius: 'lg',
        padding,
      }}
      testID={testID}
    >
      {children}
    </View>
  )
}

export default Card
