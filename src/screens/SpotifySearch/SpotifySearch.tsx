import { FontAwesome5 } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { addSpotifyAudioFile } from 'api/db/audio'
import { searchSpotifyTracks } from 'api/spotifyClient'
import { ScreenPropsT } from 'App'
import {
  View,
  Text,
  Pressable,
  Image,
  SafeAreaView,
  Input,
  ScrollView,
} from 'design'
import { Fragment, useDeferredValue, useEffect, useState } from 'react'
import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'
import { Divider } from 'react-native-elements'

export type PropsT = ScreenPropsT<'SpotifySearch'>

const SpotifySearch = (props: PropsT) => {
  const [searchInput, setSearchInput] = useState('')
  const onInputChange = (
    event: NativeSyntheticEvent<TextInputChangeEventData>
  ) => {
    setSearchInput(event.nativeEvent.text)
  }

  const deferredQuery = useDeferredValue(searchInput)

  const { data } = useQuery({
    queryKey: ['spotify-search', searchInput],
    queryFn: () => searchSpotifyTracks(deferredQuery),
    enabled: searchInput.length > 0,
  })
  const titles =
    data?.data?.tracks?.items.map((item: any) => ({
      title: item.name,
      artist: item.artists[0].name,
      album: item.album.name,
      albumId: item.album.id,
      trackNumber: item.track_number,
      albumArtUrl: item.album.images[0].url,
      id: item.id,
    })) ?? []

  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: 'Search Spotify Tracks',
    })
  }, [props.navigation])

  const selectSpotifyTrack = async (data: { name: string; uri: string }) => {
    const audioId = await addSpotifyAudioFile({
      name: data.name,
      uri: data.uri,
    })

    if (props.navigation.canGoBack()) {
      props.navigation.popToTop()
    }

    props.navigation.push('Player', {
      musicData: {
        name: data.name,
        uri: data.uri,
        id: audioId,
      },
    })
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
        <View
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          <Input
            placeholder="Search"
            value={searchInput}
            onChange={onInputChange}
            sx={{ flex: 1 }}
            autoFocus
          />
        </View>
        <ScrollView
          sx={{ overflow: 'scroll' }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {titles.map((title) => (
            <Fragment key={title.id}>
              <Pressable
                sx={{
                  my: 3,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 3,
                  alignItems: 'center',
                }}
                onPress={() =>
                  selectSpotifyTrack({
                    name: `${title.title} - ${title.artist}`,
                    uri: title.id,
                  })
                }
              >
                <Image
                  source={{ uri: title.albumArtUrl }}
                  sx={{ width: 50, height: 50 }}
                />
                <View sx={{ flex: 1 }}>
                  <Text variant="body">{title.title}</Text>
                  <Text variant="bodySmall">Song - {title.artist}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={24} color="black" />
              </Pressable>
              <Divider />
            </Fragment>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

export default SpotifySearch
