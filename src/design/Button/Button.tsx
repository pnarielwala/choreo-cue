import React from 'react'
import { Text, useDripsyTheme } from 'dripsy'
import { FontAwesome5 } from '@expo/vector-icons'
import Pressable from '../Pressable'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

type IconName = React.ComponentProps<typeof FontAwesome5>['name']

type PropsT = {
  children: React.ReactNode
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: IconName
  trailingIcon?: IconName
  disabled?: boolean
  fullWidth?: boolean
  testID?: string
  accessibilityLabel?: string
  role?: string
}

const sizeStyles: Record<
  ButtonSize,
  { py: number; px: number; fontSize: number; iconSize: number; gap: number }
> = {
  sm: { py: 2, px: 3, fontSize: 14, iconSize: 16, gap: 4 },
  md: { py: 3, px: 4, fontSize: 16, iconSize: 18, gap: 6 },
  lg: { py: 4, px: 4, fontSize: 20, iconSize: 22, gap: 8 },
}

const variantStyles: Record<
  ButtonVariant,
  {
    bg: string
    color: string
    borderColor?: string
    borderWidth?: number
    elevated?: boolean
  }
> = {
  primary: { bg: 'accent', color: 'accentText', elevated: true },
  secondary: {
    bg: 'surfaceMuted',
    color: 'text',
    borderColor: 'border',
    borderWidth: 1,
  },
  ghost: { bg: 'transparent', color: 'text' },
  destructive: { bg: 'danger', color: 'dangerText', elevated: true },
}

const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  disabled,
  fullWidth,
  testID,
  accessibilityLabel,
  role,
}: PropsT) => {
  const { theme } = useDripsyTheme()
  const sz = sizeStyles[size]
  const v = variantStyles[variant]
  const iconColor =
    (theme.colors as Record<string, string> | undefined)?.[v.color] ?? '#000'

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      role={(role ?? 'button') as any}
      sx={{
        py: sz.py,
        px: sz.px,
        backgroundColor: v.bg,
        borderRadius: 'lg',
        borderColor: v.borderColor,
        borderWidth: v.borderWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        alignSelf: fullWidth ? 'stretch' : 'auto',
        ...(v.elevated && !disabled
          ? {
              shadowColor: 'text',
              shadowOpacity: 0.18,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }
          : {}),
      }}
    >
      {leadingIcon && (
        <FontAwesome5
          name={leadingIcon}
          size={sz.iconSize}
          color={iconColor}
          style={{ marginRight: sz.gap }}
        />
      )}
      <Text
        sx={{
          fontSize: sz.fontSize,
          fontWeight: '600',
          color: v.color,
          textAlign: 'center',
        }}
      >
        {children}
      </Text>
      {trailingIcon && (
        <FontAwesome5
          name={trailingIcon}
          size={sz.iconSize}
          color={iconColor}
          style={{ marginLeft: sz.gap }}
        />
      )}
    </Pressable>
  )
}

export default Button
