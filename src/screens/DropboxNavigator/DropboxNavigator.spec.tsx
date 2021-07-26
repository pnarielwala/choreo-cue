import React from 'react';

import { render, act } from '@testing-library/react-native';

import DropboxNavigator, { PropsT } from './DropboxNavigator';

const defaultProps: PropsT = {};

const doRender = (overrides: Partial<PropsT> = {}) =>
  render(<DropboxNavigator {...defaultProps} {...overrides} />);

it.todo('implement me!');
