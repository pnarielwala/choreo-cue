// Shim for react-native that replaces SafeAreaView with react-native-safe-area-context
const ReactNative = require('react-native')
const { SafeAreaView: SafeAreaViewContext } = require('react-native-safe-area-context')

// Destructure to avoid accessing SafeAreaView
const {
  SafeAreaView: _deprecated,
  ...ReactNativeWithoutSafeAreaView
} = ReactNative

// Re-export everything except the deprecated SafeAreaView
module.exports = {
  ...ReactNativeWithoutSafeAreaView,
  SafeAreaView: SafeAreaViewContext,
}
