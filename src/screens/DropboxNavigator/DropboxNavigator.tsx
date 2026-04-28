import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useMutation, useQuery } from '@tanstack/react-query'

import { AntDesign } from '@expo/vector-icons'

import { Flex, Box, Text, ScrollView, Pressable } from 'design'
import { H1, useSx, View } from 'dripsy'

import Spinner from 'react-native-loading-spinner-overlay'

import { downloadFile, getFolderContents } from 'api/dropboxClient'

import { ScreenPropsT } from 'App'
import { DropboxEntryT } from 'types/Dropbox'
import { saveFileToDirectory } from 'api/filesystemClient'
import { addDropboxAudioFile, addICloudAudioFile } from 'api/db/audio'
import analytics from 'resources/analytics'

export type PropsT = ScreenPropsT<'DropboxNavigator'>

const DropboxNavigator = (props: PropsT) => {
  const sx = useSx()
  const [paramsQueue, setParamsQueue] = useState([props.route.params])

  const params = paramsQueue[paramsQueue.length - 1]

  const pushParams = (params: PropsT['route']['params']) =>
    setParamsQueue([...paramsQueue, params])
  const popParams = () => {
    const newParamsQueue = [...paramsQueue]
    newParamsQueue.pop()
    setParamsQueue(newParamsQueue)
  }

  const path = params.path
  const folderName = params.name

  useEffect(() => {
    const firstPage = path === ''
    props.navigation.setOptions({
      headerLeft: !firstPage
        ? () => (
            <Pressable
              onPress={() => {
                popParams()
              }}
              hitSlop={48}
              accessibilityLabel="Back"
              sx={{
                mt: 2,
              }}
            >
              <AntDesign name="arrow-left" size={24} />
            </Pressable>
          )
        : () => null,
      headerRight: () => (
        <Pressable
          onPress={() => props.navigation.goBack()}
          hitSlop={48}
          accessibilityLabel="Close"
        >
          <AntDesign name="close" size={24} />
        </Pressable>
      ),
    })
  }, [paramsQueue, path, popParams])

  const { data } = useQuery({
    queryKey: ['dropbox-contents', path],
    queryFn: () => getFolderContents(path),
  })

  const { mutate: doDownloadFile, isPending: isLoading } = useMutation({
    mutationFn: downloadFile,
    onSuccess: async (response) => {
      if (response) {
        try {
          // copy file to document directory
          const file = await saveFileToDirectory({
            name: response.name,
            uri: response.uri,
            lastModified: Date.now(),
          })

          const audioId = await addDropboxAudioFile(file)

          console.log('audioId', audioId)

          if (props.navigation.canGoBack()) {
            props.navigation.popToTop()
          }

          props.navigation.push('Player', {
            musicData: {
              name: response.name,
              uri: response.uri,
              id: audioId,
            },
          })
        } catch (error) {
          analytics.error('Error downloading dropbox file', error as any)
        }
      }
    },
  })

  const entryClick = (entry: DropboxEntryT, isDownloadable: boolean) => {
    const { path_display: path, name } = entry
    if (entry['.tag'] === 'folder') {
      pushParams({
        path,
        name,
      })
    } else {
      if (isDownloadable) {
        doDownloadFile({
          path: entry.path_display,
          name: entry.name,
        })
      } else {
        Alert.alert(
          'Unsupported file type',
          'Unable to download this file. Please select an .mp3 file'
        )
      }
    }
  }

  return (
    <View
      sx={{
        bg: 'background',
        height: '100%',
      }}
    >
      <Box sx={{ height: '100%', mx: 3, pb: 6 }}>
        <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
          <Text>Dropbox</Text>
          <H1
            as={Text}
            sx={{
              mt: 3,
            }}
          >
            {folderName}
          </H1>
        </Flex>
        <Box
          sx={{
            height: 3,
            backgroundColor: 'divider',
            borderRadius: 8,
            mt: 2,
          }}
        />
        <ScrollView bounces showsVerticalScrollIndicator={false}>
          <Flex sx={{ flexWrap: 'wrap', my: 3 }}>
            {(data?.data.entries ?? []).map((entry) => {
              const isFile = entry['.tag'] === 'file'
              const isDownloadable =
                entry['.tag'] === 'file'
                  ? /.mp3$/.test(entry.name) && entry.is_downloadable
                  : false
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => entryClick(entry, isDownloadable)}
                  testID={`clickable-${entry.name}`}
                  sx={{
                    display: 'flex',
                    my: 4,
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '33.33%',
                  }}
                >
                  {isFile ? (
                    <>
                      <AntDesign
                        name="file"
                        size={64}
                        style={sx({
                          color: isDownloadable ? 'accent' : 'textMuted',
                        })}
                      />
                      <Text
                        variant="bodySmall"
                        sx={{
                          textAlign: 'center',
                          mt: 2,
                          color: isDownloadable ? 'text' : 'textMuted',
                        }}
                      >
                        {entry.name}
                      </Text>
                    </>
                  ) : (
                    <>
                      <AntDesign
                        name="folder"
                        size={64}
                        style={sx({
                          color: 'warning',
                        })}
                      />
                      <Text
                        variant="bodySmall"
                        sx={{
                          textAlign: 'center',
                          mt: 2,
                        }}
                      >
                        {entry.name}
                      </Text>
                    </>
                  )}
                </Pressable>
              )
            })}
          </Flex>
        </ScrollView>
      </Box>
      <Spinner visible={isLoading} />
    </View>
  )
}

export default DropboxNavigator
