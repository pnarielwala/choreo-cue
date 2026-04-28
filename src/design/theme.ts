import { makeTheme } from 'dripsy'
import { semanticLight } from './tokens/semanticLight'
import { semanticDark } from './tokens/semanticDark'

export type ThemeMode = 'light' | 'dark'

const lightTheme = makeTheme({
  colors: semanticLight,
  space: [2, 4, 8, 16, 20, 32, 48, 56],
  radii: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, pill: 999 },
  breakpoints: [325, 500, 800] as unknown as Array<string>,
  fonts: {
    root: 'satoshi',
  },
  customFonts: {
    satoshi: {
      bold: 'satoshiBold',
      default: 'satoshi',
      normal: 'satoshi',
      400: 'satoshi',
      500: 'satoshiMedium',
      // Satoshi has no SemiBold (600), so map 600 → Bold for the closest match.
      600: 'satoshiBold',
      700: 'satoshiBold',
      900: 'satoshiBlack',
    },
  },
  text: {
    default: { fontSize: 16, color: 'text' },
    displayLg: {
      fontSize: [32, 40],
      fontWeight: '700',
      letterSpacing: -0.5,
      color: 'text',
      my: 3,
    },
    displaySm: {
      fontSize: [26, 32],
      fontWeight: '700',
      letterSpacing: -0.4,
      color: 'text',
      my: 3,
    },
    h1: {
      fontSize: [24, 28],
      fontWeight: '700',
      letterSpacing: -0.3,
      color: 'text',
      my: 3,
    },
    h2: {
      fontSize: [20, 22],
      fontWeight: '600',
      letterSpacing: -0.2,
      mt: [2, 3],
      mb: [1, 2],
      color: 'text',
    },
    h3: {
      fontSize: [16, 18],
      fontWeight: '600',
      color: 'text',
    },
    body: { fontSize: 16, color: 'text' },
    bodySmall: { fontSize: 14, color: 'text' },
    caption: { fontSize: 12, color: 'textMuted' },
    label: { fontSize: 14, fontWeight: '600', color: 'text' },
  },
})

const darkTheme = makeTheme({
  ...lightTheme,
  colors: semanticDark,
})

export const buildTheme = (mode: ThemeMode) =>
  mode === 'dark' ? darkTheme : lightTheme

type MyTheme = typeof lightTheme

declare module 'dripsy' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DripsyCustomTheme extends MyTheme {}
}

export default lightTheme
