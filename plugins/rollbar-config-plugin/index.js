// plugins/rollbar-config-plugin/index.js
const withRollbarAndroid = require('./withRollbarAndroid')
const withRollbarIos = require('./withRollbarIos')

const withRollbar = (config, options) => {
  config = withRollbarAndroid(config, options)
  config = withRollbarIos(config, options)

  return config
}

module.exports = withRollbar
