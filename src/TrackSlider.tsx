import React from 'react';
import { View, Text } from 'react-native';

import Slider from '@react-native-community/slider';

import format from 'format-duration';

type PropsT = {
  duration: number;
  currentPosition: number;
  onPositionChange: (value: number) => void;
};

const TrackSlider = (props: PropsT) => {
  const adjustedCurrPosition = Math.floor(props.currentPosition / 1000) * 1000;
  const adjustedDuration = Math.floor(props.duration / 1000) * 1000;

  const formatedCurrentTime = format(adjustedCurrPosition);
  const formattedRemaining = format(adjustedDuration - adjustedCurrPosition);
  return (
    <View style={{}}>
      <Slider
        style={{ height: 40 }}
        minimumValue={0}
        maximumValue={1}
        value={adjustedCurrPosition / adjustedDuration}
        onSlidingComplete={(value: number) => {
          const newPosition = value * props.duration;
          props.onPositionChange(newPosition);
        }}
      />
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <Text>{formatedCurrentTime}</Text>
        <Text>{formattedRemaining}</Text>
      </View>
    </View>
  );
};

export default TrackSlider;
