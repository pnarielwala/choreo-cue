module.exports = {
  'src/**/*.ts?(x)': () => 'tsc',
  'src/**/*.(ts|tsx|js|jsx|json)': 'prettier --write',
  'src/**/*.(ts|tsx|js|jsx|json)': () =>
    'yarn jest --coverage=false --detectOpenHandles --forceExit',
};
