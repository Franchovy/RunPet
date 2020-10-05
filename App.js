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
import awsconfig from './src/aws-exports';
Amplify.configure(awsconfig);
import {createData} from './src/graphql/mutations';
import {getData} from './src/graphql/queries';
import AppleHealthKit from 'rn-apple-healthkit';

export default class App extends React.Component {
  state = {
    hasHealthDataAccess: false,
    loading: false,
    accessButtonDisabled: false,
    accessButtonText: 'Check for Health Data Access',
    sendDataButtonDisabled: true,
    sendDataButtonText: 'Update Data',
    todaysData: {
      stepCount: -1,
      calories: -1,
      distance: -1.0,
    },
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

            AppleHealthKit.getStepCount(null, (err, res) => {
              if (err) {
                return;
              }
              console.log('Step count: ' + res.value);
              this.state.todaysData.stepCount = res;
            });
            let distanceOptions = {unit: 'mile'};
            AppleHealthKit.getDistanceWalkingRunning(
              distanceOptions,
              (err, res) => {
                if (err) {
                  return;
                }
                console.log('Distance: ' + res.value);
                this.state.todaysData.distance = res;
              },
            );
            let today = new Date();
            let yesterday = new Date(today.getDate() - 1);
            let options = {
              startDate: yesterday.toISOString(), // required
              endDate: today.toISOString(), // optional; default now
            };
            AppleHealthKit.getActiveEnergyBurned(options, (err, res) => {
              if (err) {
                console.log('Error: ' + res);
                return;
              }
              console.log('Calories: ' + res[0].value);
              this.state.todaysData.calories = res;
            });

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

    await API.graphql(
      graphqlOperation(createData, {
        input: {
          userid: 'johnny',
          date: '2020-10-04',
        },
      }),
    )
      .then(
        (result) => {
          console.log('Testing: ');
          console.log(result);
        },
        (error) => {
          console.log('Error: ');
          console.log(error);
        },
      )
      .finally(() => {
        this.setState({loading: false});
      });
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
          <Text style={{fontSize: 40, fontWeight: 'bold', marginBottom: 50}}>
            RunPet
          </Text>
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
        </View>
      </>
    );
  }
}
