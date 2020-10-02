/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Alert, Button, View, StyleSheet, StatusBar, Text} from 'react-native';

const App: () => React$Node = () => {
  function checkAccess() {
    Alert.alert('test');
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}>
        <Button onPress={() => checkAccess()} title="test" />
        <View style={{width: 50, height: 50, backgroundColor: 'skyblue'}} />
        <View style={{width: 50, height: 50, backgroundColor: 'steelblue'}} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00aeef',
    borderColor: 'skyblue',
    borderWidth: 5,
    borderRadius: 15,
  },
});

export default App;
