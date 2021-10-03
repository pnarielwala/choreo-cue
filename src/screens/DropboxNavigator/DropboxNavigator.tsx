import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useMutation, useQuery } from 'react-query'

import {
  SafeAreaView,
  Flex,
  Box,
  Text,
  H1,
  Icon,
  ScrollView,
  Pressable,
} from 'design'
import Folder from 'assets/folder.svg'
import File from 'assets/file.svg'
import Close from 'assets/xmark.svg'
import LeftArrow from 'assets/left_arrow.svg'

import Spinner from 'react-native-loading-spinner-overlay'

import { downloadFile, getFolderContents } from 'api/dropboxClient'

import { ScreenPropsT } from 'App'
import { DropboxEntryT } from 'types/Dropbox'

export type PropsT = ScreenPropsT<'DropboxNavigator'>

const DropboxNavigator = (props: PropsT) => {
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
            >
              <Icon
                as={LeftArrow}
                width={24}
                height={24}
                sx={{
                  position: 'absolute',
                  left: 0,
                  ml: 4,
                  color: 'secondary',
                }}
              />
            </Pressable>
          )
        : () => null,
      headerRight: () => (
        <Pressable
          onPress={() => props.navigation.goBack()}
          hitSlop={48}
          accessibilityLabel="Close"
        >
          <Icon
            as={Close}
            width={24}
            height={24}
            sx={{
              position: 'absolute',
              right: 0,
              mr: 4,
            }}
          />
        </Pressable>
      ),
    })
  }, [paramsQueue, path, popParams])

  const { data } = useQuery(['dropbox-contents', path], () =>
    getFolderContents(path)
  )

  const { mutate: doDownloadFile, isLoading } = useMutation(downloadFile, {
    onSuccess: (response) => {
      if (response) {
        if (props.navigation.canGoBack()) {
          props.navigation.popToTop()
        }
        props.navigation.push('Player', {
          musicData: {
            name: response.name,
            uri: response.uri,
          },
        })
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
    <SafeAreaView
      sx={{
        bg: 'white',
      }}
    >
      <Box sx={{ height: '100%', mx: 2, mt: 6 }}>
        <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
          <Text>Dropbox</Text>
          <H1 sx={{ mt: 3 }}>{folderName}</H1>
        </Flex>
        <Box
          sx={{
            height: 3,
            backgroundColor: 'divider',
            borderRadius: 8,
            mx: 3,
            mt: 2,
          }}
        />
        <ScrollView bounces showsVerticalScrollIndicator={false}>
          <Flex sx={{ flexWrap: 'wrap' }}>
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
                      <Icon
                        as={File}
                        width={64}
                        height={64}
                        sx={{
                          color: isDownloadable ? 'primary' : 'muted',
                        }}
                      />
                      <Text
                        variant="bodySmall"
                        sx={{
                          textAlign: 'center',
                          mt: 2,
                          color: isDownloadable ? 'text' : 'muted',
                        }}
                      >
                        {entry.name}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Icon as={Folder} width={64} height={64} fill="orange" />
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
    </SafeAreaView>
  )
}

export default DropboxNavigator
