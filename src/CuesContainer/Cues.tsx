import React from 'react';
import { StyleSheet, Button, TouchableOpacity, View } from 'react-native';

import CueButton from './CueButton';

type PropsT = {
  currentPosition: number;
  onPlayFromPosition: (position: number) => void;
};

const Cues = (props: PropsT) => {
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: -4,
        marginRight: -4,
        marginTop: 16,
      }}
    >
      <CueButton
        currentPosition={props.currentPosition}
        onPress={props.onPlayFromPosition}
        color="#f35588"
        inactiveColor="#f3558899"
        activeColor="#f35588"
      />
      <CueButton
        currentPosition={props.currentPosition}
        onPress={props.onPlayFromPosition}
        color="#05dfd7"
        inactiveColor="#05dfd799"
        activeColor="#05dfd7"
      />
      <CueButton
        currentPosition={props.currentPosition}
        onPress={props.onPlayFromPosition}
        color="#a3f7bf"
        inactiveColor="#a3f7bf99"
        activeColor="#a3f7bf"
      />
      <CueButton
        currentPosition={props.currentPosition}
        onPress={props.onPlayFromPosition}
        color="#fff591"
        inactiveColor="#fff59199"
        activeColor="#fff591"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '25%',
    padding: 4,
  },
  button: {
    paddingBottom: '100%',
    width: '100%',
    borderRadius: 4,
  },
  button1: {
    backgroundColor: '#f35588',
  },
  button2: {
    backgroundColor: '#05dfd7',
  },
  button3: {
    backgroundColor: '#a3f7bf',
  },
  button4: {
    backgroundColor: '#fff591',
  },
});

export default Cues;
