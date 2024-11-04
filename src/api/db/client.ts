import ExpoSQLiteDialect from '@expo/knex-expo-sqlite-dialect'
import Knex from 'knex'

const knex = Knex({
  client: ExpoSQLiteDialect,
  connection: {
    filename: 'choreo_cue.db',
  },
  useNullAsDefault: true,
  debug: true,
})

export default knex
