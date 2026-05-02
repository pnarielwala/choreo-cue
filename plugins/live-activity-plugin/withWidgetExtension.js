const {
  withDangerousMod,
  withXcodeProject,
} = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const SWIFT_FILES = [
  'CueAttributes.swift',
  'JumpToCueIntent.swift',
  'ChoreoCueLiveActivityWidget.swift',
]
const PLIST_FILE = 'Info.plist'
const ENTITLEMENTS_FILE = 'ChoreoCueLiveActivity.entitlements'

const withWidgetExtension = (config, opts) => {
  config = withWidgetSources(config, opts)
  config = withWidgetXcodeTarget(config, opts)
  return config
}

// Copy the Swift / plist / entitlements sources from this plugin's swift/
// directory into ios/<widgetTargetName>/ inside the prebuilt project.
function withWidgetSources(config, opts) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot
      const platformRoot = config.modRequest.platformProjectRoot
      const widgetDir = path.join(platformRoot, opts.widgetTargetName)
      fs.mkdirSync(widgetDir, { recursive: true })
      const sourceDir = path.join(
        projectRoot,
        'plugins',
        'live-activity-plugin',
        'swift'
      )
      for (const f of [...SWIFT_FILES, PLIST_FILE, ENTITLEMENTS_FILE]) {
        fs.copyFileSync(path.join(sourceDir, f), path.join(widgetDir, f))
      }
      return config
    },
  ])
}

function withWidgetXcodeTarget(config, opts) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults
    const targetName = opts.widgetTargetName
    const bundleIdentifier = `${config.ios.bundleIdentifier}.${opts.widgetBundleSuffix}`

    // Idempotency: if a target with this name already exists, bail.
    const existing = project.pbxNativeTargetSection()
    for (const key in existing) {
      if (typeof existing[key] !== 'object') continue
      if (existing[key].name === targetName) {
        return config
      }
    }

    // 1. PBXGroup for the new widget folder, sibling to the main app group.
    const fileRefs = SWIFT_FILES.map((name) => ({
      basename: name,
      type: 'sourcecode.swift',
    }))
    fileRefs.push({ basename: PLIST_FILE, type: 'text.plist.xml' })
    fileRefs.push({
      basename: ENTITLEMENTS_FILE,
      type: 'text.plist.entitlements',
    })

    const pbxGroup = project.addPbxGroup(
      fileRefs.map((f) => f.basename),
      targetName,
      targetName
    )

    // Attach the new group under the top-level project group.
    const groups = project.hash.project.objects['PBXGroup']
    for (const key of Object.keys(groups)) {
      if (typeof groups[key] !== 'object') continue
      const g = groups[key]
      if (!g.name && !g.path) {
        // top-level group
        g.children.push({
          value: pbxGroup.uuid,
          comment: targetName,
        })
        break
      }
    }

    // 2. New native target (app extension).
    const target = project.addTarget(
      targetName,
      'app_extension',
      targetName,
      bundleIdentifier
    )

    // 3. Build phases.
    project.addBuildPhase(
      SWIFT_FILES,
      'PBXSourcesBuildPhase',
      'Sources',
      target.uuid
    )
    project.addBuildPhase(
      [],
      'PBXResourcesBuildPhase',
      'Resources',
      target.uuid
    )
    project.addBuildPhase(
      [],
      'PBXFrameworksBuildPhase',
      'Frameworks',
      target.uuid
    )

    // 4. Build settings on both Debug and Release.
    const configurations = project.pbxXCBuildConfigurationSection()
    for (const key in configurations) {
      if (typeof configurations[key] !== 'object') continue
      const buildSettings = configurations[key].buildSettings || {}
      if (buildSettings.PRODUCT_NAME === `"${targetName}"`) {
        buildSettings.IPHONEOS_DEPLOYMENT_TARGET = opts.deploymentTarget
        buildSettings.SWIFT_VERSION = '5.9'
        buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${bundleIdentifier}"`
        buildSettings.INFOPLIST_FILE = `"${targetName}/${PLIST_FILE}"`
        buildSettings.CODE_SIGN_ENTITLEMENTS = `"${targetName}/${ENTITLEMENTS_FILE}"`
        buildSettings.CODE_SIGN_STYLE = 'Automatic'
        buildSettings.CURRENT_PROJECT_VERSION = '1'
        buildSettings.MARKETING_VERSION = '1.0'
        buildSettings.GENERATE_INFOPLIST_FILE = 'NO'
        buildSettings.LD_RUNPATH_SEARCH_PATHS =
          '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"'
        buildSettings.SKIP_INSTALL = 'YES'
        buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"'
      }
    }

    // Note: addTarget() with type 'app_extension' already creates a
    // PBXCopyFilesBuildPhase on the first (main app) target, adds the
    // produced .appex into it, and wires a target dependency. Adding our
    // own phase here would orphan the build file and break CocoaPods'
    // Xcodeproj parser.

    return config
  })
}

module.exports = withWidgetExtension
