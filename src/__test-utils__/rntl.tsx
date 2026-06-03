import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { render, RenderOptions } from '@testing-library/react-native'
import { ReactTestInstance } from 'react-test-renderer'
import {
  DefaultOptions,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { DripsyProvider } from 'dripsy'

import theme from '../design/theme'
import Toast from 'react-native-toast-message'

type WithProvidersPropsT = {
  children?: any
  reactQueryConfigOverride?: {
    queryCache?: QueryCache
    mutationCache?: MutationCache
    defaultOptions?: DefaultOptions
  }
}

// Track every QueryClient created during a test so afterEach can destroy them.
// Without this, TanStack Query's per-query/per-mutation gc setTimeout keeps
// Node's event loop alive after tests finish (5 minutes by default per
// inactive query). For mutations that are still in 'pending' state when the
// observer unmounts, the gc loop re-schedules itself indefinitely.
const liveClients = new Set<QueryClient>()

// RNTL's auto-cleanup afterEach (registered when '@testing-library/react-native'
// is imported above) unmounts components before this hook runs. By the time
// this fires, observers have detached and Removable.scheduleGc has been called
// on each query and mutation. QueryCache.clear() destroys queries (which
// clears their gc timers), but MutationCache.clear() does NOT call
// Mutation.destroy() — so a mutation that ran during a test leaves a 5-minute
// gc timer pinned to the event loop. Walk and destroy explicitly.
afterEach(async () => {
  for (const client of liveClients) {
    // Cancel in-flight fetches first. Without this, a fetch that resolves
    // after the cache is cleared calls scheduleGc on its (now-removed)
    // Query, re-creating a 5-minute timer pinned to the event loop.
    await client.cancelQueries()
    client
      .getMutationCache()
      .getAll()
      .forEach((m) => m.destroy())
    client.getQueryCache().clear()
    client.getMutationCache().clear()
    client.unmount()
  }
  liveClients.clear()
})

const createClient = (
  reactQueryConfigOverride: WithProvidersPropsT['reactQueryConfigOverride'] = {}
) => {
  // retry: false avoids retry/backoff timers from failed mock queries.
  const defaultOptions: DefaultOptions = {
    queries: {
      retry: false,
      ...(reactQueryConfigOverride.defaultOptions?.queries ?? {}),
    },
    mutations: {
      retry: false,
      ...(reactQueryConfigOverride.defaultOptions?.mutations ?? {}),
    },
  }
  const client = new QueryClient({
    ...reactQueryConfigOverride,
    defaultOptions,
  })
  liveClients.add(client)
  return client
}

const withProviders = ({
  reactQueryConfigOverride = {},
}: WithProvidersPropsT) => {
  const client = createClient(reactQueryConfigOverride)
  return ({ children }) => (
    <DripsyProvider theme={theme}>
      <QueryClientProvider client={client}>
        <NavigationContainer>
          {children}

          <Toast topOffset={45} />
        </NavigationContainer>
      </QueryClientProvider>
    </DripsyProvider>
  )
}

/**
 * Custom render method that wraps unit under test with some app level wrappers
 * and providers
 */
function renderWithProviders(
  ui: React.ReactElement,
  /**
   * 'queries' option is omitted because this method already extends for us.
   * When included, had some issues getting type information for extended queries
   */
  options?: Omit<RenderOptions, 'queries'> & WithProvidersPropsT
) {
  const { reactQueryConfigOverride, ...restOptions } = options ?? {}

  const result = render(
    withProviders({
      reactQueryConfigOverride,
    })({ children: ui }),
    {
      ...restOptions,
    }
  )

  const rerender = (
    children: React.ReactNode,
    newOptions: WithProvidersPropsT = {}
  ) =>
    result.rerender(
      withProviders({
        ...options,
        ...newOptions,
      })({ children })
    )

  return { ...result, rerender }
}

const debug = (instance: ReactTestInstance) => {
  const { debug } = render(React.createElement(instance.type, instance.props))

  return debug()
}

export * from '@testing-library/react-native'

export { renderWithProviders, debug }
