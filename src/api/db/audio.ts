import dbClient from './client'

import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'

export const createAudioTable = async () => {
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

export const getAudioFiles = async () => {
  // get all audio files sorted in reverse chronological order
  const results = await dbClient('audio')
    .select('*')
    .orderBy('created_at', 'desc')
  return (results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    uri: result.path,
  }))
}

export const updateAudioName = async (id: number, name: string) => {
  await dbClient('audio').where({ id }).update({ name })
}

export const getAudioFile = async (id: number) => {
  const result = await dbClient('audio').where({ id }).first()

  if (!result) {
    return null
  }
  return {
    id: result.id,
    name: result.name,
    uri: result.path,
  }
}

export const deleteAudioFile = async (id: number) => {
  const audioFile = await getAudioFile(id)
  if (!audioFile) {
    return
  }
  const { uri } = audioFile
  await dbClient('audio').where({ id }).del()
  await dbClient('cues').where({ audio_id: id }).del()
  await FileSystem.deleteAsync(uri)
}

export const addICloudAudioFile = async (
  file: DocumentPicker.DocumentPickerAsset
) => {
  const result = await dbClient('audio').insert(
    {
      name: file.name,
      path: file.uri,
      source: 'iCloud',
      created_at: new Date().toISOString(),
    },
    ['id']
  )

  return result[0].id
}

export const addDropboxAudioFile = async (file: {
  name: string
  uri: string
}) => {
  const result = await dbClient('audio').insert(
    {
      name: file.name,
      path: file.uri,
      source: 'Dropbox',
      created_at: new Date().toISOString(),
    },
    ['id']
  )

  return result[0].id
}
