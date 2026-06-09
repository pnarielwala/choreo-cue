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
}

jest.mock('@10play/tentap-editor', () => ({
  TenTapStartKit: [],
  useEditorBridge: () => mockEditor,
  RichText: () => null,
  Toolbar: () => null,
}))

afterEach(() => {
  cleanup()
  mockEditor.getHTML.mockReset()
  mockEditor.setContent.mockReset()
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

it('hydrates editor with loaded notes', async () => {
  renderNotes('<p>existing</p>')

  fireEvent.press(screen.getByText('open notes'))

  await waitFor(() => {
    expect(mockEditor.setContent).toHaveBeenCalledWith('<p>existing</p>')
  })
})

it('does not hydrate when notes are empty', async () => {
  renderNotes('')

  fireEvent.press(screen.getByText('open notes'))

  await waitFor(() => {
    expect(getAudioNotes).toHaveBeenCalledWith(7)
  })
  expect(mockEditor.setContent).not.toHaveBeenCalled()
})
