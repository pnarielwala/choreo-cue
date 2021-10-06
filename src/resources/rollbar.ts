import { Client, Configuration } from 'rollbar-react-native'
import * as Updates from 'expo-updates'

const config = new Configuration('e6e701d6c69a4fa3a024dc2316c0bc4e', {
  environment: String(process.env.NODE_ENV),
  appVersion: Updates.updateId ?? 'development',
})
const rollbar = new Client(config)

export default rollbar
