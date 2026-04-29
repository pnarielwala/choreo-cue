import dbClient from './client'

import * as DocumentPicker from 'expo-document-picker'
import { File } from 'expo-file-system'

export type AudioSource = 'iCloud' | 'Dropbox' | 'Spotify' | 'YT' | 'Apple'

export type AudioRecord = {
  id: number
  name: string
  uri: string
  source: AudioSource
}

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

export const getAudioFiles = async (): Promise<AudioRecord[]> => {
  // Most recently opened first; brand-new files inherit their created_at as
  // their last_opened_at, so they show up at the top until something else is opened.
  const results = await dbClient('audio')
    .select('*')
    .orderBy('last_opened_at', 'desc')
  return (results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    uri: result.path,
    source: result.source as AudioSource,
  }))
}

export const touchAudioFile = async (id: number) => {
  await dbClient('audio')
    .where({ id })
    .update({ last_opened_at: new Date().toISOString() })
}

export const updateAudioName = async (id: number, name: string) => {
  await dbClient('audio').where({ id }).update({ name })
}

export const getAudioFile = async (id: number): Promise<AudioRecord | null> => {
  const result = await dbClient('audio').where({ id }).first()

  if (!result) {
    return null
  }
  return {
    id: result.id,
    name: result.name,
    uri: result.path,
    source: result.source as AudioSource,
  }
}

export const deleteAudioFile = async (id: number) => {
  const audioFile = await getAudioFile(id)
  if (!audioFile) {
    return
  }
  const { uri, source } = audioFile
  await dbClient('audio').where({ id }).del()
  await dbClient('cues').where({ audio_id: id }).del()
  // Only iCloud/Dropbox sources have a local file on disk to clean up.
  if (source === 'iCloud' || source === 'Dropbox') {
    const file = new File(uri)
    file.delete()
  }
}

export const addICloudAudioFile = async (
  file: DocumentPicker.DocumentPickerAsset
) => {
  const now = new Date().toISOString()
  const result = await dbClient('audio').insert(
    {
      name: file.name,
      path: file.uri,
      source: 'iCloud',
      created_at: now,
      last_opened_at: now,
    },
    ['id']
  )

  return result[0].id
}

export const addDropboxAudioFile = async (file: {
  name: string
  uri: string
}) => {
  const now = new Date().toISOString()
  const result = await dbClient('audio').insert(
    {
      name: file.name,
      path: file.uri,
      source: 'Dropbox',
      created_at: now,
      last_opened_at: now,
    },
    ['id']
  )

  return result[0].id
}

export const addSpotifyAudioFile = async (track: {
  name: string
  uri: string
}) => {
  const now = new Date().toISOString()
  const result = await dbClient('audio').insert(
    {
      name: track.name,
      path: track.uri,
      source: 'Spotify',
      created_at: now,
      last_opened_at: now,
    },
    ['id']
  )

  return result[0].id
}
