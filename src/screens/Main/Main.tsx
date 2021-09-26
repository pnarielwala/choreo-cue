import React from 'react'
import { View, Image, SafeAreaView, Pressable } from 'design'

import * as DocumentPicker from 'expo-document-picker'

import { getFolderContents } from 'api/dropboxClient'
import { useQueryClient } from 'react-query'
import { ScreenPropsT } from 'App'
import useDropBoxAuth from 'hooks/useDropboxAuth'

export type PropsT = ScreenPropsT<'Home'>

const Main = (props: PropsT) => {
  const queryClient = useQueryClient()

  const { authenticate } = useDropBoxAuth({
    onCheckAuth: async (authenticated) => {
      if (authenticated) {
        if (!queryClient.getQueryData(['dropbox-contents', ''])) {
          await queryClient.prefetchQuery(['dropbox-contents', ''], () =>
            getFolderContents('')
          )
        }
        props.navigation.push('DropboxNavigator', {
          path: '',
          name: 'Home',
        })
      }
    },
  })

  return (
    <View sx={{ position: 'relative', height: '100%' }}>
      <SafeAreaView
        sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
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
        <View
          sx={{
            position: 'absolute',
            bottom: 50,
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-evenly',
          }}
        >
          <Pressable
            onPress={async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
              })
              if (result.type === 'success') {
                props.navigation.push('Player', {
                  musicData: result,
                })
              }
            }}
            testID="icloud-source"
          >
            <Image
              source={require('assets/icloud.png')}
              resizeMode="contain"
              testID="icloud-image"
            />
          </Pressable>
          <Pressable
            onPress={() => {
              authenticate()
            }}
            testID="dropbox-source"
          >
            <Image
              source={require('assets/dropbox.png')}
              resizeMode="contain"
              testID="dropbox-image"
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default Main
