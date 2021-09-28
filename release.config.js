module.exports = {
  branches: ['main'],
  plugins: ['semantic-release-expo'],
  verifyConditions: [
    'semantic-release-expo',
    '@semantic-release/changelog',
    '@semantic-release/git',
    [
      '@semantic-release/exec',
      {
        verifyCmd: 'echo ${options.channel}',
      },
    ],
  ],
  prepare: [
    'semantic-release-expo',
    '@semantic-release/changelog',
    {
      path: '@semantic-release/git',
      assets: ['CHANGELOG.md', 'app.json'],
    },
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'yarn expo login -u $EXPO_USERNAME -p $EXPO_PASSWORD',
      },
    ],
  ],
  publish: [
    [
      '@semantic-release/exec',
      {
        publishCmd: 'yarn expo publish --release-channel=$RELEASE_CHANNEL',
      },
    ],
  ],
}
