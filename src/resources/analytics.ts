import { Client } from 'rollbar-react-native'
import * as Updates from 'expo-updates'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import * as DeviceInfo from 'expo-device'

const versionString = `${Constants.manifest2?.extra?.expoClient?.version} (${
  Constants.manifest2?.extra?.expoClient?.[
    {
      ios: 'ios',
      android: 'android',
      web: 'web',
    }[Platform.OS]
  ]?.[
    {
      ios: 'buildNumber',
      android: 'versionCode',
      web: 'web',
    }[Platform.OS]
  ] || 'dev mode'
})`

const rollbar = new Client({
  accessToken: process.env.EXPO_ROLLBAR_ACCESS_TOKEN,
  environment: Updates.channel ? Updates.channel : 'development',
  version: versionString,
  code_version:
    Updates.channel === 'production'
      ? versionString
      : (Constants.manifest2?.metadata?.['updateGroup'] ?? 'local'),
  captureDeviceInfo: true,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    context: {
      deviceName: DeviceInfo.deviceName,
      deviceBrand: DeviceInfo.brand,
      deviceModel: DeviceInfo.modelName,
      deviceYear: DeviceInfo.deviceYearClass,
      osName: DeviceInfo.osName,
      osVersion: DeviceInfo.osVersion,
    },
  },
  enabled: process.env.NODE_ENV !== 'test',
})

export default rollbar
