import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type PropsT = {
  currentPosition: number;
  setPosition: (position: number) => void;
  jumpStep: number;
};

const JumpButton = ({ jumpStep, setPosition, currentPosition }: PropsT) => {
  const type: 'forward' | 'backward' = jumpStep > 0 ? 'forward' : 'backward';
  return (
    <TouchableOpacity
      style={styles.jumpButtonContainer}
      onPress={() => setPosition(currentPosition + jumpStep)}
    >
      <FontAwesome
        name={type}
        size={Math.min(Dimensions.get('screen').height * 0.02, 80)}
        color="#3D425C"
        style={
          type === 'forward' ? styles.forwardButton : styles.backwardButton
        }
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  jumpButtonContainer: {
    backgroundColor: '#FFF',
    borderColor: 'rgba(93, 63, 106, 0.2)',
    borderWidth: 1,
    width: Math.min(Dimensions.get('screen').height * 0.07, 60),
    height: Math.min(Dimensions.get('screen').height * 0.07, 60),
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5D3F6A',
    shadowRadius: 30,
    shadowOpacity: 0.5,
  },
  forwardButton: {
    marginLeft: 4,
  },
  backwardButton: {
    marginLeft: -4,
  },
});

export default JumpButton;
