module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@google/semantic-release-replace-plugin',
      {
        replacements: [
          {
            files: ['app.json'],
            from: '"version": ".*",',
            to: '"version": "${nextRelease.version}",',
          },
          {
            files: ['app.json'],
            from: '"buildNumber": ".*",',
            to: '"buildNumber": "${nextRelease.version}",',
          },
          {
            files: ['app.json'],
            from: '"versionCode": ".*",',
            to: '"versionCode": "${nextRelease.version}",',
          },
        ],
      },
    ],
    '@semantic-release/changelog',
    '@semantic-release/github',

    [
      '@semantic-release/git',
      {
        message:
          'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
        assets: ['app.json'],
      },
    ],
  ],
}
