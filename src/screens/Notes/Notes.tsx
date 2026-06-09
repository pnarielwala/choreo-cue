import React, { useEffect, useRef, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import {
  RichText,
  Toolbar,
  TenTapStartKit,
  useEditorBridge,
  editorHtml,
  DEFAULT_TOOLBAR_ITEMS,
  Images,
  type ToolbarItem,
} from '@10play/tentap-editor'
import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'
import { useHeaderHeight } from '@react-navigation/elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { View, ScreenLayout, useTheme, P } from 'design'
import { ScreenPropsT } from 'App'
import useAudioNotes, { useUpdateAudioNotes } from 'hooks/useAudioNotes'
import analytics from 'resources/analytics'

const buildEditorCss = (
  regularB64: string,
  boldB64: string,
  bottomPadPx: number
) => `
  @font-face {
    font-family: 'Satoshi';
    font-style: normal;
    font-weight: 400;
    font-display: block;
    src: url(data:font/ttf;base64,${regularB64}) format('truetype');
  }
  @font-face {
    font-family: 'Satoshi';
    font-style: normal;
    font-weight: 700;
    font-display: block;
    src: url(data:font/ttf;base64,${boldB64}) format('truetype');
  }
  html, body, .ProseMirror, .ProseMirror * {
    font-family: 'Satoshi', -apple-system, system-ui, sans-serif;
  }
  .ProseMirror {
    padding-bottom: ${bottomPadPx}px;
  }
  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  *::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`

const loadEditorCss = async (bottomPadPx: number): Promise<string> => {
  const [regular, bold] = await Promise.all([
    Asset.fromModule(
      require('assets/fonts/Satoshi-Regular.ttf')
    ).downloadAsync(),
    Asset.fromModule(require('assets/fonts/Satoshi-Bold.ttf')).downloadAsync(),
  ])
  const regularUri = regular.localUri ?? regular.uri
  const boldUri = bold.localUri ?? bold.uri
  const [regularB64, boldB64] = await Promise.all([
    new File(regularUri).base64(),
    new File(boldUri).base64(),
  ])
  return buildEditorCss(regularB64, boldB64, bottomPadPx)
}

const buildCustomSource = (fontCss: string): string =>
  editorHtml.replace('</head>', `<style>${fontCss}</style></head>`)

const dismissKeyboardItem: ToolbarItem = {
  onPress:
    ({ editor }) =>
    () =>
      editor.blur(),
  active: () => false,
  disabled: () => false,
  image: () => Images.close,
}

const TOOLBAR_ITEMS: ToolbarItem[] = [
  dismissKeyboardItem,
  ...DEFAULT_TOOLBAR_ITEMS,
]

// Floating toolbar height (44pt) + buffer. ProseMirror is told to keep the
// cursor this far above the WebView's visible bottom when scrolling it into
// view, and .ProseMirror's padding-bottom must be at least this big so there
// is runway to scroll into when editing near the end of the document.
const TOOLBAR_CLEARANCE_PX = 60

export type PropsT = ScreenPropsT<'Notes'>

type EditorPaneProps = {
  audioId: number
  initialNotes: string
  customSource: string
  baselineBottomPadPx: number
  navigation: PropsT['navigation']
}

const EditorPane = ({
  audioId,
  initialNotes,
  customSource,
  baselineBottomPadPx,
  navigation,
}: EditorPaneProps) => {
  const theme = useTheme()
  const colors = theme.colors as Record<string, string>
  const headerHeight = useHeaderHeight()
  const updateNotes = useUpdateAudioNotes(audioId)

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    bridgeExtensions: TenTapStartKit,
    initialContent: initialNotes,
    customSource,
  })

  const lastSavedRef = useRef(initialNotes)

  const saveCurrent = async () => {
    try {
      const html = await editor.getHTML()
      if (html === lastSavedRef.current) return
      lastSavedRef.current = html
      await updateNotes.mutateAsync(html)
    } catch (err) {
      analytics.error('Failed to save notes', err as any)
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      void saveCurrent()
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation])

  // TenTap's `avoidIosKeyboard: true` pads .ProseMirror and sets
  // scrollMargin.bottom to (keyboardHeight + 10) on keyboard up, which places
  // the cursor at the top of the keyboard - behind the floating toolbar.
  // After TenTap's keyboard effect settles, bump both values by
  // TOOLBAR_CLEARANCE_PX and manually scroll the cursor into the new visible
  // area. The visible area excludes the keyboard and the toolbar.
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const setPadding = (px: number) => {
      editor.webviewRef.current?.injectJavaScript(`
        (function () {
          var doc = document.querySelector('.ProseMirror');
          if (doc) doc.style.paddingBottom = '${px}px';
          true;
        })();
      `)
    }
    const hideSub = Keyboard.addListener(hideEvent, () => {
      // TenTap resets .ProseMirror paddingBottom to 0 on keyboard hide -
      // restore our baseline so content still has bottom breathing room.
      setTimeout(() => setPadding(baselineBottomPadPx), 10)
    })
    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kbHeight = e.endCoordinates.height
      const total = kbHeight + 10 + TOOLBAR_CLEARANCE_PX
      const hiddenBelow = kbHeight + TOOLBAR_CLEARANCE_PX
      setTimeout(() => {
        editor.updateScrollThresholdAndMargin(total)
        editor.webviewRef.current?.injectJavaScript(`
          (function () {
            var scroller = document.querySelector('#root > div') || document.scrollingElement || document.documentElement;
            var doc = document.querySelector('.ProseMirror');
            if (doc) {
              doc.style.paddingBottom = '${total}px';
              void doc.offsetHeight;
            }
            if (scroller) {
              scroller.style.scrollPaddingBottom = '${hiddenBelow}px';
              scroller.style.scrollBehavior = 'smooth';
            }
            requestAnimationFrame(function () {
              var sel = window.getSelection && window.getSelection();
              if (!sel || sel.rangeCount === 0) return;
              var node = sel.focusNode;
              if (!node) return;
              var el = node.nodeType === 3 ? node.parentElement : node;
              if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ block: 'end', behavior: 'smooth' });
              }
            });
            true;
          })();
        `)
      }, 10)
    })
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [editor, baselineBottomPadPx])

  return (
    <View sx={{ flex: 1, backgroundColor: 'background' }}>
      <View sx={{ flex: 1, px: 3, pt: 2 }}>
        <RichText
          editor={editor}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: colors.background }}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
        style={{
          position: 'absolute',
          width: '100%',
          bottom: 0,
        }}
      >
        <Toolbar editor={editor} items={TOOLBAR_ITEMS} />
      </KeyboardAvoidingView>
    </View>
  )
}

