import React from 'react';

import { render, act } from '@testing-library/react-native';

import DropboxAuthButton, { PropsT } from './DropboxAuthButton';

const defaultProps: PropsT = {
  onCheckAuth: jest.fn(),
};

const doRender = (overrides: Partial<PropsT> = {}) =>
  render(<DropboxAuthButton {...defaultProps} {...overrides} />);

it.todo('implement me!');
