/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Alert, Button, View, StyleSheet, StatusBar, Text} from 'react-native';
import {AccessButton, SendDataButton} from './src/HealthDataButton';
import Amplify, {API, graphqlOperation} from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

export default class App extends React.Component {
  render() {
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
          <AccessButton/>
          <SendDataButton/>
          <View
            style={{
              width: 250,
              height: 50,
              borderRadius: 5,
              backgroundColor: 'steelblue',
            }}
          />
        </View>
      </>
    );
  }
}
