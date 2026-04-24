import * as SQLite from 'expo-sqlite'
import { SQLiteDatabase } from 'expo-sqlite'
import dbClient from './client'
import { File, Directory, Paths } from 'expo-file-system'

export const initializeMigrationTable = async () => {
  const hasTable = await dbClient.schema.hasTable('migrations')
  if (!hasTable) {
    await dbClient.schema.createTable('migrations', (table) => {
      table.integer('version').primary().defaultTo(0)
    })
  }
  const hasVersion = await dbClient('migrations').select('version')
  if (hasVersion.length === 0) {
    await dbClient('migrations').insert({ version: 0 })
  }
}

export const updateDbVersion = async (version: number) => {
  await dbClient('migrations').update({ version })
}

const destroyAllTables = async () => {
  await dbClient.schema.dropTableIfExists('audio')
  await dbClient.schema.dropTableIfExists('migrations')
  await dbClient.schema.dropTableIfExists('cues')
}

const deleteAllFiles = async () => {
  // delete all files in document directory

  const documentDir = Paths.document
  const contents = documentDir.list()

  if (contents) {
    const promises = contents
      .filter(
        (item) =>
          // filter file name starting with sqlite with regex
          !/^sqlite/i.test(item.name)
      )
      .map(
        (item) =>
          new Promise<void>((resolve) => {
            item.delete()
            resolve()
          })
      )

    await Promise.all(promises)
  }
}

// =================== migrations start ===================

const createAudioTable = async () => {
  await dbClient.schema.createTable('audio', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('path').notNullable()
    table
      .enum('source', ['iCloud', 'Dropbox', 'Spotify', 'YT', 'Apple'])
      .notNullable()
    table.string('created_at').notNullable()
  })
}

const createCuesTable = async () => {
  await dbClient.schema.createTable('cues', (table) => {
    table.increments('id').primary()
    table.integer('audio_id').notNullable().unique()
    table.integer('start').notNullable()
  })
}

const addCueNumberColumnToCuesTable = async () => {
  await dbClient.schema.alterTable('cues', (table) => {
    table.integer('cue_number').notNullable()
  })
}

const allowAudioIdToNotBeUnique = async () => {
  await dbClient.schema.alterTable('cues', (table) => {
    table.dropUnique(['audio_id'])
  })
}

const migrations = {
  0: initializeMigrationTable,
  1: createAudioTable,
  2: createCuesTable,
  3: addCueNumberColumnToCuesTable,
  4: allowAudioIdToNotBeUnique,
}

// =================== migrations end ===================

export async function migrateDbIfNeeded() {
  // await destroyAllTables()
  // await deleteAllFiles()

  let currentDbVersion
  try {
    const db_version = await dbClient('migrations').select('version')

    currentDbVersion = db_version[0]?.version ?? -1
  } catch (e) {
    currentDbVersion = -1
  }

  const migrationKeys = Object.keys(migrations)
    .map((key) => parseInt(key))
    .sort()

  for (const key of migrationKeys) {
    if (key > currentDbVersion) {
      console.log(`running migration ${key}...`)
      await migrations[key]()
      await updateDbVersion(key)
    }
  }
}
