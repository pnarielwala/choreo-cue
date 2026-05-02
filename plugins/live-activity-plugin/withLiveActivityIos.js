const { withInfoPlist, withEntitlementsPlist } = require('@expo/config-plugins')

const withLiveActivityIos = (config, { appGroup }) => {
  config = withInfoPlist(config, (config) => {
    config.modResults.NSSupportsLiveActivities = true
    return config
  })

  config = withEntitlementsPlist(config, (config) => {
    const existing =
      config.modResults['com.apple.security.application-groups'] || []
    if (!existing.includes(appGroup)) {
      config.modResults['com.apple.security.application-groups'] = [
        ...existing,
        appGroup,
      ]
    }
    return config
  })

  return config
}

module.exports = withLiveActivityIos
