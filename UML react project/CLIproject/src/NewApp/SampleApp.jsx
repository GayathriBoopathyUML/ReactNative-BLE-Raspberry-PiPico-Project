import BleManager from 'react-native-ble-manager';
import {PermissionsAndroid, Platform} from 'react-native';
import {StyleSheet, Button, Alert, Text, View} from 'react-native';
var Buffer = require('buffer/').Buffer;

const SampleApp = () => {
  console.log('........................');
  BleManager.start({showAlert: false}).then(() => {
    // Success code
    console.log('Module initialized');
  });
  BleManager.scan([], 70, true).then(() => {
    // Success code
    console.log('Start: Scan started');
  });
  BleManager.stopScan().then(() => {
    // Success code
    console.log('Stop: Scan stopped');
  });
  BleManager.enableBluetooth()
    .then(() => {
      // Success code
      console.log('The bluetooth is already enabled or the user confirm');
    })
    .catch(error => {
      // Failure code
      console.log('The user refuse to enable bluetooth');
    });
  BleManager.checkState().then(state =>
    console.log(`current BLE state = '${state}'.`),
  );
  BleManager.connect('28:CD:C1:0A:E1:43')
    .then(() => {
      // Success code
      console.log('Connected');
    })
    .catch(error => {
      // Failure code
      console.log(error);
    });
  BleManager.startNotification(
    '28:CD:C1:0A:E1:43',
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  )
    .then(() => {
      // Success code
      console.log('Notification started');
    })
    .catch(error => {
      // Failure code
      console.log(error);
    });
  BleManager.retrieveServices('28:CD:C1:0A:E1:43').then(peripheralInfo => {
    // Success code
    console.log('Peripheral info:', peripheralInfo);
  });
  BleManager.read(
    '28:CD:C1:0A:E1:43',
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  )
    .then(readData => {
      // Success code
      console.log('Read: ' + readData);

      // https://github.com/feross/buffer
      // https://nodejs.org/api/buffer.html#static-method-bufferfromarray
      const buffer = Buffer.from(readData);
      // console.log('buffer', buffer);
      const sensorData = buffer.readUInt8(1, true);
      // console.log('sensorData', sensorData);
    })
    .catch(error => {
      // Failure code
      console.log(error);
    });
  BleManager.readRSSI('28:CD:C1:0A:E1:43')
    .then(rssi => {
      // Success code
      console.log('Current RSSI: ' + rssi);
    })
    .catch(error => {
      // Failure code
      console.log(error);
    });
  BleManager.readDescriptor(
    '28:CD:C1:0A:E1:43',
    '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
    '2902',
  )
    .then(readData => {
      // Success code
      console.log('ReadData: ' + readData);

      // https://github.com/feross/buffer
      // https://nodejs.org/api/buffer.html#static-method-bufferfromarray
      const buffer = Buffer.from(readData);
      const sensorData = buffer.readUInt8(1, true);
    })
    .catch(error => {
      // Failure code
      console.log(error);
    });
  BleManager.getConnectedPeripherals([]).then(peripheralsArray => {
    // Success code
    console.log('Connected peripherals: ' + JSON.stringify(peripheralsArray));
  });
  BleManager.requestMTU('28:CD:C1:0A:E1:43', 512)
    .then(mtu => {
      // Success code
      console.log('MTU size changed to ' + mtu + ' bytes');
    })
    .catch(error => {
      // Failure code
      console.log(error);
    });
  BleManager.isPeripheralConnected('28:CD:C1:0A:E1:43', []).then(
    isConnected => {
      if (isConnected) {
        console.log('Peripheral is connected!');
      } else {
        console.log('Peripheral is NOT connected!');
      }
    },
  );
  // BleManager.disconnect('28:CD:C1:0A:E1:43')
  //   .then(() => {
  //     // Success code
  //     console.log('Disconnected');
  //   })
  //   .catch(error => {
  //     // Failure code
  //     console.log(error);
  //   });
  return (
    <View>
      <Button title="Connect" onPress={() => Alert.alert('connect devices')} />
    </View>
  );
};

export default SampleApp;
