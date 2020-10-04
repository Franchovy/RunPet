import React from 'react';
import AppleHealthKit from 'rn-apple-healthkit';
import {Alert, Button} from 'react-native';

export class HealthDataButton extends React.Component {
  constructor(props) {
    super(props);

    this.defaultHealthDataOptions = {
      permissions: {
        read: ['StepCount', 'DistanceWalkingRunning', 'ActiveEnergyBurned'],
      },
    };
    this.hasHealthDataAccess = AppleHealthKit.initHealthKit(
      this.defaultHealthDataOptions,
      (error, result) => {
        if (error) {
          alert('No data access!');
        }
      },
    );
  }

  sendAlert() {
    Alert.alert('Alert!');
  }

  render() {
    return <Button title={'Check data access'} onPress={() => this.sendAlert()} />;
  }
}
