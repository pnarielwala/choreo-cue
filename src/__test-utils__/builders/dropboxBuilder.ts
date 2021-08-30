import { DropboxFileT, DropboxFolderT } from 'types/Dropbox';
import { random, datatype } from 'faker';

const baseDropboxEntryFile: DropboxFileT = {
  '.tag': 'file',
  content_hash: random.alphaNumeric(25),
  id: datatype.uuid(),
  is_downloadable: true,
  name: 'Hello world.txt',
  path_display: '/Hello world.txt',
  size: '325',
};

export const aDropboxEntryFile = (override: Partial<DropboxFileT> = {}) => ({
  ...baseDropboxEntryFile,
  content_hash: random.alphaNumeric(25),
  id: datatype.uuid(),
  ...override,
});

const baseDropboxEntryFolder: DropboxFolderT = {
  '.tag': 'folder',
  id: datatype.uuid(),
  name: 'Hello world.txt',
  path_display: '/Hello world.txt',
};

export const aDropboxEntryFolder = (
  override: Partial<DropboxFolderT> = {},
) => ({
  ...baseDropboxEntryFile,
  id: datatype.uuid(),
  ...override,
});
