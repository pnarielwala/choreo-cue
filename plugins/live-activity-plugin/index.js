const withLiveActivityIos = require('./withLiveActivityIos')
const withWidgetExtension = require('./withWidgetExtension')

const APP_GROUP = 'group.com.pnarielwala.choreo-cue'
const WIDGET_TARGET_NAME = 'ChoreoCueLiveActivity'
const WIDGET_BUNDLE_SUFFIX = 'LiveActivityExtension'
const DEPLOYMENT_TARGET = '17.0'

const withLiveActivity = (config) => {
  const opts = {
    appGroup: APP_GROUP,
    widgetTargetName: WIDGET_TARGET_NAME,
    widgetBundleSuffix: WIDGET_BUNDLE_SUFFIX,
    deploymentTarget: DEPLOYMENT_TARGET,
  }
  config = withLiveActivityIos(config, opts)
  config = withWidgetExtension(config, opts)
  return config
}

module.exports = withLiveActivity
