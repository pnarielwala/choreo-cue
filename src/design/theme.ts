import { makeTheme, Theme } from 'dripsy'

// const makeTheme = <T extends Theme>(t: T): T => t

const theme = makeTheme({
  colors: {
    background: '#fff',
    text: '#000',
    divider: '#C8C8C8',
    primary: '#32E0C4',
    secondary: '#000',
    muted: '#C8C8C8',
    sliderTrackBackground: '#C8C8C8',
    sliderTrack: '#000',
    sliderThumb: '#000',
    // other
    red: '#f35588',
    green: '#a3f7bf',
    yellow: '#fff591',
    blue: '#05dfd7',
    orange: '#F8A978',
    black: '#000',
  },
  space: [2, 4, 8, 16, 20, 32, 48, 56],
  breakpoints: [325, 500, 800] as unknown as Array<string>,
  fonts: {
    root: 'nunito',
  },
  customFonts: {
    nunito: {
      bold: 'nunitoBold',
      default: 'nunito',
      normal: 'nunito',
      400: 'nunito',
      500: 'nunitoSemiBold',
      600: 'nunitoBold',
      700: 'nunitoBold',
      800: 'nunitoExtraBold',
      900: 'nunitoBlack',
    },
  },
  text: {
    default: {
      fontSize: 18,
      color: 'text',
    },
    h1: {
      fontWeight: 'bold',
      fontSize: [24, 32],
      color: 'text',
      my: 3,
    },
    h2: {
      fontWeight: 'bold',
      fontSize: [20, 24],
      mt: [2, 3],
      mb: [1, 2],
      color: 'text',
    },
    body: {
      fontSize: 18,
      color: 'text',
    },
    bodySmall: {
      fontSize: 14,
      color: 'text',
    },
  },
})

type MyTheme = typeof theme
declare module 'dripsy' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DripsyCustomTheme extends MyTheme {}
}

export default theme
