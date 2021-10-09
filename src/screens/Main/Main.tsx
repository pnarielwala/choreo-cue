import React, { useEffect } from 'react'
import { View, Image, SafeAreaView, Pressable, Icon } from 'design'

import Dropbox from 'assets/dropbox.svg'
import iCloud from 'assets/icloud.svg'

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
            width: '100%',
            my: 5,
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
            <Icon as={iCloud} width={64} height={64} testID="icloud-image" />
          </Pressable>
          <Pressable
            onPress={() => {
              authenticate()
            }}
            testID="dropbox-source"
          >
            <Icon as={Dropbox} width={64} height={64} testID="dropbox-image" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default Main
