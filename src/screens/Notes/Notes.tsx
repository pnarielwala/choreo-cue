import React, { useEffect, useRef, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Linking, Platform } from 'react-native'
import type { WebViewMessageEvent } from 'react-native-webview'
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

import { View, ScreenLayout, useTheme, Pressable, Text } from 'design'
import { ScreenPropsT } from 'App'
import useAudioNotes, { useUpdateAudioNotes } from 'hooks/useAudioNotes'
import analytics from 'resources/analytics'

type EditorColors = {
  text: string
  background: string
  textMuted: string
  textSubtle: string
  accent: string
  accentText: string
  surface: string
  surfaceMuted: string
  border: string
}

const buildToolbarTheme = (colors: EditorColors) => ({
  toolbarBody: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
  },
  toolbarButton: {
    backgroundColor: colors.surface,
  },
  icon: {
    tintColor: colors.textMuted,
  },
  iconDisabled: {
    tintColor: colors.textSubtle,
  },
  iconWrapper: {
    backgroundColor: colors.surface,
  },
  iconWrapperActive: {
    backgroundColor: colors.surfaceMuted,
  },
  linkBarTheme: {
    addLinkContainer: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderBottomColor: colors.border,
    },
    linkInput: {
      backgroundColor: colors.surface,
      color: colors.text,
    },
    placeholderTextColor: colors.textMuted,
    doneButton: {
      backgroundColor: colors.accent,
    },
    doneButtonText: {
      color: colors.accentText,
    },
  },
})

const buildColorCss = (colors: EditorColors) => `
  html, body, .ProseMirror, .ProseMirror * {
    color: ${colors.text};
    -webkit-user-select: text !important;
    user-select: text !important;
  }
  html, body {
    background-color: ${colors.background};
  }
  *::selection {
    background: #ffc600 !important;
    color: #000000 !important;
  }
  
  ::-webkit-selection {
    background: #ffc600 !important;
    color: #000000 !important;
  }
    .tiptap ::selection {
      background-color: #ffc600 !important;
      color: #000000 !important;
    }
    .tiptap *::selection {
      background-color: #ffc600 !important;
      color: #000000 !important;
    }
    /* Handles block element selections */
    .ProseMirror-selectednode {
      outline: 3px solid #ffc600 !important;
    }
      input, textarea, [contenteditable] {
          -webkit-tap-highlight-color: #ff5722;
        }
  .ProseMirror {
    caret-color: ${colors.text};
  }
  .ProseMirror a {
    color: ${colors.accent};
  }
  .ProseMirror p.is-editor-empty:first-child::before,
  .ProseMirror .is-empty::before {
    color: ${colors.textMuted};
  }
  .ProseMirror blockquote {
    border-left-color: ${colors.textSubtle};
  }
  .ProseMirror ul[data-type="taskList"] li > label > input[type="checkbox"] {
    -webkit-appearance: none;
    appearance: none;
    width: 1.1em;
    height: 1.1em;
    margin: 0.15rem 0.1rem;
    padding: 0;
    border: 1.5px solid ${colors.textSubtle};
    border-radius: 0.25rem;
    background: transparent;
    position: relative;
    cursor: pointer;
    vertical-align: middle;
  }
  .ProseMirror ul[data-type="taskList"] li > label > input[type="checkbox"]:checked {
    background: ${colors.accent};
    border-color: ${colors.accent};
  }
  .ProseMirror ul[data-type="taskList"] li > label > input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 45%;
    width: 0.3em;
    height: 0.6em;
    border: solid ${colors.accentText};
    border-width: 0 0.16em 0.16em 0;
    transform: translate(-50%, -55%) rotate(45deg);
  }
`

