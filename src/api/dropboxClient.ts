import axios, { AxiosResponse } from 'axios';

const dropboxClient = axios.create({
  baseURL: 'https://api.dropboxapi.com/2',
});

export const dropboxAddAuth = (access_token: string) => {
  dropboxClient.defaults.headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  };
};

export const checkDropboxAuth = async () =>
  await dropboxClient.post('/check/user', {});

export const getFolderContents = async (
  path: string,
): Promise<
  AxiosResponse<{
    cursor: string;
    entries: Array<{
      '.tag': 'folder' | 'file';
      id: string;
      name: string;
      path_display: string;
    }>;
    has_more: boolean;
  }>
> =>
  await dropboxClient.post('/files/list_folder', {
    path,
    recursive: false,
    include_deleted: false,
    include_has_explicit_shared_members: false,
    include_mounted_folders: true,
    include_non_downloadable_files: true,
  });
