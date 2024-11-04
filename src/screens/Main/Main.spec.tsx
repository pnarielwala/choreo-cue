import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import {
  renderWithProviders,
  cleanup,
  screen,
  waitFor,
} from '__test-utils__/rntl'

import Main from './Main'

import { useAuthRequest } from 'expo-auth-session'
import mock from '__test-utils__/mock'
import { StacksT } from 'App'
import mockKnex from 'mock-knex'
import dbClient from 'api/db/client'

import { pick } from 'lodash'
import { anAudio } from '__test-utils__/builders/db/audioBuilder'
import { addICloudAudioFile } from 'api/db/audio'

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
  doRenderWithProviders()

  const logo = screen.getByTestId('logo-image')

  expect(logo).toBeDefined()
})

it('should have a button to create a new project', async () => {
  doRenderWithProviders()

  const newProjectBtn = screen.getByRole('button', {
    name: /create new project/i,
  })

  expect(newProjectBtn).toBeDefined()
})

it('should have a list of recent projects', async () => {
  const tracker = mockKnex.getTracker()
  tracker.install()
  tracker.on('query', (query) => {
    if (query.method === 'select' && query.sql.includes('from `audio`')) {
      query.response([anAudio({ name: 'Call me maybe - Carly Rae Jepsen' })])
    }
  })

  doRenderWithProviders()

  await waitFor(() => {
    // TODO: see why this doesn't work
    // expect(
    //   screen.getByRole('list', { name: /recent projects/i })
    // ).toBeOnTheScreen()
    expect(
      screen.getByRole('listitem', { name: 'Call me maybe - Carly Rae Jepsen' })
    ).toBeOnTheScreen()
  })
})

it('should have some text when there are no projects', async () => {
  const tracker = mockKnex.getTracker()
  tracker.install()
  tracker.on('query', (query) => {
    if (
      query.method === 'select' &&
      query.sql.includes('select from `audio`')
    ) {
      query.response([])
    }
  })

  doRenderWithProviders()

  await waitFor(() => {
    expect(screen.getByText(/no projects yet/i)).toBeDefined()
  })
})
