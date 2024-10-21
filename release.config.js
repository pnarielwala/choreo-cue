module.exports = {
  branches: ['main', { name: 'add-build-to-ci', prerelease: true }],
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
        ],
      },
    ],
    '@semantic-release/changelog',
    '@semantic-release/github',

    [
      '@semantic-release/git',
      {
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        assets: ['app.json'],
      },
    ],
  ],
}
