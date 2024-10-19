import React, { useEffect } from 'react'
import { View, Image, SafeAreaView, Pressable, Icon, Text } from 'design'

import Dropbox from 'assets/dropbox.svg'
import iCloud from 'assets/icloud.svg'

import { FontAwesome5 } from '@expo/vector-icons'

import * as DocumentPicker from 'expo-document-picker'

import { getFolderContents } from 'api/dropboxClient'
import { useQueryClient } from '@tanstack/react-query'
import { ScreenPropsT } from 'App'
import useDropBoxAuth from 'hooks/useDropboxAuth'

export type PropsT = ScreenPropsT<'Home'>

const Main = (props: PropsT) => {
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
      headerTransparent: true,
    })
  }, [])

  return (
    <View
      sx={{
        position: 'relative',
        height: '100%',
        backgroundColor: 'background',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        sx={{
          width: '100%',
          position: 'absolute',
          zIndex: -1,
        }}
        resizeMode="contain"
        source={require('assets/splash.png')}
        testID="logo-image"
      />
      <SafeAreaView sx={{ flex: 1, justifyContent: 'flex-end' }}>
        <View
          sx={{
            flexDirection: 'row',
            my: 5,
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Pressable
            onPress={async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
              })
              if (result.assets?.[0]) {
                props.navigation.push('Player', {
                  musicData: result.assets[0],
                })
              }
            }}
            sx={{
              backgroundColor: 'black',
              padding: 2,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            testID="icloud-source"
          >
            <FontAwesome5
              name="folder"
              size={48}
              color="white"
              testID="icloud-image"
            />
          </Pressable>
          <Pressable
            onPress={() => {
              authenticate()
            }}
            testID="dropbox-source"
            sx={{
              backgroundColor: 'black',
              padding: 2,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontAwesome5
              name="dropbox"
              size={48}
              color="white"
              testID="dropbox-image"
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default Main
