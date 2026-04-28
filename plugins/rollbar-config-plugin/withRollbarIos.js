const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

// RollbarNotifier 3.3.3 imports <netinet6/in6.h>, which newer Xcode/Clang
// rejects as a private header. The import is unused. Strip it via a Podfile
// post_install hook so the patch survives `pod install` regenerations.
const withRollbarIos = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      )
      let contents = fs.readFileSync(podfilePath, 'utf8')

      const marker = '# rollbar-ios-patch'
      if (contents.includes(marker)) return config

      const patchSnippet = `    ${marker}
    rollbar_reachability = File.join(installer.sandbox.root, 'RollbarNotifier/RollbarNotifier/Sources/RollbarNotifier/RollbarReachability.m')
    if File.exist?(rollbar_reachability)
      original = File.read(rollbar_reachability)
      patched = original.gsub(/^#import <netinet6\\/in6\\.h>$/, '// #import <netinet6/in6.h> // patched: private header')
      File.write(rollbar_reachability, patched) if patched != original
    end
`

      const hookRegex = /(post_install do \|installer\|\s*\n)/
      if (!hookRegex.test(contents)) {
        throw new Error(
          'rollbar-config-plugin: could not find post_install block in Podfile'
        )
      }
      contents = contents.replace(hookRegex, `$1${patchSnippet}`)
      fs.writeFileSync(podfilePath, contents)
      return config
    },
  ])
}

module.exports = withRollbarIos
