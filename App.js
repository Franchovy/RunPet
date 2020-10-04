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
import AppleHealthKit from 'rn-apple-healthkit';
Amplify.configure(awsconfig);

export default class App extends React.Component {
  state = {
    hasHealthDataAccess: false,
    accessButtonDisabled: false,
    accessButtonText: 'Check for Health Data Access',
  };

  constructor(props) {
    super(props);

    this.defaultHealthDataOptions = {
      permissions: {
        read: ['StepCount', 'DistanceWalkingRunning', 'ActiveEnergyBurned'],
      },
    };

    // TODO check if health data is already available
  }

  accessButtonPressed() {
    if (!this.state.hasHealthDataAccess) {
      this.setState({
        hasHealthDataAccess: AppleHealthKit.initHealthKit(
          this.defaultHealthDataOptions,
          (error, result) => {
            if (error) {
              this.state.accessButtonText =
                'Missing access - Please change settings';
              return;
            }
            this.setState({
              accessButtonText: 'Access granted, Thank you.',
              accessButtonDisabled: true,
            });
          },
        ),
      });
    }
  }

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
          <AccessButton
            buttonText={this.state.accessButtonText}
            disabled={this.state.accessButtonDisabled}
            onPress={() => this.accessButtonPressed()}
          />
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
