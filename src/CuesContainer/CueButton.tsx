import React, { useState } from 'react';
import { StyleSheet, Button, TouchableOpacity, View } from 'react-native';

type PropsT = {
  currentPosition: number;
  onPress: (position: number) => void;
  color: string;
  inactiveColor: string;
  activeColor: string;
};

const CueButton = (props: PropsT) => {
  const [position, setPosition] = useState<number | undefined>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          ...styles.button,
          backgroundColor: !!position ? props.activeColor : props.inactiveColor,
        }}
        onLongPress={() => setPosition(props.currentPosition)}
        onPress={() => position && props.onPress(position)}
      ></TouchableOpacity>
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
});

export default CueButton;
