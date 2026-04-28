import React, { useEffect } from 'react'

import { ListItem, ScreenLayout } from 'design'

import { ScreenPropsT } from 'App'

import * as DocumentPicker from 'expo-document-picker'
import { useQueryClient } from '@tanstack/react-query'
import useDropBoxAuth from 'hooks/useDropboxAuth'
import { getFolderContents } from 'api/dropboxClient'
import { saveFileToDirectory } from 'api/filesystemClient'
import { addICloudAudioFile } from 'api/db/audio'

export type PropsT = ScreenPropsT<'SelectSource'>

const SOURCES = {
  iCloud: { name: 'File System', icon: 'folder-open', enabled: true },
  Dropbox: { name: 'Dropbox', icon: 'dropbox', enabled: true },
  Video: { name: 'Extract from video', icon: 'file-video', enabled: false },
  Spotify: { name: 'Spotify', icon: 'spotify', enabled: false },
  YT: { name: 'YT Music', icon: 'youtube', enabled: false },
  Apple: { name: 'Apple Music', icon: 'apple', enabled: false },
} as const

const SelectSource = (props: PropsT) => {
  const queryClient = useQueryClient()

  const { authenticate } = useDropBoxAuth({
    onCheckAuth: async (authenticated) => {
      if (authenticated) {
        if (!queryClient.getQueryData(['dropbox-contents', ''])) {
          await queryClient.prefetchQuery({
            queryKey: ['dropbox-contents', ''],
            queryFn: () => getFolderContents(''),
          })
        }
        props.navigation.push('DropboxNavigator', { path: '', name: 'Home' })
      }
    },
  })

  useEffect(() => {
    props.navigation.setOptions({ headerTitle: 'Select Source' })
  }, [])

  const handlePress = async (source: keyof typeof SOURCES) => {
    switch (source) {
      case 'iCloud': {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'audio/*',
        })
        if (result.assets?.[0]) {
          const file = await saveFileToDirectory(result.assets[0])
          const audioId = await addICloudAudioFile(file)
          props.navigation.replace('Player', {
            musicData: { ...result.assets[0], id: audioId },
          })
        }
        break
      }
      case 'Dropbox':
        authenticate()
        break
      default:
        break
    }
  }

  return (
    <ScreenLayout>
      {Object.entries(SOURCES).map(([_key, value]) => {
        const key = _key as keyof typeof SOURCES
        return (
          <ListItem
            key={key}
            leftIcon={value.icon}
            title={value.name}
            subtitle={value.enabled ? undefined : 'Coming soon'}
            disabled={!value.enabled}
            showChevron={value.enabled}
            onPress={value.enabled ? () => handlePress(key) : undefined}
          />
        )
      })}
    </ScreenLayout>
  )
}

export default SelectSource
