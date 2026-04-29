import React, { useEffect, useState } from 'react'
import { Alert, Linking } from 'react-native'
import { Dialog } from 'react-native-elements'

import { Button, ListItem, ScreenLayout, Text, View, useTheme } from 'design'

import { ScreenPropsT } from 'App'

import * as DocumentPicker from 'expo-document-picker'
import { useQueryClient } from '@tanstack/react-query'
import useDropBoxAuth from 'hooks/useDropboxAuth'
import useSpotifyAuth from 'hooks/useSpotifyAuth'
import { getFolderContents } from 'api/dropboxClient'
import { getUserPlaylists, getMe } from 'api/spotifyClient'
import { saveFileToDirectory } from 'api/filesystemClient'
import { addICloudAudioFile } from 'api/db/audio'
import analytics from 'resources/analytics'

const SPOTIFY_LIMITATIONS = [
  'Spotify is in developer mode - only allowlisted accounts can connect. If you get blocked, request access below.',
  'A Spotify Premium account is required for playback control.',
  'Tempo control is unavailable on Spotify tracks.',
  'Playback requires the Spotify app installed and signed in on this device.',
  'Spotify disconnects after ~5 seconds of inactivity. To resume, open the Spotify app, hit play, then return to Choreo Cue.',
]

const REQUEST_ACCESS_MAILTO =
  'mailto:pnariewlala@gmail.com' +
  '?subject=' +
  encodeURIComponent('Choreo Cue - Spotify access request') +
  '&body=' +
  encodeURIComponent(
    'Hi Parth,\n\nI would like access to the Spotify integration in Choreo Cue. My Spotify account email is: \n\nThanks!'
  )

export type PropsT = ScreenPropsT<'SelectSource'>

const SOURCES = {
  iCloud: { name: 'File System', icon: 'folder-open', enabled: true },
  Dropbox: { name: 'Dropbox', icon: 'dropbox', enabled: true },
  Spotify: { name: 'Spotify', icon: 'spotify', enabled: true },
  Video: { name: 'Extract from video', icon: 'file-video', enabled: false },
  YT: { name: 'YT Music', icon: 'youtube', enabled: false },
  Apple: { name: 'Apple Music', icon: 'apple', enabled: false },
} as const

const SelectSource = (props: PropsT) => {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>

  const [showLimitations, setShowLimitations] = useState(false)
  const [showAuthError, setShowAuthError] = useState(false)

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

  const { authenticate: authenticateSpotify } = useSpotifyAuth({
    onCheckAuth: async (result) => {
      if (!result.authenticated) {
        if (result.reason === 'error') {
          setShowAuthError(true)
        }
        return
      }
      try {
        const me = await getMe()
        if (me.product !== 'premium') {
          Alert.alert(
            'Spotify Premium required',
            'Choreo Cue needs a Spotify Premium account to control playback. You can still use other sources.'
          )
          return
        }
      } catch (e) {
        analytics.error('[Spotify] failed to fetch user profile', e as any)
      }
      if (!queryClient.getQueryData(['spotify-playlists'])) {
        queryClient.prefetchQuery({
          queryKey: ['spotify-playlists'],
          queryFn: () => getUserPlaylists(),
        })
      }
      props.navigation.push('SpotifyNavigator')
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
      case 'Spotify':
        setShowLimitations(true)
        break
      default:
        break
    }
  }

  const onContinueSpotify = () => {
    setShowLimitations(false)
    authenticateSpotify()
  }

  const onRequestAccess = () => {
    setShowAuthError(false)
    Linking.openURL(REQUEST_ACCESS_MAILTO).catch((e) => {
      analytics.error('[Spotify] failed to open mailto', e as any)
    })
  }

  return (
    <>
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

      <Dialog
        isVisible={showLimitations}
        onBackdropPress={() => setShowLimitations(false)}
        overlayStyle={{ backgroundColor: colors.surfaceElevated }}
      >
        <Dialog.Title
          title="Before you connect Spotify"
          titleStyle={{ color: colors.text }}
        />
        <Text sx={{ color: 'text', mb: 2 }}>
          Spotify support comes with some limitations:
        </Text>
        {SPOTIFY_LIMITATIONS.map((bullet, i) => (
          <View key={i} sx={{ flexDirection: 'row', mb: 2 }}>
            <Text sx={{ color: 'text', mr: 2 }}>•</Text>
            <Text sx={{ color: 'text', flex: 1 }}>{bullet}</Text>
          </View>
        ))}
        <View
          sx={{
            flexDirection: 'row',
            mt: 3,
            justifyContent: 'flex-end',
            gap: 3,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setShowLimitations(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" onPress={onContinueSpotify}>
            Continue
          </Button>
        </View>
      </Dialog>

      <Dialog
        isVisible={showAuthError}
        onBackdropPress={() => setShowAuthError(false)}
        overlayStyle={{ backgroundColor: colors.surfaceElevated }}
      >
        <Dialog.Title
          title="Couldn't connect to Spotify"
          titleStyle={{ color: colors.text }}
        />
        <Text sx={{ color: 'text', mb: 2 }}>
          Spotify rejected the sign-in. While Choreo Cue's Spotify integration
          is in developer mode, only allowlisted accounts can connect.
        </Text>
        <Text sx={{ color: 'text', mb: 2 }}>
          Tap Request access to email Parth and ask to be added to the
          allowlist.
        </Text>
        <View
          sx={{
            flexDirection: 'row',
            mt: 3,
            justifyContent: 'flex-end',
            gap: 3,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setShowAuthError(false)}
          >
            Close
          </Button>
          <Button variant="primary" size="sm" onPress={onRequestAccess}>
            Request access
          </Button>
        </View>
      </Dialog>
    </>
  )
}

export default SelectSource
