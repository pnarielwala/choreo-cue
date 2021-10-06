import { Client, Configuration } from 'rollbar-react-native'
import * as Updates from 'expo-updates'
import { ROLLBAR_ACCESS_TOKEN } from 'react-native-dotenv'

const config = new Configuration(ROLLBAR_ACCESS_TOKEN, {
  environment: String(process.env.NODE_ENV),
  appVersion: Updates.updateId ?? 'development',
})
const rollbar = new Client(config)

export default rollbar
