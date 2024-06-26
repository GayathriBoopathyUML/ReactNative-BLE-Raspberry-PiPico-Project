/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, {useState, useEffect} from 'react';
import {
  Text,
  Alert,
  View,
  FlatList,
  Platform,
  StatusBar,
  SafeAreaView,
  NativeModules,
  useColorScheme,
  TouchableOpacity,
  NativeEventEmitter,
  PermissionsAndroid,
  Button,
} from 'react-native';
import {styles} from './styles/styles';
import {DeviceList} from './DeviceList';
import BleManager from 'react-native-ble-manager';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BluetoothApp = () => {
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);

  const handleLocationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // console.log('Location permission granted');
        } else {
          // console.log('Location permission denied');
        }
      } catch (error) {
        // console.log('Error requesting location permission:', error);
      }
    }
  };

  const handleGetConnectedDevices = () => {
    BleManager.getBondedPeripherals([]).then(results => {
      // console.log('results -', results);
      if (results.length === 0) {
        // console.log('No connected bluetooth devices');
      } else {
        for (let i = 0; i < results.length; i++) {
          let peripheral = results[i];
          peripheral.connected = true;
          peripherals.set(peripheral.id, peripheral);
          setConnectedDevices(Array.from(peripherals.values()));
        }
      }
    });
  };

  async function requestBluetoothPermissions() {
    // console.log('requestBluetoothPermissions');
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
      ]);
      if (
        granted['android.permission.BLUETOOTH'] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.BLUETOOTH_ADMIN'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        // You have the necessary Bluetooth permissions
        // console.log('Bluetooth permissions granted');
        // Now, you can use Bluetooth functionality in your app.
      } else {
        // Handle the case where the user denied Bluetooth permissions
        // console.log('Bluetooth permissions denied');
        // You may want to display a message to the user or provide alternative functionality.
      }
    } catch (err) {
      console.warn(err);
    }
  }

  useEffect(() => {
    handleLocationPermission();

    BleManager.enableBluetooth().then(() => {
      // console.log('Bluetooth is turned on!');
    });

    BleManager.start({showAlert: false}).then(() => {
      // console.log('BleManager initialized');
      // requestBluetoothPermissions();
      handleGetConnectedDevices();
    });

    let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        peripherals.set(peripheral.id, peripheral);
        setDiscoveredDevices(Array.from(peripherals.values()));
      },
    );

    let stopConnectListener = BleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      peripheral => {
        // console.log('BleManagerConnectPeripheral:', peripheral);
      },
    );

    let stopScanListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        // console.log('scan stopped');
      },
    );

    return () => {
      stopDiscoverListener.remove();
      stopConnectListener.remove();
      stopScanListener.remove();
    };
  }, []);

  const scan = () => {
    if (!isScanning) {
      BleManager.scan([], 10, true)
        .then(() => {
          // console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const connect = peripheral => {
    // console.log('peripheral.Name -', peripheral.advertising.localName);
    console.log('peripheral -', peripheral);
    BleManager.createBond(peripheral.id)
      .then(() => {
        console.log('BLE device paired successfully');
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        let devices = Array.from(peripherals.values());
        setConnectedDevices(Array.from(devices));
        setDiscoveredDevices(Array.from(devices));
      })
      .catch(() => {
        // throw Error('failed to bond');
      });
  };

  const disconnect = peripheral => {
    BleManager.removeBond(peripheral.id)
      .then(() => {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        let devices = Array.from(peripherals.values());
        setConnectedDevices(Array.from(devices));
        setDiscoveredDevices(Array.from(devices));
        Alert.alert(`Disconnected from ${peripheral.name}`);
      })
      .catch(() => {
        throw Error('fail to remove the bond');
      });
  };

  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // console.log('discoveredDevices', discoveredDevices);
  // console.log('connectedDevices', connectedDevices);
  return (
    <SafeAreaView style={[backgroundStyle, styles.container]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{paddingHorizontal: 20}}>
        <Text style={[styles.title, {color: Colors.white}]}>
          React Native BLE - Raspberry PiPico
        </Text>
        <TouchableOpacity
          onPress={scan}
          activeOpacity={0.5}
          style={styles.scanButton}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
          </Text>
        </TouchableOpacity>

        {/* <View>
          <Button
            title="Connect"
            onPress={() => Alert.alert('connect devices')}
          />
        </View> */}

        <Text style={[styles.subtitle, {color: Colors.white}]}>
          Discovered Devices:
        </Text>
        {discoveredDevices.length > 0 ? (
          <FlatList
            data={discoveredDevices}
            renderItem={({item}) => (
              <DeviceList
                peripheral={item}
                connect={connect}
                disconnect={disconnect}
              />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={styles.noDevicesText}>No Bluetooth devices found</Text>
        )}

        <Text
          style={[
            styles.subtitle,
            {color: Colors.white},
            // {color: isDarkMode ? Colors.white : Colors.black},
          ]}>
          Connected Devices:
        </Text>
        {connectedDevices.length > 0 ? (
          <FlatList
            data={connectedDevices}
            renderItem={({item}) => (
              <DeviceList
                peripheral={item}
                connect={connect}
                disconnect={disconnect}
              />
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={styles.noDevicesText}>No connected devices</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BluetoothApp;
