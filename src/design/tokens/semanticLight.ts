import { palette } from './palette'
import type { ThemeColors } from './colors'

export const semanticLight: ThemeColors = {
  background: palette.white,
  surface: palette.white,
  surfaceMuted: palette.neutral[50],
  surfaceElevated: palette.white,
  surfaceInverse: palette.neutral[900],

  text: palette.neutral[900],
  textMuted: palette.neutral[500],
  textSubtle: palette.neutral[400],
  textInverse: palette.white,

  border: palette.neutral[200],
  borderMuted: palette.neutral[100],
  divider: palette.neutral[200],

  accent: palette.accent[500],
  accentMuted: palette.accent[300],
  accentText: palette.white,

  danger: palette.red[500],
  dangerText: palette.white,
  success: palette.green[500],
  warning: palette.amber[500],
  info: palette.blue[500],

  sliderTrack: palette.neutral[900],
  sliderTrackBackground: palette.neutral[200],
  sliderThumb: palette.neutral[900],

  cueSlot1: palette.cueDefaults.light.slot1,
  cueSlot2: palette.cueDefaults.light.slot2,
  cueSlot3: palette.cueDefaults.light.slot3,
  cueSlot4: palette.cueDefaults.light.slot4,
  cueBorder: palette.neutral[900],
}
