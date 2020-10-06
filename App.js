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
    distanceUnitMiles: true,
    todaysData: {
      stepCount: -1,
      calories: -1,
      distance: -1.0,
    },
    lastWeekData: {
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

  async calculateDailyData(dayEnd: Date): any {
    let dayStart = new Date(dayEnd.getDate() - 1);
    let dateOptionsday = {
      date: dayEnd.toISOString(),
    };
    let dateOptionsPeriod = {
      startDate: dayStart.toISOString(),
      endDate: dayEnd.toISOString(),
    };
    // Get step count
    AppleHealthKit.getStepCount(dateOptionsday, (err, res) => {
      if (err) {
        console.log('Get step count today error: ' + err);
        return;
      }
      parseInt(res.value);
    });
    // Get distance walked
    AppleHealthKit.getDistanceWalkingRunning(
      {...{unit: 'mile'}, ...dateOptionsday},
      (err, res) => {
        if (err) {
          console.log('Get distance error: ' + err);
          return;
        }
        parseFloat(res.value);
      },
    );
    // Get Calories burned
    AppleHealthKit.getActiveEnergyBurned(
      dateOptionsPeriod,
      (err, res) => {
        if (err) {
          console.log('Get Calories error: ' + res);
          return;
        }
        if (res.length === 0) {
          console.log('Returned no Calorie data.');
          return;
        }
        parseInt(res[0].value);
      },
    );
    return {stepCount: 0, distance: 0, calories: 0};
  }

  async calculateWeeklyData() {
    // Calculate last week's average data
    for (let i = 1; i < 8; i++) {
      let date = new Date(new Date() - i);
      let dateOptions = {
        date: date.toISOString(),
      };
    }
  }

  async updateTodaysData() {
    let todaysData = await this.calculateDailyData(new Date());

    this.setState({
      todaysData: {
        stepCount: todaysData.stepCount,
        distance: todaysData.distance,
        calories: todaysData.calories,
      },
    });
  }

  async updateWeeklyData() {
    let weeklyData = await this.calculateWeeklyData();
  }

  accessButtonPressed() {
    if (!this.state.hasHealthDataAccess) {
      this.setState({
        accessButtonText: 'Missing access - Please change settings',
        accessButtonDisabled: false,
        sendDataButtonDisabled: true,
        hasHealthDataAccess: false,
      });

      AppleHealthKit.initHealthKit(
        this.defaultHealthDataOptions,
        (error, result) => {
          if (error) {
            console.log('Health Data Access not granted!');
            return;
          }
          this.setState({
            accessButtonText: 'Access granted, Thank you.',
            accessButtonDisabled: true,
            sendDataButtonDisabled: false,
            hasHealthDataAccess: true,
          });

          this.updateTodaysData();
          //this.updateWeeklyData();
        },
      );
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

  displayData() {
    return (
      <View style={{alignItems: 'center'}}>
        <View style={{margin: 10}}>
          <Text style={{fontSize: 20}}>Over the last week you averaged:</Text>
        </View>
        <DataDisplay
          arr={[
            {
              name:
                this.state.lastWeekData.stepCount.valueOf() === 1
                  ? 'Step'
                  : 'Steps',
              label: 'per day',
              data: this.state.lastWeekData.stepCount,
            },
            {
              name:
                this.state.lastWeekData.calories.valueOf() === 1
                  ? 'Calorie'
                  : 'Calories',
              label: 'per day',
              data: this.state.lastWeekData.calories,
            },
            {
              name:
                this.state.lastWeekData.distance.valueOf() === 1.0
                  ? 'Mile'
                  : 'Miles',
              label: 'per day',
              data: this.state.lastWeekData.distance,
            },
          ]}
        />
        <View style={{margin: 10}}>
          <Text style={{fontSize: 20}}>Your scores today:</Text>
        </View>
        <DataDisplay
          arr={[
            {
              name:
                this.state.todaysData.stepCount.valueOf() === 1
                  ? 'Step'
                  : 'Steps',
              label: 'per day',
              data: this.state.todaysData.stepCount,
            },
            {
              name:
                this.state.todaysData.calories.valueOf() === 1
                  ? 'Calorie'
                  : 'Calories',
              label: 'per day',
              data: this.state.todaysData.calories,
            },
            {
              name:
                this.state.todaysData.distance.valueOf() === 1.0
                  ? 'Mile'
                  : 'Miles',
              label: 'per day',
              data: this.state.todaysData.distance,
            },
          ]}
        />
      </View>
    );
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

          {this.displayData()}
        </View>
      </>
    );
  }
}
