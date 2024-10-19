import axios, { AxiosResponse } from 'axios'
import * as FileSystem from 'expo-file-system'
import { DropboxEntryT } from 'types/Dropbox'

const dropboxClient = axios.create({
  baseURL: 'https://api.dropboxapi.com/2',
})

const dropboxDownloadClient = axios.create({
  baseURL: 'https://content.dropboxapi.com/2',
})

export const dropboxAddAuth = (access_token: string) => {
  dropboxClient.defaults.headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  } as any
  dropboxDownloadClient.defaults.headers = {
    Authorization: `Bearer ${access_token}`,
  } as any
}

export const checkDropboxAuth = async () =>
  await dropboxClient.post('/check/user', {})

export const downloadFile = async (params: {
  path: string
  name: string
}): Promise<{ name: string; uri: string } | undefined> => {
  const { name, path } = params
  const results = await FileSystem.getInfoAsync(
    String(FileSystem.documentDirectory)
  )

  if (results.isDirectory) {
    const contents = await FileSystem.readDirectoryAsync(
      String(FileSystem.documentDirectory)
    )

    const promises = contents.map((fileName) =>
      FileSystem.deleteAsync(FileSystem.documentDirectory + encodeURI(fileName))
    )
    await Promise.all(promises)
  }
  if (results.exists) {
    const headers = {
      Authorization: dropboxClient.defaults.headers.Authorization,
      'Dropbox-API-Arg': JSON.stringify({ path }),
    } as Record<string, string>

    const dlResults = await FileSystem.downloadAsync(
      'https://content.dropboxapi.com/2/files/download',
      FileSystem.documentDirectory + encodeURI(name),
      {
        headers,
      }
    )

    return { name, uri: dlResults.uri }
  }
}

export const getFolderContents = async (
  path: string
): Promise<
  AxiosResponse<{
    cursor: string
    entries: Array<DropboxEntryT>
    has_more: boolean
  }>
> =>
  await dropboxClient.post('/files/list_folder', {
    path,
    recursive: false,
    include_deleted: false,
    include_has_explicit_shared_members: false,
    include_mounted_folders: true,
    include_non_downloadable_files: true,
  })
