import React from 'react';
import { View } from 'react-native';
import JumpButton from './JumpButton';
import PlayButton from './PlayButton';

type PropsT = {
  playSound: () => void;
  pauseSound: () => void;
  currentPosition: number;
  setPosition: (position: number) => void;
  isPlaying: boolean;
};

const Controls = ({
  isPlaying,
  playSound,
  pauseSound,
  setPosition,
  currentPosition,
}: PropsT) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
      <JumpButton
        setPosition={setPosition}
        currentPosition={currentPosition}
        jumpStep={-10 * 1000}
      />
      <PlayButton
        onPress={() => {
          if (isPlaying === false) {
            playSound();
          } else {
            pauseSound();
          }
        }}
        state={isPlaying ? 'pause' : 'play'}
      />
      <JumpButton
        setPosition={setPosition}
        currentPosition={currentPosition}
        jumpStep={10 * 1000}
      />
    </View>
  );
};

export default Controls;
