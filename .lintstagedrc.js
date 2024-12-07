module.exports = {
  'src/**/*.ts?(x)': () => 'tsc',
  'src/**/*.(ts|tsx|js|jsx|json)': [
    'prettier --write',
    () => 'yarn jest --coverage=false --detectOpenHandles --forceExit --silent',
  ],
}
