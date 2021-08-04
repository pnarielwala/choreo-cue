module.exports = {
  preset: 'jest-expo',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*|@dripsy/.*|dripsy)',
  ],
  setupFiles: ['<rootDir>/src/__test-utils__/setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__test-utils__/setupEnv.ts'],
};
