import React, { Fragment, useEffect, useState } from 'react'
import {
  View,
  Image,
  SafeAreaView,
  Pressable,
  Icon,
  Text,
  Box,
  useSx,
} from 'design'

import * as Updates from 'expo-updates'

import Dropbox from 'assets/dropbox.svg'
import iCloud from 'assets/icloud.svg'

import { FontAwesome5 } from '@expo/vector-icons'

import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'

import { getFolderContents } from 'api/dropboxClient'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ScreenPropsT } from 'App'
import useDropBoxAuth from 'hooks/useDropboxAuth'
import { Divider, Dialog } from 'react-native-elements'
import { deleteAudioFile, getAudioFiles } from 'api/db/audio'
import { Alert } from 'react-native'

export type PropsT = ScreenPropsT<'Home'>

const Main = (props: PropsT) => {
  const queryClient = useQueryClient()
  const {
    currentlyRunning,
    isUpdatePending,
    downloadError,
    checkError,
    initializationError,
  } = Updates.useUpdates()
  const sx = useSx()

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

  const [isInfoShown, setIsInfoShown] = useState(false)

  useEffect(() => {
    Updates.checkForUpdateAsync()
  }, [])
  const [isActiveScreen, setIsActiveScreen] = React.useState(false)

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      setIsActiveScreen(true)
    })

    return unsubscribe
  }, [props.navigation])

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('blur', () => {
      setIsActiveScreen(false)
    })

    return unsubscribe
  }, [props.navigation])

  const { data, error, refetch } = useQuery({
    queryKey: ['audio-files'],
    queryFn: getAudioFiles,
  })

  const projects = data ?? []

  useEffect(() => {
    if (isActiveScreen) {
      refetch()
    }
  }, [isActiveScreen])

  const displayResetConfirmation = (audioId: number) =>
    Alert.alert(
      'Delete project?',
      'This will also delete the configured cues.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAudioFile(audioId)
            await refetch()
          },
        },
      ]
    )

  useEffect(() => {
    props.navigation.setOptions({
      headerTransparent: true,
      headerRight: () => (
        <Pressable onPress={() => setIsInfoShown(true)}>
          <FontAwesome5 name="info-circle" size={24} color="black" />
        </Pressable>
      ),
      headerTitle: 'Home',
    })
  }, [])

  return (
    <View
      sx={{
        position: 'relative',
        height: '100%',
        backgroundColor: 'background',
        flex: 1,
      }}
    >
      <Dialog isVisible={isInfoShown}>
        <View sx={{ width: '100%' }}>
          <Dialog.Title title="Version" />
          <Text variant="bodySmall">
            Runtime: {currentlyRunning.runtimeVersion}
          </Text>
          <Text variant="bodySmall">
            Channel: {currentlyRunning.channel || 'Not set'}
          </Text>
          <Text variant="bodySmall">
            Update Id: {currentlyRunning.updateId || 'Not set'}
          </Text>
          {downloadError && (
            <Text variant="bodySmall" sx={{ color: 'red' }}>
              Error downloading update: {downloadError.message}
            </Text>
          )}
          {checkError && (
            <Text variant="bodySmall" sx={{ color: 'red' }}>
              Error checking for update: {checkError.message}
            </Text>
          )}
          {initializationError && (
            <Text variant="bodySmall" sx={{ color: 'red' }}>
              Error initializing updates: {initializationError.message}
            </Text>
          )}
          <View
            sx={{
              display: 'flex',
              flexDirection: 'row',
              mt: 3,
              justifyContent: 'flex-end',
              gap: 3,
            }}
          >
            {isUpdatePending ? (
              <Dialog.Button
                onPress={() => Updates.fetchUpdateAsync()}
                testID="close-info"
                title={'Reload app'}
              />
            ) : null}
            <Dialog.Button
              onPress={() => setIsInfoShown(false)}
              testID="close-info"
              title={'Close'}
            />
          </View>
        </View>
      </Dialog>
      <SafeAreaView sx={{ margin: 4 }}>
        <Image
          resizeMode="contain"
          sx={{
            height: 50,
            width: 'auto',
            marginTop: 7,
          }}
          source={require('assets/logo.png')}
          testID="logo-image"
        />
        <Pressable
          sx={{
            marginTop: 7,
            padding: 10,
            backgroundColor: 'black',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            props.navigation.push('SelectSource')
          }}
          role="button"
        >
          <Text
            sx={{
              fontSize: 24,
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
            }}
            testID="title"
          >
            Create new project
          </Text>
          <Box sx={{ px: 1 }} />
          <FontAwesome5 name="plus-circle" size={24} color="white" />
        </Pressable>
        <Text variant="h2" sx={{ marginTop: 5 }} id="projects-list" accessible>
          Recent Projects
        </Text>
        <View role="list" aria-labelledby="projects-list" accessible>
          {projects.map((project) => (
            <Fragment key={project.name}>
              <Pressable
                onPress={() => {
                  props.navigation.push('Player', {
                    musicData: {
                      uri: project.uri,
                      name: project.name,
                      id: project.id,
                    },
                  })
                }}
                sx={{
                  py: 4,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                role="listitem"
              >
                <Text
                  sx={{
                    color: 'text',
                    fontSize: 16,
                    flex: 1,
                  }}
                >
                  {project.name}
                </Text>

                <Pressable hitSlop={48}>
                  <FontAwesome5
                    name="trash-alt"
                    size={24}
                    style={sx({ color: 'red' })}
                    onPress={() => displayResetConfirmation(project.id)}
                  />
                </Pressable>
              </Pressable>
              <Divider />
            </Fragment>
          ))}
          {projects.length === 0 && (
            <View
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 5,
              }}
            >
              <Text
                sx={{
                  color: 'text',
                  fontSize: 16,
                }}
              >
                No projects yet
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  )
}

export default Main
