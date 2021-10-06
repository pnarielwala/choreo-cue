import { useDripsyTheme } from 'dripsy'
import theme from './theme'

const useTheme = () => {
  return useDripsyTheme().theme as typeof theme
}

export default useTheme
