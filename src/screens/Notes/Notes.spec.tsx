import React from 'react'

import { Text, Pressable } from 'design'

import Notes from './Notes'
import { StacksT } from 'App'
import { createStackNavigator } from '@react-navigation/stack'
import {
  fireEvent,
  renderWithProviders,
  waitFor,
  cleanup,
  screen,
} from '__test-utils__/rntl'

import { getAudioNotes, updateAudioNotes } from 'api/db/audio'

jest.mock('api/db/audio', () => ({
  getAudioNotes: jest.fn(),
  updateAudioNotes: jest.fn().mockResolvedValue(undefined),
}))

const mockEditor = {
  getHTML: jest.fn(),
  setContent: jest.fn(),
  injectCSS: jest.fn(),
  updateScrollThresholdAndMargin: jest.fn(),
}

const mockUseEditorBridge = jest.fn((_opts: any) => mockEditor)

jest.mock('@10play/tentap-editor', () => ({
  TenTapStartKit: [],
  useEditorBridge: (opts: any) => mockUseEditorBridge(opts),
  RichText: () => null,
  Toolbar: () => null,
  editorHtml: '<!doctype html><html><head></head><body></body></html>',
  DEFAULT_TOOLBAR_ITEMS: [],
  Images: { close: 'close-icon' },
}))

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: () => ({
      downloadAsync: jest
        .fn()
        .mockResolvedValue({ localUri: 'mock://font.ttf' }),
    }),
  },
}))

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({
    base64: jest.fn().mockResolvedValue('AAAA'),
  })),
}))

afterEach(() => {
  cleanup()
  mockEditor.getHTML.mockReset()
  mockEditor.setContent.mockReset()
  mockEditor.injectCSS.mockReset()
  mockUseEditorBridge.mockClear()
  ;(getAudioNotes as jest.Mock).mockReset()
  ;(updateAudioNotes as jest.Mock).mockClear()
})

const Stack = createStackNavigator<StacksT>()

const renderNotes = (initialNotes: string = '') => {
  ;(getAudioNotes as jest.Mock).mockResolvedValue(initialNotes)
  return renderWithProviders(
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home">
        {({ navigation }) => (
          <Pressable
            onPress={() =>
              navigation.push('Notes', {
                audioId: 7,
                trackName: 'Test track',
              })
            }
          >
            <Text>open notes</Text>
          </Pressable>
        )}
      </Stack.Screen>
      <Stack.Screen name="Notes" component={Notes} />
    </Stack.Navigator>
  )
}

it('mounts the editor with loaded notes as initial content and a font-injected source', async () => {
  renderNotes('<p>existing</p>')

  fireEvent.press(screen.getByText('open notes'))

  await waitFor(() => {
    expect(mockUseEditorBridge).toHaveBeenCalled()
  })
  const opts = mockUseEditorBridge.mock.calls[0][0]
  expect(opts.initialContent).toBe('<p>existing</p>')
  expect(opts.customSource).toContain('@font-face')
  expect(opts.customSource).toContain('Satoshi')
})

it('mounts the editor with empty initial content when there are no saved notes', async () => {
  renderNotes('')

  fireEvent.press(screen.getByText('open notes'))

  await waitFor(() => {
    expect(getAudioNotes).toHaveBeenCalledWith(7)
  })
  await waitFor(() => {
    expect(mockUseEditorBridge).toHaveBeenCalled()
  })
  const opts = mockUseEditorBridge.mock.calls[0][0]
  expect(opts.initialContent).toBe('')
})
