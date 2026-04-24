const APP_ENV = process.env.APP_ENV || 'production'

const envConfig = {
  development: {
    name: 'Choreo Cue (Dev)',
    bundleIdentifier: 'com.pnarielwala.choreo-cue.dev',
    androidPackage: 'com.pnarielwala.choreocue.dev',
  },
  production: {
    name: 'Choreo Cue',
    bundleIdentifier: 'com.pnarielwala.choreo-cue',
    androidPackage: 'com.pnarielwala.choreocue',
  },
}

const env = envConfig[APP_ENV] || envConfig.production

module.exports = {
  expo: {
    name: env.name,
    slug: 'choreo-cue',
    version: '1.12.2',
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
      bundleIdentifier: env.bundleIdentifier,
      infoPlist: {
        UIBackgroundModes: ['audio'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: env.androidPackage,
      permissions: [],
      blockedPermissions: ['android.permission.RECORD_AUDIO'],
    },
    web: { favicon: './assets/favicon.png' },
    extra: { eas: { projectId: '67b74356-e2b9-428a-8388-c05d0629a0be' } },
    plugins: [
      'expo-font',
      'expo-router',
      'expo-asset',
      'expo-secure-store',
      'expo-sqlite',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
            extraPods: [
              { name: 'RollbarReport', modular_headers: true },
              { name: 'RollbarCrash', modular_headers: true },
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
      policy: 'fingerprint',
    },
  },
}
