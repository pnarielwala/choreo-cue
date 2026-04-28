import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useColorScheme } from 'react-native'
import { DripsyProvider } from 'dripsy'
import * as SecureStore from 'expo-secure-store'
import { buildTheme, ThemeMode } from './theme'

export type ThemeModePref = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'themeMode'

type ThemeModeContextValue = {
  mode: ThemeModePref
  setMode: (mode: ThemeModePref) => void
  resolvedMode: ThemeMode
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined
)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme() ?? 'light'
  const [mode, setModeState] = useState<ThemeModePref>('system')

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored)
        }
      })
      .catch(() => {
        // best-effort persistence; fall back to default 'system'
      })
  }, [])

  const setMode = (next: ThemeModePref) => {
    setModeState(next)
    SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {})
  }

  const resolvedMode: ThemeMode =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode

  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode])

  const value = useMemo(
    () => ({ mode, setMode, resolvedMode }),
    [mode, resolvedMode]
  )

  return (
    <ThemeModeContext.Provider value={value}>
      <DripsyProvider theme={theme}>{children}</DripsyProvider>
    </ThemeModeContext.Provider>
  )
}

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider')
  return ctx
}
