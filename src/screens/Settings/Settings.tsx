import React, { useEffect } from 'react'
import * as Updates from 'expo-updates'
import * as Application from 'expo-application'
import * as Clipboard from 'expo-clipboard'
import Constants from 'expo-constants'
import Toast from 'react-native-toast-message'

import {
  Button,
  ButtonGroup,
  ListItem,
  ScreenLayout,
  SectionHeader,
  Text,
  View,
  useThemeMode,
} from 'design'
import type { ThemeModePref } from 'design'
import { ScreenPropsT } from 'App'

export type PropsT = ScreenPropsT<'Settings'>

const MODE_LABELS: Record<ThemeModePref, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}
const MODE_OPTIONS = Object.values(MODE_LABELS)
const labelToMode = (label: string): ThemeModePref => {
  const found = (Object.entries(MODE_LABELS) as [ThemeModePref, string][]).find(
    ([, l]) => l === label
  )
  return found?.[0] ?? 'system'
}

const Settings = (props: PropsT) => {
  const { mode, setMode } = useThemeMode()
  const { currentlyRunning, isUpdatePending, downloadError, checkError } =
    Updates.useUpdates()

  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: 'Settings',
    })
  }, [])

  const versionString = `${Application.nativeApplicationVersion ?? '-'} (${
    Application.nativeBuildVersion ?? '-'
  })`

  const updateGroup = (
    Constants.manifest2?.metadata as Record<string, string> | undefined
  )?.['updateGroup']
  const updateId = currentlyRunning.updateId

  const copyToClipboard = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value)
    Toast.show({
      type: 'success',
      position: 'top',
      text1: `${label} copied`,
      visibilityTime: 1000,
    })
  }

  return (
    <ScreenLayout scroll>
      <SectionHeader>Appearance</SectionHeader>
      <View sx={{ mt: 1, mb: 3 }}>
        <ButtonGroup
          buttons={MODE_OPTIONS}
          selectedButton={MODE_LABELS[mode]}
          onPress={(label) => setMode(labelToMode(label))}
        />
      </View>

      <SectionHeader>About</SectionHeader>
      <ListItem
        leftIcon="info-circle"
        title="Version"
        subtitle={versionString}
      />
      <ListItem
        leftIcon="broadcast-tower"
        title="Channel"
        subtitle={currentlyRunning.channel || 'Not set'}
      />
      <ListItem
        leftIcon="layer-group"
        title="Update group"
        subtitle={updateGroup || 'Not set'}
        onLongPress={
          updateGroup
            ? () => copyToClipboard(updateGroup, 'Update group')
            : undefined
        }
      />
      <ListItem
        leftIcon="fingerprint"
        title="Update ID"
        subtitle={updateId || 'Not set'}
        onLongPress={
          updateId ? () => copyToClipboard(updateId, 'Update ID') : undefined
        }
        showDivider={false}
      />

      {(downloadError || checkError) && (
        <View sx={{ mt: 4, gap: 2 }}>
          <SectionHeader>Update errors</SectionHeader>
          {downloadError && (
            <Text sx={{ color: 'danger', fontSize: 14 }} selectable>
              Download: {downloadError.message}
            </Text>
          )}
          {checkError && (
            <Text sx={{ color: 'danger', fontSize: 14 }} selectable>
              Check: {checkError.message}
            </Text>
          )}
        </View>
      )}

      {isUpdatePending && (
        <View sx={{ mt: 5 }}>
          <Button
            variant="primary"
            size="lg"
            leadingIcon="redo"
            fullWidth
            onPress={() => Updates.fetchUpdateAsync()}
            testID="reload-app"
          >
            Reload to apply update
          </Button>
        </View>
      )}
    </ScreenLayout>
  )
}

export default Settings
