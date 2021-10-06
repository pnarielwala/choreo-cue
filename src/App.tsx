import 'react-native-gesture-handler'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
  StackScreenProps,
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack'

import { useFonts } from 'expo-font'
import AppLoading from 'expo-app-loading'

import { DripsyProvider, Icon } from 'design'
import theme from './design/theme'
import LeftArrow from 'assets/left_arrow.svg'

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

const RootStack = createStackNavigator<StacksT>()

const App = () => {
  let [fontsLoaded] = useFonts({
    ['nunito']: require('assets/fonts/Nunito-Regular.ttf'),
    ['nunitoBold']: require('assets/fonts/Nunito-Bold.ttf'),
    ['nunitoSemiBold']: require('assets/fonts/Nunito-SemiBold.ttf'),
    ['nunitoExtraBold']: require('assets/fonts/Nunito-ExtraBold.ttf'),
    ['nunitoLight']: require('assets/fonts/Nunito-Light.ttf'),
    ['nunitoExtraLight']: require('assets/fonts/Nunito-ExtraLight.ttf'),
    ['nunitoBlack']: require('assets/fonts/Nunito-Black.ttf'),
  })

  if (!fontsLoaded) {
    return <AppLoading />
  }

  const screenOptions: StackNavigationOptions = {
    headerTitle: '',
    headerTransparent: true,
    headerBackTitleVisible: false,
    headerBackImage: () => (
      <Icon as={LeftArrow} sx={{ color: 'black', ml: 3 }} />
    ),
  }
  const modalOptions: StackNavigationOptions = {
    presentation: 'modal',
    headerTitle: '',
    headerTransparent: true,
    headerBackTitleVisible: false,
  }
  return (
    <DripsyProvider theme={theme}>
      <QueryClientProvider client={new QueryClient()}>
        <NavigationContainer>
          <ErrorBoundary>
            <RootStack.Navigator initialRouteName="Home">
              {/* Normal Stack Screens */}
              <RootStack.Group screenOptions={screenOptions}>
                <RootStack.Screen name="Home" component={Main} />
                <RootStack.Screen
                  name="Player"
                  component={MusicPlayer}
                  options={{ gestureEnabled: false }}
                />
              </RootStack.Group>

              {/* Modal Stack Screens */}
              <RootStack.Group screenOptions={modalOptions}>
                <RootStack.Screen
                  name="DropboxNavigator"
                  component={DropboxNavigator}
                />
              </RootStack.Group>
            </RootStack.Navigator>
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
            ref={(ref) => Toast.setRef(ref)}
            topOffset={45}
          />
        </NavigationContainer>
      </QueryClientProvider>
    </DripsyProvider>
  )
}

export default App
