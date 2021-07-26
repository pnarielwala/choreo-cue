import formatDuration from 'format-duration';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type PropsT = {
  currentPosition: number;
  onPress: (position: number) => void;
  triggerReset: boolean;
  inactiveColor: string;
  activeColor: string;
};

const CueButton = ({
  currentPosition,
  onPress,
  triggerReset,
  inactiveColor,
  activeColor,
}: PropsT) => {
  const [position, setPosition] = useState<number | undefined>();

  useEffect(() => {
    if (triggerReset) {
      setPosition(undefined);
    }
  }, [triggerReset]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          ...styles.button,
          backgroundColor: position !== undefined ? activeColor : inactiveColor,
        }}
        onLongPress={() => {
          setPosition(currentPosition);
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Cue set!',
            visibilityTime: 1000,
          });
        }}
        onPress={() => position !== undefined && onPress(position)}
      >
        {position !== undefined ? (
          <Text style={styles.text}>
            {formatDuration(Math.floor((position ?? 0) / 1000) * 1000)}
          </Text>
        ) : (
          <Text>Press & Hold to Set</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('screen').width > 700 ? '25%' : '50%',
    padding: 4,
  },
  button: {
    height: Dimensions.get('screen').height * 0.11,
    width: '100%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default CueButton;