const Notes = (props: PropsT) => {
  const { audioId, trackName } = props.route.params
  const insets = useSafeAreaInsets()
  const bottomPadPx = insets.bottom + 24

  const { data: notes, isLoading } = useAudioNotes(audioId)

  const [customSource, setCustomSource] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    console.log('bottomPadPx', bottomPadPx)
    loadEditorCss(bottomPadPx)
      .then((css) => {
        if (!cancelled) setCustomSource(buildCustomSource(css))
      })
      .catch((err) => {
        analytics.error('Failed to load notes editor font', err as any)
        // Fall back to default source so the editor still renders.
        if (!cancelled) setCustomSource(editorHtml)
      })
    return () => {
      cancelled = true
    }
  }, [bottomPadPx])

  useEffect(() => {
    props.navigation.setOptions({ headerTitle: trackName })
  }, [props.navigation, trackName])

  const isReady = !isLoading && customSource !== null

  return (
    <ScreenLayout padding={0}>
      {isReady ? (
        <EditorPane
          audioId={audioId}
          initialNotes={notes ?? ''}
          customSource={customSource!}
          baselineBottomPadPx={bottomPadPx}
          navigation={props.navigation}
        />
      ) : (
        <View sx={{ flex: 1, backgroundColor: 'background' }} />
      )}
    </ScreenLayout>
  )
}

export default Notes
