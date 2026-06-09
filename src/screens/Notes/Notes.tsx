import React, { useEffect, useRef } from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
import {
  RichText,
  Toolbar,
  TenTapStartKit,
  useEditorBridge,
} from '@10play/tentap-editor'

import { View, ScreenLayout, useTheme } from 'design'
import { ScreenPropsT } from 'App'
import useAudioNotes, { useUpdateAudioNotes } from 'hooks/useAudioNotes'
import analytics from 'resources/analytics'

export type PropsT = ScreenPropsT<'Notes'>

const Notes = (props: PropsT) => {
  const { audioId, trackName } = props.route.params
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>

  const { data: notes, isLoading } = useAudioNotes(audioId)
  const updateNotes = useUpdateAudioNotes(audioId)

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    bridgeExtensions: TenTapStartKit,
    initialContent: notes ?? '',
  })

  // initialContent is captured on first render; if the query resolves after
  // mount, push the loaded HTML into the editor once.
  const hasHydratedRef = useRef(false)
  useEffect(() => {
    if (hasHydratedRef.current) return
    if (isLoading) return
    if (notes && notes.length > 0) {
      editor.setContent(notes)
    }
    hasHydratedRef.current = true
  }, [isLoading, notes, editor])

  const saveCurrent = async () => {
    try {
      const html = await editor.getHTML()
      const previous = notes ?? ''
      if (html === previous) return
      await updateNotes.mutateAsync(html)
    } catch (err) {
      analytics.error('Failed to save notes', err as any)
    }
  }

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('beforeRemove', () => {
      void saveCurrent()
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation, notes])

  useEffect(() => {
    props.navigation.setOptions({ headerTitle: trackName })
  }, [props.navigation, trackName])

  return (
    <ScreenLayout padding={0}>
      <View sx={{ flex: 1, backgroundColor: 'background' }}>
        <RichText
          editor={editor}
          style={{ backgroundColor: colors.background }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            position: 'absolute',
            width: '100%',
            bottom: 0,
          }}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      </View>
    </ScreenLayout>
  )
}

export default Notes
