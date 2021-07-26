import React from 'react';

import { render, act } from '@testing-library/react-native';

import TrackSlider, { PropsT } from './TrackSlider';

const defaultProps: PropsT = {};

const doRender = (overrides: Partial<PropsT> = {}) =>
  render(<TrackSlider {...defaultProps} {...overrides} />);

it.todo('implement me!');
