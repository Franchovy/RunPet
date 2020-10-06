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
import Amplify, {API, graphqlOperation} from 'aws-amplify';
import awsconfig from './src/aws-exports';
Amplify.configure(awsconfig);
import {createData} from './src/graphql/mutations';
import {getData} from './src/graphql/queries';

import AppleHealthKit from 'rn-apple-healthkit';

import {RunButton} from './src/RunButton';
import {DataDisplay} from './src/DataDisplay';

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
            let today = new Date();
            let yesterday = new Date(today.getDate() - 1);
            let options = {
              startDate: yesterday.toISOString(), // required
              endDate: today.toISOString(), // optional; default now
            };

            AppleHealthKit.getStepCount(options, (err, res) => {
              if (err) {
                console.log('Get step count error: ' + err);
                return;
              }
              console.log('Step count: ' + res.value);

              this.setState({
                todaysData: {
                  stepCount: parseInt(res.value),
                  calories: this.state.todaysData.calories,
                  distance: this.state.todaysData.distance,
                },
              });
            });
            let distanceOptions = {
              unit: 'mile',
            };
            AppleHealthKit.getDistanceWalkingRunning(
              distanceOptions,
              (err, res) => {
                if (err) {
                  console.log('Get distance error: ' + err);
                  return;
                }
                console.log('Distance: ' + res.value);

                this.setState({
                  todaysData: {
                    stepCount: this.state.todaysData.stepCount,
                    calories: this.state.todaysData.calories,
                    distance: parseFloat(res.value),
                  },
                });
              },
            );
            AppleHealthKit.getActiveEnergyBurned(options, (err, res) => {
              if (err) {
                console.log('Get Calories error: ' + res);
                return;
              }
              console.log('Calories: ' + res[0].value);

              this.setState({
                todaysData: {
                  stepCount: this.state.todaysData.stepCount,
                  calories: parseInt(res[0].value),
                  distance: this.state.todaysData.distance,
                },
              });
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
          date: this.AWSFormatString(new Date()),
          distance: this.state.todaysData.distance,
          stepCount: this.state.todaysData.stepCount,
          calories: this.state.todaysData.calories,
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

  AWSFormatString(date: Date): String {
    let dateString = date.toISOString();
    return dateString.slice(0, dateString.lastIndexOf('T'));
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
          <DataDisplay
            arr={[
              {
                name:
                  this.state.todaysData.stepCount.valueOf() == 1
                    ? 'Step'
                    : 'Steps',
                label: 'per day',
                data: this.state.todaysData.stepCount,
              },
              {
                name:
                  this.state.todaysData.calories.valueOf() == 1
                    ? 'Calorie'
                    : 'Calories',
                label: 'per day',
                data: this.state.todaysData.calories,
              },
              {
                name:
                  this.state.todaysData.distance.valueOf() == 1.0
                    ? 'Mile'
                    : 'Miles',
                label: 'per day',
                data: this.state.todaysData.distance,
              },
            ]}
          />
        </View>
      </>
    );
  }
}
