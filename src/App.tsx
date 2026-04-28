import 'react-native-gesture-handler'
import React, { useCallback, useEffect, useState } from 'react'

import * as Updates from 'expo-updates'

import { SQLiteProvider } from 'expo-sqlite'
import { NavigationContainer } from '@react-navigation/native'
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  StackScreenProps,
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack'

import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

import { Pressable, View, ThemeProvider, useTheme } from 'design'
import Main from 'screens/Main'
import MusicPlayer from 'screens/MusicPlayer'
import DropboxNavigator from 'screens/DropboxNavigator'
import ErrorBoundary from 'components/ErrorBoundary'
import SelectSource from 'screens/SelectSource'
import Settings from 'screens/Settings'
import { FontAwesome5 } from '@expo/vector-icons'
import { migrateDbIfNeeded } from 'api/db/migrations'

/**
 * To add a new screen:
 *   1. Add `<RouteName>: <params or undefined>` to StacksT below.
 *   2. Create the screen component at `src/screens/<RouteName>/<RouteName>.tsx`
 *      and re-export it from `src/screens/<RouteName>/index.ts`.
 *   3. Register `<Stack.Screen name="<RouteName>" component={<RouteName>} />`
 *      inside the appropriate Stack.Group below (normal or modal).
 *   4. Navigate via `navigation.push('<RouteName>')`.
 */
export type StacksT = {
  Home: undefined
  Player: {
    musicData: { uri: string; name: string; id: number }
  }
  DropboxNavigator: {
    path: string
    name: string
  }
  SelectSource: undefined
  Settings: undefined
}

export type ScreenPropsT<T extends keyof StacksT> = StackScreenProps<StacksT, T>

const Stack = createStackNavigator<StacksT>()

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

const Navigation = ({ onLayoutRootView }: { onLayoutRootView: () => void }) => {
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>

  const headerStyles = {
    headerLeftContainerStyle: {
      paddingHorizontal: theme.space[3],
    },
    headerRightContainerStyle: {
      paddingHorizontal: theme.space[3],
    },
    headerStyle: {
      backgroundColor: colors.background,
      shadowRadius: 0,
      shadowOffset: { height: 0, width: 0 },
      shadowColor: colors.background,
      elevation: 0,
    },
    headerTintColor: colors.text,
    headerTitleStyle: { color: colors.text },
  }

  const screenOptions: StackNavigationOptions = {
    headerTitle: '',
    ...headerStyles,
    headerBackButtonDisplayMode: 'minimal',
    cardStyle: { backgroundColor: colors.background },
    headerLeft: (props) =>
      props.canGoBack ? (
        <Pressable
          onPress={() => {
            props.onPress?.()
          }}
          hitSlop={48}
          accessibilityLabel="Back"
        >
          <FontAwesome5 name="chevron-left" size={24} color={colors.text} />
        </Pressable>
      ) : null,
  }
  const modalOptions: StackNavigationOptions = {
    presentation: 'modal',
    headerTitle: '',
    headerBackButtonDisplayMode: 'minimal',
    ...headerStyles,
  }

  return (
    <>
      <View onLayout={onLayoutRootView} />
      <Stack.Navigator initialRouteName="Home">
        {/* Normal Stack Screens */}
        <Stack.Group screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={Main} />
          <Stack.Screen name="SelectSource" component={SelectSource} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen
            name="Player"
            component={MusicPlayer}
            options={{ gestureEnabled: false }}
          />
        </Stack.Group>

        {/* Modal Stack Screens */}
        <Stack.Group screenOptions={modalOptions}>
          <Stack.Screen name="DropboxNavigator" component={DropboxNavigator} />
        </Stack.Group>
      </Stack.Navigator>

      <Toast
        config={{
          error: ({ ...rest }: BaseToastProps) => (
            <BaseToast
              {...rest}
              style={{
                borderLeftColor: colors.danger,
                backgroundColor: colors.surfaceElevated,
                height: 80,
                shadowOffset: { width: 0, height: 0 },
                shadowColor: colors.text,
                shadowOpacity: 0.2,
              }}
              text1Style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 0,
                color: colors.text,
              }}
              text2Style={{
                fontSize: 14,
                color: colors.textMuted,
                marginTop: 6,
              }}
              contentContainerStyle={{
                paddingHorizontal: 12,
              }}
              text2NumberOfLines={2}
            />
          ),

          success: ({ ...rest }: BaseToastProps) => (
            <BaseToast
              {...rest}
              style={{
                borderLeftColor: colors.success,
                backgroundColor: colors.surfaceElevated,
              }}
              text1Style={{
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 0,
                color: colors.text,
              }}
              contentContainerStyle={{
                paddingHorizontal: 12,
              }}
            />
          ),
        }}
        topOffset={45}
      />
    </>
  )
}

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false)
  const { isUpdatePending } = Updates.useUpdates()

  useEffect(() => {
    if (isUpdatePending) {
      Updates.reloadAsync()
    }
  }, [isUpdatePending])

  const [fontsLoaded] = useFonts({
    satoshi: require('assets/fonts/Satoshi-Regular.ttf'),
    satoshiMedium: require('assets/fonts/Satoshi-Medium.ttf'),
    satoshiBold: require('assets/fonts/Satoshi-Bold.ttf'),
    satoshiBlack: require('assets/fonts/Satoshi-Black.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      setAppIsReady(true)
    }
  }, [fontsLoaded])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <SQLiteProvider databaseName="choreo_cue.db" onInit={migrateDbIfNeeded}>
      <ThemeProvider>
        <QueryClientProvider client={new QueryClient()}>
          <NavigationContainer>
            <ErrorBoundary>
              <Navigation onLayoutRootView={onLayoutRootView} />
            </ErrorBoundary>
          </NavigationContainer>
        </QueryClientProvider>
      </ThemeProvider>
    </SQLiteProvider>
  )
}

export default App
