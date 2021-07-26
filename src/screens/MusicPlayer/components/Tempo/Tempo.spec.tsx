import React from 'react';

import { render, act } from '@testing-library/react-native';

import Tempo, { PropsT } from './Tempo';

const defaultProps: PropsT = {};

const doRender = (overrides: Partial<PropsT> = {}) =>
  render(<Tempo {...defaultProps} {...overrides} />);

it.todo('implement me!');
