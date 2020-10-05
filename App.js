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
            let steps = -2;
            let dist = -2.0;
            let cals = -2;

            AppleHealthKit.getStepCount(null, (err, res) => {
              if (err) {
                return;
              }
              console.log('Step count: ' + res.value);
              steps = parseInt(res.value);
            });
            let distanceOptions = {unit: 'mile'};
            AppleHealthKit.getDistanceWalkingRunning(
              distanceOptions,
              (err, res) => {
                if (err) {
                  return;
                }
                console.log('Distance: ' + res.value);
                dist = parseFloat(res.value);
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
              cals = parseInt(res[0].value);
              console.log('Calories: ' + cals);
            });

            this.setState({
              accessButtonText: 'Access granted, Thank you.',
              accessButtonDisabled: true,
              sendDataButtonDisabled: false,
              todaysData: {
                stepCount: steps,
                distance: dist,
                calories: cals,
              },
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
          <ActivityIndicator
            animating={this.state.loading}
            style={{marginBottom: 10}}
          />
          <View style={{margin: 10}}>
            <Text style={{fontSize: 20}}>Your scores today:</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              padding: 20,
            }}>
            <View style={{marginBottom: 15}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', margin: 10}}>
                Steps:{' '}
              </Text>
              <Text>{this.state.todaysData.stepCount} steps</Text>
            </View>
            <View style={{marginBottom: 15}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', margin: 10}}>
                Calories:{' '}
              </Text>
              <Text>{this.state.todaysData.calories} Cals</Text>
            </View>
            <View style={{marginBottom: 15}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', margin: 10}}>
                Distance:{' '}
              </Text>
              <Text>{this.state.todaysData.distance} mi.</Text>
            </View>
          </View>
        </View>
      </>
    );
  }
}
