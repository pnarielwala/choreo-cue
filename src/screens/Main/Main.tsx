import React, { Fragment, useEffect, useState } from 'react'
import {
  View,
  Image,
  SafeAreaView,
  Pressable,
  Text,
  Box,
  useSx,
  ScrollView,
} from 'design'

import * as Updates from 'expo-updates'
import Constants from 'expo-constants'

import { FontAwesome5 } from '@expo/vector-icons'

import { useQuery } from '@tanstack/react-query'
import { ScreenPropsT } from 'App'
import { Divider, Dialog } from 'react-native-elements'
import { deleteAudioFile, getAudioFiles } from 'api/db/audio'
import { Alert } from 'react-native'
import useSpotifyAuth from 'hooks/useSpotifyAuth'
import { SOURCES } from 'constants/audio.constants'

export type PropsT = ScreenPropsT<'Home'>

const Main = (props: PropsT) => {
  const {
    currentlyRunning,
    isUpdatePending,
    downloadError,
    checkError,
    initializationError,
  } = Updates.useUpdates()
  const sx = useSx()

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

  const { data, refetch } = useQuery({
    queryKey: ['audio-files'],
    queryFn: getAudioFiles,
  })

  const projects = data ?? []

  useEffect(() => {
    if (isActiveScreen) {
      refetch()
    }
  }, [isActiveScreen, refetch])

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
  }, [props.navigation])

  const { authenticate: authenticateSpotify } = useSpotifyAuth()

  const onAudioFileSelected = async (data: {
    type: string
    uri: string
    name: string
    id: number
  }) => {
    if (data.type === 'iCloud' || data.type === 'Dropbox') {
      props.navigation.push('Player', {
        musicData: data,
      })
    } else if (data.type === 'Spotify') {
      const type = await authenticateSpotify()
      if (type === 'success') {
        props.navigation.push('Player', {
          musicData: data,
        })
      }
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
      <Dialog isVisible={isInfoShown}>
        <View sx={{ width: '100%' }}>
          <Dialog.Title title="Version" />
          <Text variant="bodySmall" selectable>
            Runtime: {currentlyRunning.runtimeVersion}
          </Text>
          <Text variant="bodySmall" selectable>
            Channel: {currentlyRunning.channel || 'Not set'}
          </Text>
          <Text variant="bodySmall" selectable>
            Update group id:{' '}
            {Constants.manifest2?.metadata?.['updateGroup'] || 'Not set'}
          </Text>
          <Text variant="bodySmall" selectable>
            Update Id: {currentlyRunning.updateId || 'Not set'}
          </Text>
          {downloadError && (
            <Text variant="bodySmall" sx={{ color: 'red' }} selectable>
              Error downloading update: {downloadError.message}
            </Text>
          )}
          {checkError && (
            <Text variant="bodySmall" sx={{ color: 'red' }} selectable>
              Error checking for update: {checkError.message}
            </Text>
          )}
          {initializationError && (
            <Text variant="bodySmall" sx={{ color: 'red' }} selectable>
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
        <ScrollView
          role="list"
          aria-labelledby="projects-list"
          accessible
          showsVerticalScrollIndicator={false}
        >
          {projects.map((project) => (
            <Fragment key={project.name}>
              <Pressable
                onPress={async () => {
                  await onAudioFileSelected({
                    type: project.source,
                    uri: project.uri,
                    name: project.name,
                    id: project.id,
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
                <Box
                  sx={{
                    width: 32,
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: 2,
                  }}
                >
                  <FontAwesome5
                    name={SOURCES[project.source].icon}
                    size={24}
                    style={sx({ color: 'text' })}
                  />
                </Box>
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
          <View sx={{ height: 300 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

export default Main
