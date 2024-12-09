module.exports = {
  expo: {
    name: 'Choreo Cue',
    slug: 'choreo-cue',
    version: '1.11.0',
    scheme: 'choreo-cue',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './src/assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/67b74356-e2b9-428a-8388-c05d0629a0be',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pnarielwala.choreo-cue',
      buildNumber: '1.11.3',
      infoPlist: {
        UIBackgroundModes: ['audio'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      versionCode: 11,
      package: 'com.pnarielwala.choreocue',
      permissions: [],
      blockedPermissions: ['android.permission.RECORD_AUDIO'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: '67b74356-e2b9-428a-8388-c05d0629a0be',
      },
    },
    plugins: [
      'expo-router',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            extraPods: [
              {
                name: 'RollbarReport',
                modular_headers: true,
              },
              {
                name: 'RollbarCrash',
                modular_headers: true,
              },
            ],
          },
        },
      ],
      [
        './plugins/rollbar-config-plugin',
        {
          environment: 'production',
          rollbarPostToken: process.env.EXPO_ROLLBAR_ACCESS_TOKEN,
        },
      ],
    ],
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
}
