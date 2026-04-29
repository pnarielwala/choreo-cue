// plugins/rollbar-config-plugin/withRollbarAndroid.js
const { withMainApplication, AndroidConfig } = require('@expo/config-plugins')

const withRollbarAndroid = (config, { environment }) => {
  return withRollbarMainApplication(config, { environment })
}

const withRollbarMainApplication = (_config, { environment }) => {
  return withMainApplication(_config, async (config) => {
    config.modResults.contents = modifyMainApplication({
      contents: config.modResults.contents,
      rollbarPostToken: process.env.EXPO_ROLLBAR_ACCESS_TOKEN,
      environment,
      packageName: AndroidConfig.Package.getPackage(config),
    })

    return config
  })
}

const modifyMainApplication = ({
  contents,
  rollbarPostToken,
  packageName,
  environment,
}) => {
  if (!packageName) {
    throw new Error('Android package not found')
  }

  const importLine = `import com.rollbar.RollbarReactNative`
  if (!contents.includes(importLine)) {
    const packageImport = `package ${packageName}`
    // Add the import line to the top of the file
    // Replace the first line with the rollbar import
    contents = contents.replace(
      `${packageImport}`,
      `${packageImport}\n${importLine}`
    )
  }

  const initLine = `RollbarReactNative.init(this, "${rollbarPostToken}", "${environment}")`

  if (!contents.includes(initLine)) {
    const soLoaderLine = 'SoLoader.init(this, OpenSourceMergedSoMapping)'
    // Replace the line SoLoader.init(this, /* native exopackage */ false); with regex
    contents = contents.replace(
      `${soLoaderLine}`,
      `${soLoaderLine}\n\t\t${initLine}\n`
    )
  }

  return contents
}

module.exports = withRollbarAndroid