const buildEditorCss = (
  regularB64: string,
  boldB64: string,
  bottomPadPx: number,
  colors: EditorColors
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
  ${buildColorCss(colors)}
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

const loadEditorCss = async (
  bottomPadPx: number,
  colors: EditorColors
): Promise<string> => {
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
  return buildEditorCss(regularB64, boldB64, bottomPadPx, colors)
}

// Capture-phase tap handling. Two goals:
//  1. Stop iOS WebView / ProseMirror from auto-selecting the inline run under a
//     single tap (most visible on formatted text - bold/italic/link words get
//     selected just from a tap). Done by canceling 'selectstart' for taps that
//     aren't drags, long-presses, or second-of-double.
//  2. Show a confirmation pill before opening a link. Single tap on a link
//     swallows mousedown/touchstart so ProseMirror doesn't select the link
//     range, then touchend/click posts the href + rect to RN.
// Drag-select, long-press, and double-tap-to-word-select are all preserved.
const LINK_INTERCEPT_SCRIPT = `
(function() {
  if (window.__ccLinkIntercept) return;
  window.__ccLinkIntercept = true;
  var DBL_WINDOW_MS = 350;
  var TAP_DEDUPE_MS = 60;
  var LONG_PRESS_MS = 450;
  var MOVE_THRESHOLD = 8;
  var lastTapTime = 0;
  var lastTapAnchor = null;
  var lastShowAt = 0;
  var downTime = 0;
  var downX = 0;
  var downY = 0;
  var moved = false;
  function findAnchor(el) {
    while (el && el !== document.body) {
      if (el.tagName === 'A') return el;
      el = el.parentElement;
    }
    return null;
  }
  function findCheckbox(el) {
    while (el && el !== document.body) {
      if (el.tagName === 'INPUT' && el.type === 'checkbox') return el;
      el = el.parentElement;
    }
    return null;
  }
  function blurActive() {
    var ae = document.activeElement;
    if (ae && typeof ae.blur === 'function') ae.blur();
  }
  // TipTap's TaskItem change handler calls editor.chain().focus() async, so a
  // single blur loses the race. Hold an aggressive blur for a short window
  // after a checkbox tap to defeat the late focus.
  var keepBlurredUntil = 0;
  function keepBlurringEditor() {
    if (Date.now() > keepBlurredUntil) return;
    var pm = document.querySelector('.ProseMirror');
    if (pm && document.activeElement === pm) {
      pm.blur();
    }
    requestAnimationFrame(keepBlurringEditor);
  }
  function suppressEditorFocusBriefly(ms) {
    keepBlurredUntil = Date.now() + ms;
    requestAnimationFrame(keepBlurringEditor);
  }
  function post(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }
  function withinDoubleWindow() {
    return Date.now() - lastTapTime < DBL_WINDOW_MS;
  }

  // Position + movement tracking - shared by selectstart and link suppression.
  document.addEventListener('touchstart', function(e) {
    var t = e.touches && e.touches[0];
    if (t) { downX = t.clientX; downY = t.clientY; }
    downTime = Date.now();
    moved = false;
  }, { capture: true, passive: true });
  document.addEventListener('mousedown', function(e) {
    downX = e.clientX;
    downY = e.clientY;
    downTime = Date.now();
    moved = false;
  }, true);
  document.addEventListener('touchmove', function(e) {
    var t = e.touches && e.touches[0];
    if (!t) return;
    if (Math.abs(t.clientX - downX) > MOVE_THRESHOLD ||
        Math.abs(t.clientY - downY) > MOVE_THRESHOLD) moved = true;
  }, { capture: true, passive: true });
  document.addEventListener('mousemove', function(e) {
    if (e.buttons === 0) return;
    if (Math.abs(e.clientX - downX) > MOVE_THRESHOLD ||
        Math.abs(e.clientY - downY) > MOVE_THRESHOLD) moved = true;
  }, true);

  // Undo the auto-selection of inline runs on a tap. We do this on touchend
  // (collapse the resulting selection) instead of preventing 'selectstart'
  // up front - the upfront preventDefault races with iOS's own drag-select
  // gesture detection. iOS can fire selectstart before our touchmove handler
  // has seen enough movement to flip 'moved', so a real drag-select gets its
  // initial 'selectstart' canceled and the WebView's selection state ends up
  // out of sync with the finger, producing a jumpy / over-selecting feel.
  // Skip the collapse for:
  //  - drag-select (moved past threshold)
  //  - long-press (held past LONG_PRESS_MS, e.g. magnifier-driven selection)
  //  - second tap of a double-tap (browser's native word select)
  // Registered before handleTap so withinDoubleWindow() still reflects the
  // PREVIOUS tap's time, not the one we're currently handling.
  document.addEventListener('touchend', function() {
    if (moved) return;
    if (Date.now() - downTime > LONG_PRESS_MS) return;
    if (withinDoubleWindow()) return;
    var tapX = downX;
    var tapY = downY;
    requestAnimationFrame(function () {
      var sel = window.getSelection && window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      if (document.caretRangeFromPoint) {
        var range = document.caretRangeFromPoint(tapX, tapY);
        if (range) {
          sel.removeAllRanges();
          sel.addRange(range);
          return;
        }
      }
      sel.collapseToEnd();
    });
  }, { capture: true, passive: true });

  // Stop ProseMirror's mousedown/touchstart handlers from running for:
  //  - links (so the first tap doesn't select the link range)
  //  - task-list checkboxes (so toggling doesn't focus the editor / open the
  //    keyboard). The native default action still toggles the checkbox.
  function suppress(e) {
    var a = findAnchor(e.target);
    if (a) {
      if (!withinDoubleWindow()) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }
    if (findCheckbox(e.target)) {
      e.stopPropagation();
      suppressEditorFocusBriefly(400);
    }
  }
  document.addEventListener('mousedown', suppress, true);
  document.addEventListener('touchstart', suppress, { capture: true, passive: false });

  function handleTap(e) {
    var now = Date.now();
    if (now - lastShowAt < TAP_DEDUPE_MS) return;
    if (findCheckbox(e.target)) {
      // Stop the click from focusing the editable, blur anything that already
      // got focus, and keep blurring for a short window because TipTap's
      // TaskItem extension re-focuses the editor async after the change event.
      e.stopPropagation();
      lastShowAt = now;
      setTimeout(blurActive, 0);
      suppressEditorFocusBriefly(400);
      post({ type: 'cc-link-dismiss' });
      return;
    }
    var a = findAnchor(e.target);
    var prevTime = lastTapTime;
    var prevAnchor = lastTapAnchor;
    lastTapTime = now;
    lastTapAnchor = a;
    lastShowAt = now;
    if (!a || !a.getAttribute('href')) {
      post({ type: 'cc-link-dismiss' });
      return;
    }
    var isDouble = prevAnchor === a && (now - prevTime < DBL_WINDOW_MS);
    if (isDouble) {
      // Second tap on same link → let the editor handle word selection.
      post({ type: 'cc-link-dismiss' });
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var r = a.getBoundingClientRect();
    post({
      type: 'cc-link-click',
      href: a.getAttribute('href'),
      rect: { top: r.top, left: r.left, bottom: r.bottom, width: r.width },
    });
  }
  document.addEventListener('touchend', handleTap, true);
  document.addEventListener('click', handleTap, true);
  document.addEventListener('scroll', function() {
    post({ type: 'cc-link-dismiss' });
  }, true);
})();
`

// editorHtml embeds the tiptap bundle, which contains string literals like
// `<body>${t}</body>` - so an earlier `</body>` occurrence belongs to that JS,
// not the document. Splice at the *last* `</body>` to inject before the real
// closing tag.
const injectBeforeClosingBody = (html: string, snippet: string): string => {
  const idx = html.lastIndexOf('</body>')
  if (idx === -1) return html + snippet
  return html.slice(0, idx) + snippet + html.slice(idx)
}

const buildCustomSource = (fontCss: string): string =>
  injectBeforeClosingBody(
    editorHtml.replace('</head>', `<style>${fontCss}</style></head>`),
    `<script>${LINK_INTERCEPT_SCRIPT}</script>`
  )

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

const PILL_HEIGHT = 32
const PILL_URL_MAX = 36

const truncateUrl = (url: string) => {
  const stripped = url.replace(/^https?:\/\//, '')
  if (stripped.length <= PILL_URL_MAX) return stripped
  return stripped.slice(0, PILL_URL_MAX - 3) + '...'
}

export type PropsT = ScreenPropsT<'Notes'>

type EditorPaneProps = {
  audioId: number
  initialNotes: string
  customSource: string
  baselineBottomPadPx: number
  navigation: PropsT['navigation']
  colors: EditorColors
}

const EditorPane = ({
  audioId,
  initialNotes,
  customSource,
  baselineBottomPadPx,
  navigation,
  colors,
}: EditorPaneProps) => {
  const headerHeight = useHeaderHeight()
  const updateNotes = useUpdateAudioNotes(audioId)

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    bridgeExtensions: TenTapStartKit,
    initialContent: initialNotes,
    customSource,
    theme: { toolbar: buildToolbarTheme(colors) },
    disableColorHighlight: true,
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

  // Push theme color updates into the WebView so toggling light/dark while the
  // editor is mounted recolors text without losing editor state.
  useEffect(() => {
    const css = buildColorCss(colors)
    editor.webviewRef.current?.injectJavaScript(`
      (function () {
        var id = 'cc-theme-colors';
        var el = document.getElementById(id);
        if (!el) {
          el = document.createElement('style');
          el.id = id;
          document.head.appendChild(el);
        }
        el.textContent = ${JSON.stringify(css)};
        true;
      })();
    `)
  }, [editor, colors.text, colors.background, colors.textMuted, colors.accent])

  const [linkPrompt, setLinkPrompt] = useState<{
    href: string
    top: number
    left: number
  } | null>(null)

  const handleMessage = (event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data
    if (typeof raw !== 'string') return
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return
    }
    if (!parsed || typeof parsed !== 'object') return
    const msg = parsed as { type?: string; href?: string; rect?: any }
    if (msg.type === 'cc-link-click' && typeof msg.href === 'string') {
      const rect = msg.rect || {}
      const pillTop =
        rect.top > PILL_HEIGHT + 8
          ? rect.top - PILL_HEIGHT - 4
          : rect.bottom + 4
      setLinkPrompt({
        href: msg.href,
        top: pillTop,
        left: Math.max(0, rect.left ?? 0),
      })
    } else if (msg.type === 'cc-link-dismiss') {
      setLinkPrompt(null)
    }
  }

  const openLink = async (href: string) => {
    setLinkPrompt(null)
    try {
      await Linking.openURL(href)
    } catch (err) {
      analytics.error('Failed to open notes link', err as any)
    }
  }

  return (
    <View sx={{ flex: 1, backgroundColor: 'background' }}>
      <View sx={{ flex: 1, px: 3, pt: 2 }}>
        <RichText
          editor={editor}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: colors.background }}
          onMessage={handleMessage}
          exclusivelyUseCustomOnMessage={false}
        />
        {linkPrompt && (
          <Pressable
            onPress={() => openLink(linkPrompt.href)}
            sx={{
              position: 'absolute',
              top: linkPrompt.top,
              left: linkPrompt.left,
              maxWidth: '90%',
              backgroundColor: 'surfaceElevated',
              borderColor: 'border',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text
              numberOfLines={1}
              sx={{ color: 'text', fontSize: 14, fontWeight: '500' }}
            >
              Go to {truncateUrl(linkPrompt.href)}
            </Text>
          </Pressable>
        )}
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
  const theme = useTheme()
  const themeColors = theme.colors as Record<string, string>
  const editorColors: EditorColors = {
    text: themeColors.text,
    background: themeColors.background,
    textMuted: themeColors.textMuted,
    textSubtle: themeColors.textSubtle,
    accent: themeColors.accent,
    accentText: themeColors.accentText,
    surface: themeColors.surface,
    surfaceMuted: themeColors.surfaceMuted,
    border: themeColors.border,
  }

  const { data: notes, isLoading } = useAudioNotes(audioId)

  const [customSource, setCustomSource] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    loadEditorCss(bottomPadPx, editorColors)
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
    // Only build initial source once; runtime theme changes are pushed via
    // injected CSS in EditorPane.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          colors={editorColors}
        />
      ) : (
        <View sx={{ flex: 1, backgroundColor: 'background' }} />
      )}
    </ScreenLayout>
  )
}

export default Notes
