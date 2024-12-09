module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@google/semantic-release-replace-plugin',
      {
        replacements: [
          {
            files: ['app.config.js'],
            from: "buildNumber: '.*'",
            to: "buildNumber: '${nextRelease.version}'",
          },
          {
            files: ['app.config.js'],
            from: 'versionCode: \\d*',
            to: (matched) =>
              `versionCode: ${parseInt(matched.split(': ')[1].trim()) + 1}`,
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
        assets: ['app.config.js'],
      },
    ],
  ],
}
