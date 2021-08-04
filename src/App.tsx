import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  StackScreenProps,
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { DripsyProvider } from 'dripsy';
import theme from './theme';

import Main from 'screens/Main';
import MusicPlayer from 'screens/MusicPlayer';
import DropboxNavigator from 'screens/DropboxNavigator';

type StacksT = {
  Home: undefined;
  Player: {
    musicData: { uri: string; name: string };
  };
  DropboxNavigator: {
    path: string;
    name: string;
  };
};

export type ScreenPropsT<T extends keyof StacksT> = StackScreenProps<
  StacksT,
  T
>;

const RootStack = createStackNavigator();

const App = () => {
  const screenOptions: StackNavigationOptions = {
    headerTitle: '',
    headerTransparent: true,
    headerBackTitleVisible: false,
    headerBackImage: () => (
      <FontAwesome
        name="angle-left"
        size={32}
        color="#3D425C"
        style={{
          marginHorizontal: 12,
        }}
      />
    ),
  };
  const modalOptions: StackNavigationOptions = {
    presentation: 'modal',
  };
  return (
    <DripsyProvider theme={theme}>
      <QueryClientProvider client={new QueryClient()}>
        <NavigationContainer>
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
  );
};

export default App;
