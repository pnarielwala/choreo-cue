import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, RenderOptions } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import {
  DefaultOptions,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { DripsyProvider } from 'dripsy';

import theme from '../theme';

type WithProvidersPropsT = {
  children?: any;
  reactQueryConfigOverride?: {
    queryCache?: QueryCache;
    mutationCache?: MutationCache;
    defaultOptions?: DefaultOptions;
  };
};

const withProviders =
  ({ reactQueryConfigOverride = {} }: WithProvidersPropsT) =>
  ({ children }) => {
    return (
      <DripsyProvider theme={theme}>
        <QueryClientProvider client={new QueryClient(reactQueryConfigOverride)}>
          <NavigationContainer>{children}</NavigationContainer>
        </QueryClientProvider>
      </DripsyProvider>
    );
  };

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
  options?: Omit<RenderOptions, 'queries'> & WithProvidersPropsT,
) {
  const { reactQueryConfigOverride, ...restOptions } = options ?? {};

  const result = render(
    withProviders({
      reactQueryConfigOverride,
    })({ children: ui }),
    {
      ...restOptions,
    },
  );

  const rerender = (
    children: React.ReactNode,
    newOptions: WithProvidersPropsT = {},
  ) =>
    result.rerender(
      withProviders({
        ...options,
        ...newOptions,
      })({ children }),
    );

  return { ...result, rerender };
}

const debug = (instance: ReactTestInstance) => {
  const { debug } = render(React.createElement(instance.type, instance.props));

  return debug();
};

export * from '@testing-library/react-native';

export { renderWithProviders, debug };
