import { palette } from './palette'
import type { ThemeColors } from './colors'

export const semanticDark: ThemeColors = {
  background: palette.slate[950],
  surface: palette.slate[950],
  surfaceMuted: palette.slate[900],
  surfaceElevated: palette.neutral[800],
  surfaceInverse: palette.white,

  text: palette.slate[50],
  textMuted: palette.neutral[400],
  textSubtle: palette.neutral[500],
  textInverse: palette.neutral[950],

  border: palette.neutral[800],
  borderMuted: palette.neutral[900],
  divider: palette.neutral[800],

  accent: palette.accent[400],
  accentMuted: palette.accent[600],
  accentText: palette.neutral[950],

  danger: palette.red[400],
  dangerText: palette.neutral[950],
  success: palette.green[400],
  warning: palette.amber[400],
  info: palette.blue[400],

  sliderTrack: palette.slate[50],
  sliderTrackBackground: palette.neutral[800],
  sliderThumb: palette.slate[50],

  cueSlot1: palette.cueDefaults.dark.slot1,
  cueSlot2: palette.cueDefaults.dark.slot2,
  cueSlot3: palette.cueDefaults.dark.slot3,
  cueSlot4: palette.cueDefaults.dark.slot4,
  cueBorder: palette.slate[50],
}
