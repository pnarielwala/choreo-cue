// import { Client } from 'rollbar-react-native'
// import * as Updates from 'expo-updates'

// const rollbarOld = new Client({
//   accessToken: process.env.EXPO_ROLLBAR_ACCESS_TOKEN,
//   environment: String(process.env.NODE_ENV),
//   version: Updates.updateId ?? 'development',
//   enabled: String(process.env.NODE_ENV) !== 'development',
// })

// rollbarOld.critical

const rollbar = {
  error: (
    error: string | object | any[] | Error | Function | Date,
    extra?: object | null | undefined
  ) => {
    console.error('Rollbar error:', error)
  },
  critical: (
    error: string | object | any[] | Error | Function | Date,
    extra?: object | null | undefined
  ) => {
    console.error('Rollbar critical:', error)
  },
  info: (
    message: string | object | any[] | Error | Function | Date,
    extra?: object | null | undefined
  ) => {
    console.info('Rollbar info:', message)
  },
}

export default rollbar
