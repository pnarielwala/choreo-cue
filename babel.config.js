const path = require('path');
const fs = require('fs');

const alias = fs
  .readdirSync('./src', { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)
  .reduce((itr, value, index) => {
    return Object.assign({}, itr, {
      [value]: `./src/${value}`,
    });
  }, {});

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: ['./src'],
          alias,
        },
      ],
    ],
  };
};
