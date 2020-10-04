/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  Alert,
  Button,
  View,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
} from 'react-native';
import {RunButton, SendDataButton} from './src/RunButton';
import Amplify, {API, graphqlOperation} from 'aws-amplify';
//import {createTodo, updateTodo, deleteTodo} from './src/graphql/mutations';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

import AppleHealthKit from 'rn-apple-healthkit';

export default class App extends React.Component {
  state = {
    hasHealthDataAccess: false,
    loading: false,
    accessButtonDisabled: false,
    accessButtonText: 'Check for Health Data Access',
    sendDataButtonDisabled: true,
    sendDataButtonText: 'Update Data',
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
              sendDataButtonDisabled: false,
            });
          },
        ),
      });
    }
  }

  async sendDataButtonPressed() {
    this.setState({loading: true});

    const todo = {name: 'My first todo', description: 'Hello world!'};

    /* create a todo */
    /*await API.graphql(graphqlOperation(createTodo, {input: todo}))
      .then((test) => {
        console.log('Testing: ');
        console.log(test.toString());
      })
      .catch()
      .finally(() => {
        this.setState({loading: false});
      });*/
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
          <RunButton
            buttonText={this.state.accessButtonText}
            disabled={this.state.accessButtonDisabled}
            onPress={() => this.accessButtonPressed()}
          />
          <RunButton
            buttonText={this.state.sendDataButtonText}
            disabled={this.state.sendDataButtonDisabled}
            onPress={() => this.sendDataButtonPressed()}
          />
          <ActivityIndicator animating={this.state.loading} />
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
