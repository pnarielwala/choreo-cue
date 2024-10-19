import { DropboxFileT, DropboxFolderT } from 'types/Dropbox'
import { faker } from '@faker-js/faker'

const baseDropboxEntryFile: DropboxFileT = {
  '.tag': 'file',
  content_hash: faker.string.alphanumeric(25),
  id: faker.string.uuid(),
  is_downloadable: true,
  name: 'Hello world.txt',
  path_display: '/Hello world.txt',
  size: '325',
}

export const aDropboxEntryFile = (override: Partial<DropboxFileT> = {}) => ({
  ...baseDropboxEntryFile,
  content_hash: faker.string.alphanumeric(25),
  id: faker.string.uuid(),
  ...override,
})

const baseDropboxEntryFolder: DropboxFolderT = {
  '.tag': 'folder',
  id: faker.string.uuid(),
  name: 'Public',
  path_display: '/Public',
}

export const aDropboxEntryFolder = (
  override: Partial<DropboxFolderT> = {}
) => ({
  ...baseDropboxEntryFolder,
  id: faker.string.uuid(),
  ...override,
})
