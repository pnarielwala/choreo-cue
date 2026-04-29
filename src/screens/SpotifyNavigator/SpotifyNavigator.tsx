import React, { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AntDesign } from '@expo/vector-icons'
import debounce from 'lodash/debounce'

import {
  Flex,
  Box,
  Text,
  ScrollView,
  Pressable,
  Input,
  ButtonGroup,
  ListItem,
} from 'design'
import { H1, View } from 'dripsy'

import Spinner from 'react-native-loading-spinner-overlay'

import {
  searchTracks,
  getUserPlaylists,
  getPlaylistTracks,
  SpotifyTrack,
  SpotifyPlaylist,
} from 'api/spotifyClient'
import { addSpotifyAudioFile } from 'api/db/audio'
import { ScreenPropsT } from 'App'
import analytics from 'resources/analytics'

export type PropsT = ScreenPropsT<'SpotifyNavigator'>

type Tab = 'Search' | 'Playlists'

type View =
  | { kind: 'tabs' }
  | { kind: 'playlist-tracks'; playlist: SpotifyPlaylist }

const SpotifyNavigator = (props: PropsT) => {
  const [tab, setTab] = useState<Tab>('Search')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [stack, setStack] = useState<View[]>([{ kind: 'tabs' }])
  const top = stack[stack.length - 1]

  useEffect(() => {
    const handler = debounce((q: string) => setSearchQuery(q), 300)
    handler(searchInput)
    return () => handler.cancel()
  }, [searchInput])

  useEffect(() => {
    const isFirstPage = top.kind === 'tabs'
    props.navigation.setOptions({
      headerLeft: !isFirstPage
        ? () => (
            <Pressable
              onPress={() => setStack((s) => s.slice(0, -1))}
              hitSlop={48}
              accessibilityLabel="Back"
              sx={{ mt: 2 }}
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
  }, [stack, top])

  const { data: searchResults = [], isFetching: searching } = useQuery({
    queryKey: ['spotify-search', searchQuery],
    queryFn: () => searchTracks(searchQuery),
    enabled: tab === 'Search' && searchQuery.length > 0,
  })

  const { data: playlists = [], isLoading: loadingPlaylists } = useQuery({
    queryKey: ['spotify-playlists'],
    queryFn: () => getUserPlaylists(),
    enabled: tab === 'Playlists' && top.kind === 'tabs',
  })

  const playlistId =
    top.kind === 'playlist-tracks' ? top.playlist.id : undefined
  const { data: playlistTracks = [], isLoading: loadingPlaylistTracks } =
    useQuery({
      queryKey: ['spotify-playlist-tracks', playlistId],
      queryFn: () => getPlaylistTracks(playlistId as string),
      enabled: !!playlistId,
    })

  const { mutate: pickTrack, isPending: saving } = useMutation({
    mutationFn: async (track: SpotifyTrack) => {
      const fullName = `${track.name} — ${track.artists
        .map((a) => a.name)
        .join(', ')}`
      const id = await addSpotifyAudioFile({
        name: fullName,
        uri: track.uri,
      })
      return { track, id, fullName }
    },
    onSuccess: ({ track, id, fullName }) => {
      if (props.navigation.canGoBack()) {
        props.navigation.popToTop()
      }
      props.navigation.push('Player', {
        musicData: {
          id,
          name: fullName,
          uri: track.uri,
          source: 'Spotify',
        },
      })
    },
    onError: (error) => {
      analytics.error('[Spotify] failed to import track', error as any)
      Alert.alert('Error', 'Could not import this track. Please try again.')
    },
  })

  const renderTracks = (tracks: SpotifyTrack[]) => (
    <Box>
      {tracks.map((track) => (
        <ListItem
          key={track.id}
          title={track.name}
          subtitle={track.artists.map((a) => a.name).join(', ')}
          onPress={() => pickTrack(track)}
          showChevron
        />
      ))}
    </Box>
  )

  const renderTabsView = () => (
    <>
      <Box sx={{ mt: 3 }}>
        <ButtonGroup
          buttons={['Search', 'Playlists']}
          selectedButton={tab}
          onPress={(b) => setTab(b as Tab)}
        />
      </Box>
      {tab === 'Search' ? (
        <>
          <Box sx={{ mt: 3 }}>
            <Input
              testID="spotify-search-input"
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Search tracks…"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </Box>
          {searchQuery.length === 0 ? (
            <Text variant="bodySmall" sx={{ mt: 4, textAlign: 'center' }}>
              Type to search for songs.
            </Text>
          ) : (
            <Box sx={{ mt: 3 }}>
              {searching && searchResults.length === 0 && (
                <Text
                  variant="bodySmall"
                  sx={{ textAlign: 'center', color: 'textMuted', mb: 2 }}
                >
                  Searching…
                </Text>
              )}
              {renderTracks(searchResults)}
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ mt: 3 }}>
          {loadingPlaylists && playlists.length === 0 && (
            <Text
              variant="bodySmall"
              sx={{ textAlign: 'center', color: 'textMuted', mb: 2 }}
            >
              Loading playlists…
            </Text>
          )}
          {playlists.map((p) => (
            <ListItem
              key={p.id}
              title={p.name}
              subtitle={`${p.tracks.total} tracks · ${p.owner.display_name}`}
              onPress={() =>
                setStack((s) => [
                  ...s,
                  { kind: 'playlist-tracks', playlist: p },
                ])
              }
              showChevron
            />
          ))}
        </Box>
      )}
    </>
  )

  const renderPlaylistTracks = (playlist: SpotifyPlaylist) => (
    <>
      <H1 as={Text} sx={{ mt: 3 }}>
        {playlist.name}
      </H1>
      <Box sx={{ mt: 3 }}>
        {loadingPlaylistTracks && playlistTracks.length === 0 && (
          <Text
            variant="bodySmall"
            sx={{ textAlign: 'center', color: 'textMuted', mb: 2 }}
          >
            Loading tracks…
          </Text>
        )}
        {renderTracks(playlistTracks)}
      </Box>
    </>
  )

  return (
    <View sx={{ bg: 'background', height: '100%' }}>
      <Box sx={{ height: '100%', mx: 3, pb: 6 }}>
        <Flex sx={{ alignItems: 'center', flexDirection: 'column' }}>
          <Text>Spotify</Text>
        </Flex>
        <Box
          sx={{
            height: 3,
            backgroundColor: 'divider',
            borderRadius: 8,
            mt: 2,
          }}
        />
        <ScrollView
          bounces
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {top.kind === 'tabs' && renderTabsView()}
          {top.kind === 'playlist-tracks' && renderPlaylistTracks(top.playlist)}
        </ScrollView>
      </Box>
      {/* Only block the screen for the action that immediately navigates
          away (saving a picked track). Read-loads use inline indicators so
          the user can keep typing in the search field. */}
      <Spinner visible={saving} />
    </View>
  )
}

export default SpotifyNavigator
