import 'react-native-gesture-handler';
import React from 'react';
import MusicPlayer from './MusicPlayer';
import { NavigationContainer } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './SplashScreen';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Alert } from 'react-native';
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';
import DropboxNavigator from './DropboxNavigator';
import { QueryClient, QueryClientProvider } from 'react-query';

import { DripsyProvider } from 'dripsy';

import theme from './theme';
const RootStack = createStackNavigator();
const MainStack = createStackNavigator();

const MainStackScreen = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerTransparent: true,
      }}
    >
      <MainStack.Screen
        options={{ headerShown: false }}
        name="Home"
        component={SplashScreen}
      />
      <MainStack.Screen
        name="Player"
        component={MusicPlayer}
        options={({ navigation }) => ({
          headerTitle: '',
          gestureEnabled: false,

          headerLeft: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => {
                Alert.alert(
                  'Are you sure?',
                  'Exiting will clear all cues and the loaded music',
                  [
                    {
                      style: 'cancel',
                      text: 'Cancel',
                    },
                    {
                      style: 'destructive',
                      text: 'Exit',
                      onPress: navigation.goBack,
                    },
                  ],
                );
              }}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <FontAwesome
                name="angle-left"
                size={32}
                color="#3D425C"
                style={{
                  marginHorizontal: 12,
                }}
              />
            </TouchableOpacity>
          ),
        })}
      />
    </MainStack.Navigator>
  );
};

export default function App() {
  return (
    <DripsyProvider theme={theme}>
      <QueryClientProvider client={new QueryClient()}>
        <NavigationContainer>
          <RootStack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerTransparent: true,
            }}
            mode="modal"
          >
            <RootStack.Screen
              name="Main"
              component={MainStackScreen}
              options={{ headerShown: false }}
            />
            <RootStack.Screen
              name="DropboxNavigator"
              component={DropboxNavigator}
              options={{
                headerTransparent: false,
              }}
            />
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
}
