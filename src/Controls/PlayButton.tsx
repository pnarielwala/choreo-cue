import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type PropsT = {
  onPress: () => void;
  state: 'play' | 'pause';
};
export default function PlayButton(props: PropsT) {
  return (
    <TouchableOpacity
      style={styles.playButtonContainer}
      onPress={props.onPress}
    >
      <FontAwesome
        name={props.state}
        size={Dimensions.get('screen').height * 0.04}
        color="#3D425C"
        style={props.state === 'play' ? styles.playButton : undefined}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  playButtonContainer: {
    backgroundColor: '#FFF',
    borderColor: 'rgba(93, 63, 106, 0.2)',
    borderWidth: 2,
    width: Dimensions.get('screen').height * 0.11,
    height: Dimensions.get('screen').height * 0.11,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    shadowColor: '#5D3F6A',
    shadowRadius: 30,
    shadowOpacity: 0.5,
  },
  playButton: {
    marginLeft: 6,
  },
});
