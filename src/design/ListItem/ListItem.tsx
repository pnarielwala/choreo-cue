import React from 'react'
import { View, Text, useDripsyTheme } from 'dripsy'
import { FontAwesome5 } from '@expo/vector-icons'
import Pressable from '../Pressable'

type IconName = React.ComponentProps<typeof FontAwesome5>['name']

type PropsT = {
  leftIcon?: IconName
  title: string
  subtitle?: string
  rightSlot?: React.ReactNode
  /** Convenience: render a chevron-right on the right side. Ignored if rightSlot is set. */
  showChevron?: boolean
  onPress?: () => void
  disabled?: boolean
  showDivider?: boolean
  testID?: string
  accessibilityLabel?: string
  role?: string
}

const ListItem = ({
  leftIcon,
  title,
  subtitle,
  rightSlot,
  showChevron,
  onPress,
  disabled,
  showDivider = true,
  testID,
  accessibilityLabel,
  role,
}: PropsT) => {
  const { theme } = useDripsyTheme()
  const colors = theme.colors as Record<string, string>
  const titleColor = disabled ? 'textMuted' : 'text'
  const iconColor = disabled ? (colors.textMuted ?? colors.muted) : colors.text

  const content = (
    <View
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        py: 4,
        gap: 3,
      }}
    >
      {leftIcon && (
        <View sx={{ width: 32, alignItems: 'center' }}>
          <FontAwesome5 name={leftIcon} size={22} color={iconColor} />
        </View>
      )}
      <View sx={{ flex: 1 }}>
        <Text sx={{ color: titleColor, fontSize: 16, fontWeight: '500' }}>
          {title}
        </Text>
        {subtitle && (
          <Text sx={{ color: 'textMuted', fontSize: 13, mt: 0 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightSlot ??
        (showChevron && !disabled ? (
          <FontAwesome5 name="chevron-right" size={18} color={iconColor} />
        ) : null)}
    </View>
  )

  return (
    <View>
      {onPress ? (
        <Pressable
          onPress={onPress}
          disabled={disabled}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          role={role as any}
        >
          {content}
        </Pressable>
      ) : (
        <View testID={testID}>{content}</View>
      )}
      {showDivider && (
        <View
          sx={{
            height: 1,
            backgroundColor: 'divider',
          }}
        />
      )}
    </View>
  )
}

export default ListItem
