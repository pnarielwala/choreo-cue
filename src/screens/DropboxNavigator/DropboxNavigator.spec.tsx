import React from 'react'
import { Text, Alert } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

import {
  renderWithProviders,
  waitFor,
  cleanup,
  fireEvent,
} from '__test-utils__/rntl'
import mock from '__test-utils__/mock'
import {
  aDropboxEntryFile,
  aDropboxEntryFolder,
} from '__test-utils__/builders/dropboxBuilder'
import { anApiResponse } from '__test-utils__/builders/apiResponseBuilder'

import { downloadFile, getFolderContents } from 'api/dropboxClient'

import DropboxNavigator from './DropboxNavigator'
import { ScreenPropsT, StacksT } from 'App'
import { Pressable } from 'design'

jest.mock('api/dropboxClient')

afterEach(cleanup)

type ScreenParamsT = ScreenPropsT<'DropboxNavigator'>['route']['params']

const Stack = createStackNavigator<StacksT>()

const doRenderWithProviders = (
  initialParams: ScreenParamsT = { name: 'Home', path: '' },
  initialRouteName: keyof StacksT = 'DropboxNavigator'
) => {
  return renderWithProviders(
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen
        name="DropboxNavigator"
        component={DropboxNavigator}
        initialParams={initialParams}
      />
      <Stack.Screen name="Player">
        {({ route }) => (
          <Text>{`Player screen: ${route.params.musicData.name}`}</Text>
        )}
      </Stack.Screen>
      <Stack.Screen name="Home">
        {({ navigation }) => (
          <Pressable
            onPress={() =>
              navigation.push('DropboxNavigator', {
                name: 'Home',
                path: '',
              })
            }
          >
            <Text>Go to dropbox</Text>
          </Pressable>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

beforeEach(() => {
  mock(getFolderContents).mockResolvedValue(
    anApiResponse({
      data: { cursor: '', entries: [aDropboxEntryFile()], has_more: false },
    })
  )
})

it('should have folder text', () => {
  const { getByText } = doRenderWithProviders({
    name: 'Test Folder Name',
    path: '',
  })

  expect(getByText('Test Folder Name')).not.toBeNull()
})

it('should display subfolders', async () => {
  mock(getFolderContents).mockResolvedValue(
    anApiResponse({
      data: {
        cursor: '',
        entries: [
          aDropboxEntryFolder({ name: 'Music', path_display: '/Music' }),
        ],
        has_more: false,
      },
    })
  )

  const { getByText } = doRenderWithProviders()

  await waitFor(() => getByText('Music'))
})

it('should display files', async () => {
  mock(getFolderContents).mockResolvedValue(
    anApiResponse({
      data: {
        cursor: '',
        entries: [
          aDropboxEntryFile({
            name: 'Barbie Girl.mp3',
            path_display: '/Barbie Girl.mp3',
          }),
        ],
        has_more: false,
      },
    })
  )
  const { getByText } = doRenderWithProviders()

  await waitFor(() => getByText('Barbie Girl.mp3'))
})

it('should trigger download when clicking on mp3 file', async () => {
  mock(getFolderContents).mockResolvedValue(
    anApiResponse({
      data: {
        cursor: '',
        entries: [
          aDropboxEntryFile({
            name: 'Barbie Girl.mp3',
            path_display: '/Barbie Girl.mp3',
          }),
        ],
        has_more: false,
      },
    })
  )
  const { getByText, getByTestId } = doRenderWithProviders()

  await waitFor(() => getByText('Barbie Girl.mp3'))

  mock(downloadFile).mockResolvedValue({
    name: 'Barbie Girl.mp3',
    uri: 'uri://path/to/Barbie Girl.mp3',
  })
  fireEvent.press(getByTestId('clickable-Barbie Girl.mp3'))

  await waitFor(() => getByText('Player screen: Barbie Girl.mp3'))
})

it('should display unsupported files and throw alert when trying to download', async () => {
  mock(getFolderContents).mockResolvedValue(
    anApiResponse({
      data: {
        cursor: '',
        entries: [
          aDropboxEntryFile({
            name: 'Hello World.txt',
            path_display: '/Hello World.txt',
          }),
        ],
        has_more: false,
      },
    })
  )
  const { getByText, getByTestId } = doRenderWithProviders()

  await waitFor(() => getByText('Hello World.txt'))

  jest.spyOn(Alert, 'alert')
  fireEvent.press(getByTestId('clickable-Hello World.txt'))

  expect(Alert.alert).toHaveBeenCalledWith(
    'Unsupported file type',
    'Unable to download this file. Please select an .mp3 file'
  )
})

it('go navigate back up the dropbox folder heirarchy', async () => {
  mock(getFolderContents).mockResolvedValueOnce(
    anApiResponse({
      data: {
        cursor: '',
        entries: [
          aDropboxEntryFolder({
            name: 'Music',
            path_display: '/Music',
          }),
        ],
        has_more: false,
      },
    })
  )
  const { getByText, getByLabelText, queryByText, debug } =
    doRenderWithProviders()

  await waitFor(() => getByText('Music'))

  mock(getFolderContents).mockResolvedValueOnce(
    anApiResponse({
      data: {
        cursor: '',
        entries: [
          aDropboxEntryFile({
            name: 'Forever - Chris Brown.mp3',
            path_display: '/Music/Forever - Chris Brown.mp3',
          }),
        ],
        has_more: false,
      },
    })
  )
  fireEvent.press(getByText('Music'))

  await waitFor(() => getByText('Forever - Chris Brown.mp3'))

  mock(getFolderContents).mockResolvedValueOnce(
    anApiResponse({
      data: {
        cursor: '',
        entries: [
          aDropboxEntryFolder({
            name: 'Music',
            path_display: '/Music',
          }),
        ],
        has_more: false,
      },
    })
  )
  fireEvent.press(getByLabelText('Back'))
  await waitFor(() =>
    expect(queryByText('Forever - Chris Brown.mp3')).toBeNull()
  )

  expect(queryByText('Music')).not.toBeNull()
})

it('should close navigator', async () => {
  mock(getFolderContents).mockResolvedValue(
    anApiResponse({
      data: {
        cursor: '',
        entries: [
          aDropboxEntryFolder({
            name: 'Music',
            path_display: '/Music',
          }),
        ],
        has_more: false,
      },
    })
  )
  const { getByText, queryByText, getByLabelText } = doRenderWithProviders(
    undefined,
    'Home'
  )

  fireEvent.press(getByText('Go to dropbox'))

  await waitFor(() => getByText('Music'))

  fireEvent.press(getByLabelText('Close'))

  await waitFor(() => expect(queryByText('Music')).toBeNull())
})
