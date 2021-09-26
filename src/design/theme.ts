import { Theme } from 'dripsy';

const makeTheme = <T extends Theme>(t: T) => t;

const theme = makeTheme({
  colors: {
    background: '#000',
    text: '#000',
    divider: '#C8C8C8',
    primary: '#32E0C4',
    secondary: '#000',
    muted: '#C8C8C8',
    // other
    red: '#f35588',
    green: '#a3f7bf',
    yellow: '##fff591',
    blue: '#05dfd7',
    orange: '#F8A978',
  },
  space: [2, 4, 8, 16, 20, 32, 48, 56],
  text: {
    heading1: {
      fontWeight: 'bold',
      fontSize: 32,
    },
    body: {
      fontSize: 18,
    },
    bodySmall: {
      fontSize: 14,
    },
  },
});

export default theme;
