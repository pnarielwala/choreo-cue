const fs = require('fs')

const alias = fs
  .readdirSync('./src', { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .reduce((itr, value, index) => {
    return Object.assign({}, itr, {
      [value]: `./src/${value}`,
    })
  }, {})

module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript',
      'module:@expo/knex-expo-sqlite-dialect/babel-preset',
    ],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: 'react-native-dotenv',
        },
      ],
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: ['./src'],
          alias: {
            ...alias,
            'expo-sqlite/next': require.resolve('expo-sqlite'),
          },
        },
      ],
    ],
  }
}
