import React from 'react';

import { render, act } from '@testing-library/react-native';

import Main, { PropsT } from './Main';

const defaultProps: PropsT = {};

const doRender = (overrides: Partial<PropsT> = {}) =>
  render(<Main {...defaultProps} {...overrides} />);

it.todo('implement me!');
