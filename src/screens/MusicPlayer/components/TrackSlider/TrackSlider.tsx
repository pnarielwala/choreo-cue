import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from 'react-native-slider';
import format from 'format-duration';

export type PropsT = {
  duration: number;
  currentPosition: number;
  onPositionChange: (value: number) => void;
  disabled: boolean;
};

const TrackSlider = (props: PropsT) => {
  const [adjustedCurrPosition, setSliderValue] = useState(
    Math.floor(props.currentPosition / 1000) * 1000,
  );
  const [isSliding, setIsSliding] = useState(false);

  const adjustedDuration = Math.floor(props.duration / 1000) * 1000;

  useEffect(() => {
    if (!isSliding) {
      setSliderValue(Math.floor(props.currentPosition / 1000) * 1000);
    }
  }, [props.currentPosition]);

  const formatedCurrentTime = format(adjustedCurrPosition);
  const formattedRemaining = format(adjustedDuration - adjustedCurrPosition);
  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        thumbStyle={styles.thumb}
        trackStyle={styles.track}
        minimumValue={0}
        maximumValue={1}
        disabled={props.disabled}
        value={
          adjustedDuration > 0 ? adjustedCurrPosition / adjustedDuration : 0
        }
        onValueChange={(value: number) =>
          setSliderValue(value * adjustedDuration)
        }
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={(value: number) => {
          const newPosition = value * props.duration;
          props.onPositionChange(newPosition);
          setIsSliding(false);
        }}
      />
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      >
        <Text>{formatedCurrentTime}</Text>
        <Text>-{formattedRemaining}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 50,
  },
  thumb: {
    width: 8,
    height: 8,
  },
  track: {
    height: 2,
  },
});

export default TrackSlider;
