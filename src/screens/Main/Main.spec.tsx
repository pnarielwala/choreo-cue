import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import { renderWithProviders, cleanup } from '__test-utils__/rntl'

import Main from './Main'

import { useAuthRequest } from 'expo-auth-session'
import mock from '__test-utils__/mock'
import { StacksT } from 'App'

jest.mock('assets/splash.png', () => ({ uri: 'assets/splash.png' }))
jest.mock('expo-auth-session')

const doAuthSessionMock = (
  [request, response, prompt]: ReturnType<typeof useAuthRequest> = [
    null,
    null,
    jest.fn(),
  ]
) => mock(useAuthRequest).mockReturnValue([request, response, prompt])

beforeEach(() => {
  doAuthSessionMock()
})

afterEach(cleanup)

const Stack = createStackNavigator<StacksT>()

const doRenderWithProviders = (initialRouteName: keyof StacksT = 'Home') => {
  return renderWithProviders(
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="Home" component={Main} />
    </Stack.Navigator>
  )
}

it('should display the logo', () => {
  const { getByTestId } = doRenderWithProviders()

  const logo = getByTestId('logo-image')

  expect(logo).toBeDefined()
  expect(logo).toHaveStyle({
    width: '100%',
    position: 'absolute',
    zIndex: -1,
  })
  expect(logo).toHaveProp('resizeMode', 'contain')
  expect(logo).toHaveProp('source', { uri: 'assets/splash.png' })
})

it('should have iCloud button', async () => {
  const { getByTestId } = doRenderWithProviders()

  const iCloudBtn = getByTestId('icloud-source')
  const iCloudImage = getByTestId('icloud-image')
  expect(iCloudBtn).toBeDefined()
  expect(iCloudImage).toBeDefined()
})

it('should have Dropbox button', async () => {
  const { getByTestId } = doRenderWithProviders()

  const dropboxBtn = getByTestId('dropbox-source')
  const dropboxImage = getByTestId('dropbox-image')
  expect(dropboxBtn).toBeDefined()
  expect(dropboxImage).toBeDefined()
})
