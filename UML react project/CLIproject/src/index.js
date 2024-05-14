import React from 'react';
import {StyleSheet, Button, Alert, Text, View} from 'react-native';
import BluetoothApp from './BluetoothApp';
import SampleApp from './NewApp/SampleApp';

const TestFunction = () => {
  // target = 10 + Math.floor(10 * Math.random());
  // console.log('gayathri');
  return (
    <View style={styles.center}>
      {/* <Button title="Connect" onPress={() => Alert.alert('connect devices')} /> */}
      <BluetoothApp />
      <SampleApp />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    padding: 10,
  },
});

export default TestFunction;
