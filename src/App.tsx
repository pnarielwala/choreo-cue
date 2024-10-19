import 'react-native-gesture-handler'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'

import {
  ParamListBase,
  StackNavigationState,
  NavigationContainer,
} from '@react-navigation/native'
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  StackScreenProps,
  createStackNavigator,
  StackNavigationOptions,
  StackNavigationEventMap,
} from '@react-navigation/stack'

import { useFonts } from 'expo-font'
import { withLayoutContext } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

import { DripsyProvider, View } from 'design'
import { Text } from 'react-native'
import theme from './design/theme'

import Main from 'screens/Main'
import MusicPlayer from 'screens/MusicPlayer'
import DropboxNavigator from 'screens/DropboxNavigator'
import ErrorBoundary from 'components/ErrorBoundary'

export type StacksT = {
  Home: undefined
  Player: {
    musicData: { uri: string; name: string }
  }
  DropboxNavigator: {
    path: string
    name: string
  }
}

export type ScreenPropsT<T extends keyof StacksT> = StackScreenProps<StacksT, T>

const Stack = createStackNavigator<StacksT>()

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false)

  let [fontsLoaded] = useFonts({
    ['nunito']: require('assets/fonts/Nunito-Regular.ttf'),
    ['nunitoBold']: require('assets/fonts/Nunito-Bold.ttf'),
    ['nunitoSemiBold']: require('assets/fonts/Nunito-SemiBold.ttf'),
    ['nunitoExtraBold']: require('assets/fonts/Nunito-ExtraBold.ttf'),
    ['nunitoLight']: require('assets/fonts/Nunito-Light.ttf'),
    ['nunitoExtraLight']: require('assets/fonts/Nunito-ExtraLight.ttf'),
    ['nunitoBlack']: require('assets/fonts/Nunito-Black.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      setAppIsReady(true)
    }
  }, [fontsLoaded])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  const headerStyles = {
    headerLeftContainerStyle: {
      paddingHorizontal: theme.space[3],
    },
    headerRightContainerStyle: {
      paddingHorizontal: theme.space[3],
    },
    headerStyle: {
      backgroundColor: theme.colors.background,
      shadowRadius: 0,
      shadowOffset: {
        height: 0,
        width: 0,
      },
      shadowColor: theme.colors.background,
      elevation: 0,
    },
  }

  const screenOptions: StackNavigationOptions = {
    headerTitle: '',
    ...headerStyles,
    headerBackTitleVisible: false,
  }
  const modalOptions: StackNavigationOptions = {
    presentation: 'modal',
    headerTitle: '',
    headerBackTitleVisible: false,
    ...headerStyles,
  }

  return (
    <DripsyProvider theme={theme}>
      <QueryClientProvider client={new QueryClient()}>
        <NavigationContainer>
          <ErrorBoundary>
            <View onLayout={onLayoutRootView} />
            <Stack.Navigator initialRouteName="Home">
              {/* Normal Stack Screens */}
              <Stack.Group screenOptions={screenOptions}>
                <Stack.Screen name="Home" component={Main} />
                <Stack.Screen
                  name="Player"
                  component={MusicPlayer}
                  options={{ gestureEnabled: false }}
                />
              </Stack.Group>

              {/* Modal Stack Screens */}
              <Stack.Group screenOptions={modalOptions}>
                <Stack.Screen
                  name="DropboxNavigator"
                  component={DropboxNavigator}
                />
              </Stack.Group>
            </Stack.Navigator>
          </ErrorBoundary>

          <Toast
            config={{
              success: ({ ...rest }: BaseToastProps) => (
                <BaseToast
                  {...rest}
                  style={{ borderLeftColor: '#28df99' }}
                  text1Style={{
                    fontSize: 20,
                    fontWeight: '600',
                    marginBottom: 0,
                  }}
                  contentContainerStyle={{
                    paddingHorizontal: 12,
                  }}
                />
              ),
            }}
            topOffset={45}
          />
        </NavigationContainer>
      </QueryClientProvider>
    </DripsyProvider>
  )
}

const Main2 = () => {
  const onLayoutRootView = useCallback(async () => {
    if (true) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync()
    }
  }, [])

  return (
    <View
      sx={{
        flex: 1,
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onLayout={onLayoutRootView}
    >
      <Text>Hello world</Text>
    </View>
  )
}

export default App
