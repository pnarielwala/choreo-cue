import React, { Fragment, useEffect } from 'react'

import { View, Text, SafeAreaView, useSx } from 'design'

import { ScreenPropsT } from 'App'
import { Box, Pressable } from 'design'
import { Divider } from 'react-native-elements'
import { FontAwesome5 } from '@expo/vector-icons'

import * as DocumentPicker from 'expo-document-picker'
import { useQueryClient } from '@tanstack/react-query'
import useDropBoxAuth from 'hooks/useDropboxAuth'
import { getFolderContents } from 'api/dropboxClient'
import { saveFileToDirectory } from 'api/filesystemClient'
import { addICloudAudioFile } from 'api/db/audio'

export type PropsT = ScreenPropsT<'SelectSource'>

const SOURCES = {
  iCloud: {
    name: 'File System',
    icon: 'folder-open',
    enabled: true,
  },
  Dropbox: {
    name: 'Dropbox',
    icon: 'dropbox',
    enabled: true,
  },
  Video: {
    name: 'Extract from video',
    icon: 'file-video',
    enabled: false,
  },
  Spotify: {
    name: 'Spotify',
    icon: 'spotify',
    enabled: false,
  },
  YT: {
    name: 'YT Music',
    icon: 'youtube',
    enabled: false,
  },
  Apple: {
    name: 'Apple Music',
    icon: 'apple',
    enabled: false,
  },
} as const

const SelectSource = (props: PropsT) => {
  const sx = useSx()
  const queryClient = useQueryClient()

  const { authenticate } = useDropBoxAuth({
    onCheckAuth: async (authenticated) => {
      if (authenticated) {
        if (!queryClient.getQueryData(['dropbox-contents', ''])) {
          await queryClient.prefetchQuery({
            queryKey: ['dropbox-contents', ''],
            queryFn: () => getFolderContents(''),
          })

          await queryClient.prefetchQuery({
            queryKey: ['dropbox-contents', ''],
            queryFn: () => getFolderContents(''),
          })
        }
        props.navigation.push('DropboxNavigator', {
          path: '',
          name: 'Home',
        })
      }
    },
  })

  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: 'Select Source',
    })
  }, [])

  const handlePress = async (source: keyof typeof SOURCES) => {
    switch (source) {
      case 'iCloud':
        const result = await DocumentPicker.getDocumentAsync({
          type: 'audio/*',
        })
        if (result.assets?.[0]) {
          // copy file to document directory
          const file = await saveFileToDirectory(result.assets[0])
          const audioId = await addICloudAudioFile(file)

          // navigate to player screen
          props.navigation.replace('Player', {
            musicData: { ...result.assets[0], id: audioId },
          })
        }
        break
      case 'Dropbox':
        authenticate()
        break
      default:
        break
    }
  }
  return (
    <View
      sx={{
        position: 'relative',
        height: '100%',
        backgroundColor: 'background',
        flex: 1,
      }}
    >
      <SafeAreaView sx={{ margin: 4 }}>
        {Object.entries(SOURCES).map(([_key, value]) => {
          const key = _key as keyof typeof SOURCES
          return (
            <Fragment key={key}>
              <Pressable
                key={key}
                sx={{
                  py: 4,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
                disabled={!value.enabled}
                onPress={() => handlePress(key)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesome5
                      name={value.icon}
                      size={24}
                      style={sx({ color: value.enabled ? 'text' : 'muted' })}
                    />
                  </Box>
                  <Text sx={{ color: value.enabled ? 'text' : 'muted' }}>
                    {`${value.name}${value.enabled ? '' : ' (coming soon)'}`}
                  </Text>
                </Box>
                {value.enabled && (
                  <FontAwesome5
                    name="chevron-right"
                    size={24}
                    style={sx({ color: 'text' })}
                  />
                )}
              </Pressable>
              <Divider key={`${key}-divider`} />
            </Fragment>
          )
        })}
      </SafeAreaView>
    </View>
  )
}

export default SelectSource
