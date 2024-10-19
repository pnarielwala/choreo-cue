import {
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
} from '@expo/vector-icons'
import 'react-native-gesture-handler/jestSetup'
// import '@testing-library/jest-native/extend-expect';

jest.mock('rollbar-react-native')
jest.mock('../resources/rollbar')

jest.mock('@expo/vector-icons', () => ({
  Feather: '',
  AntDesign: '',
  MaterialCommunityIcons: '',
  FontAwesome5: '',
  FontAwesome6: '',
}))

jest.mock('expo-secure-store', () => ({
  SecureStore: {
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
  },
}))

jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      eas: {
        projectId: '67b74356-e2b9-428a-8388-c05d0629a0be',
      },
    },
  },
}))

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper')
