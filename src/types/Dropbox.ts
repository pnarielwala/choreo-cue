export type DropboxFileT = {
  '.tag': 'file';
  id: string;
  name: string;
  path_display: string;
  content_hash: string;
  size: string;
  is_downloadable: boolean;
};

export type DropboxFolderT = {
  '.tag': 'folder';
  id: string;
  name: string;
  path_display: string;
};
export type DropboxEntryT = DropboxFileT | DropboxFolderT;
