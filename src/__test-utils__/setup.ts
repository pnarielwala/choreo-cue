import 'react-native-gesture-handler/jestSetup'

// jest.mock('rollbar-react-native')
// jest.mock('../resources/rollbar')

// Mock SafeAreaView from react-native to use react-native-safe-area-context
jest.mock('react-native/Libraries/Components/SafeAreaView/SafeAreaView', () => {
  const { SafeAreaView } = require('react-native-safe-area-context')
  return { SafeAreaView }
})

import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock'

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext)

jest.mock('../api/db/client', () => {
  const knex = require('knex')
  const mockKnex = require('mock-knex')

  // Create a Knex instance with the Expo SQLite dialect
  const db = knex({
    client: 'sqlite3',
    connection: {
      filename: ':memory:', // Use in-memory database for testing
    },
    useNullAsDefault: true,
  })

  // Initialize mock-knex
  mockKnex.mock(db)

  return db
})

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

jest.mock('live-activity', () => ({
  startActivity: jest.fn(async () => null),
  updateActivity: jest.fn(async () => {}),
  endActivity: jest.fn(async () => {}),
  areActivitiesEnabled: jest.fn(() => false),
  addCueTapListener: jest.fn(() => ({ remove: jest.fn() })),
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
