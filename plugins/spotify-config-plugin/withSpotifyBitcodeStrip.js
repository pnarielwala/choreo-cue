const { withXcodeProject } = require('@expo/config-plugins')

const BUILD_PHASE_NAME = 'Strip Spotify bitcode'

const SHELL_SCRIPT = [
  'set -e',
  'FRAMEWORK="${TARGET_BUILD_DIR}/${WRAPPER_NAME}/Frameworks/SpotifyiOS.framework/SpotifyiOS"',
  'if [ -f "$FRAMEWORK" ]; then',
  '  echo "Stripping bitcode from $FRAMEWORK"',
  '  xcrun bitcode_strip -r "$FRAMEWORK" -o "$FRAMEWORK"',
  'else',
  '  echo "SpotifyiOS framework not found at $FRAMEWORK; skipping bitcode strip"',
  'fi',
].join('\n')

const withSpotifyBitcodeStrip = (config) => {
  return withXcodeProject(config, (config) => {
    const project = config.modResults
    const phases = project.hash.project.objects.PBXShellScriptBuildPhase || {}
    const alreadyAdded = Object.entries(phases).some(([key, phase]) => {
      if (key.endsWith('_comment') || typeof phase !== 'object') return false
      const name = (phase.name || '').replace(/^"|"$/g, '')
      return name === BUILD_PHASE_NAME
    })
    if (alreadyAdded) return config

    const target = project.getFirstTarget()
    project.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      BUILD_PHASE_NAME,
      target.uuid,
      {
        shellPath: '/bin/sh',
        shellScript: SHELL_SCRIPT,
      }
    )
    return config
  })
}

module.exports = withSpotifyBitcodeStrip
