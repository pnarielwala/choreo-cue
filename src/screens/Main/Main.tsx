import React, { useEffect, useRef } from 'react'
import {
  View,
  Image,
  Pressable,
  ScrollView,
  Text,
  Button,
  BottomSheet,
  Input,
  ListItem,
  ScreenLayout,
  SectionHeader,
  useTheme,
} from 'design'

import * as Updates from 'expo-updates'

import { FontAwesome5 } from '@expo/vector-icons'

import { useQuery } from '@tanstack/react-query'
import { ScreenPropsT } from 'App'
import { deleteAudioFile, getAudioFiles, updateAudioName } from 'api/db/audio'
import {
  Alert,
  NativeSyntheticEvent,
  Platform,
  TextInputChangeEventData,
} from 'react-native'
import analytics from 'resources/analytics'
import useIsScreenActive from 'hooks/useIsScreenActive'

export type PropsT = ScreenPropsT<'Home'>

const Main = (props: PropsT) => {
  const isScreenActive = useIsScreenActive({
    navigation: props.navigation,
  })
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>
  const listRef = useRef<{
    scrollTo: (opts: { y: number; animated?: boolean }) => void
  }>(null)

  useEffect(() => {
    if (isScreenActive) {
      analytics.info('Screen viewed', {
        screen: 'Main',
      })
    }
  }, [isScreenActive])

  useEffect(() => {
    if (__DEV__) return
    Updates.checkForUpdateAsync().catch(() => {
      // Best-effort; ignore failures so a flaky update channel can't break the app.
    })
  }, [])

  const { data, refetch } = useQuery({
    queryKey: ['audio-files'],
    queryFn: getAudioFiles,
  })

  const projects = data ?? []

  useEffect(() => {
    if (isScreenActive) {
      refetch()
    }
  }, [isScreenActive])

  const displayResetConfirmation = (audioId: number) =>
    Alert.alert(
      'Delete project?',
      'This will also delete the configured cues.',
      [
        { text: 'Cancel', style: 'cancel' },
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

  const [renameTarget, setRenameTarget] = React.useState<{
    id: number
    name: string
  } | null>(null)
  const [renameValue, setRenameValue] = React.useState('')

  const openRename = (project: { id: number; name: string }) => {
    setRenameTarget(project)
    setRenameValue(project.name)
  }

  const closeRename = () => {
    setRenameTarget(null)
  }

  const onRenameValueChange = (
    event: NativeSyntheticEvent<TextInputChangeEventData>
  ) => {
    setRenameValue(event.nativeEvent.text)
  }

  const onSaveRename = async () => {
    if (!renameTarget) return
    await updateAudioName(renameTarget.id, renameValue)
    await refetch()
    closeRename()
  }

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => props.navigation.push('Settings')}
          hitSlop={16}
          accessibilityLabel="Settings"
        >
          <FontAwesome5 name="cog" size={22} color={colors.text} />
        </Pressable>
      ),
      headerTitle: Platform.OS === 'android' ? '' : 'Home',
    })
  }, [colors.text])

  return (
    <>
      <ScreenLayout>
        <Image
          resizeMode="contain"
          sx={{
            height: 50,
            width: 'auto',
            mt: 4,
          }}
          source={require('assets/logo.png')}
          testID="logo-image"
        />

        <View sx={{ mt: 6 }}>
          <Button
            variant="primary"
            size="lg"
            leadingIcon="plus"
            onPress={() => props.navigation.push('SelectSource')}
            testID="title"
            fullWidth
          >
            Create new project
          </Button>
        </View>

        <SectionHeader id="projects-list">Recent Projects</SectionHeader>

        <ScrollView
          // @ts-ignore — dripsy forwards ref to the underlying RN ScrollView
          ref={listRef}
          sx={{ flex: 1 }}
          contentContainerSx={{ pb: 4 }}
          role="list"
          aria-labelledby="projects-list"
          accessible
          showsVerticalScrollIndicator={false}
        >
          {projects.map((project) => (
            <ListItem
              key={project.id}
              title={project.name}
              onPress={() => {
                listRef.current?.scrollTo({ y: 0, animated: false })
                props.navigation.push('Player', {
                  musicData: {
                    uri: project.uri,
                    name: project.name,
                    id: project.id,
                    source: project.source,
                  },
                })
              }}
              role="listitem"
              rightSlot={
                <View
                  sx={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                >
                  <Pressable
                    onPress={() =>
                      openRename({ id: project.id, name: project.name })
                    }
                    hitSlop={16}
                    accessibilityLabel={`Rename ${project.name}`}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 'pill',
                      backgroundColor: 'surfaceMuted',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesome5
                      name="pencil-alt"
                      size={14}
                      color={colors.text}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => displayResetConfirmation(project.id)}
                    hitSlop={16}
                    accessibilityLabel={`Delete ${project.name}`}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 'pill',
                      backgroundColor: 'surfaceMuted',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesome5
                      name="trash-alt"
                      size={16}
                      color={colors.danger}
                    />
                  </Pressable>
                </View>
              }
            />
          ))}
          {projects.length === 0 && (
            <View
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                mt: 5,
              }}
            >
              <Text sx={{ color: 'textMuted', fontSize: 16 }}>
                No projects yet
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenLayout>

      <BottomSheet
        isVisible={renameTarget !== null}
        onClose={closeRename}
        title="Rename audio"
      >
        <Input
          placeholder="New name"
          value={renameValue}
          onChange={onRenameValueChange}
        />
        <View
          sx={{
            flexDirection: 'row',
            mt: 3,
            justifyContent: 'flex-end',
            gap: 3,
          }}
        >
          <Button variant="ghost" size="sm" onPress={closeRename}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onPress={onSaveRename}>
            Save
          </Button>
        </View>
      </BottomSheet>
    </>
  )
}

export default Main
