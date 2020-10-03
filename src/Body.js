import React from 'react';
import AppleHealthKit from 'rn-apple-healthkit';
import {Button} from 'react-native';

export class Main extends React.Component {
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

  render() {
    return (
      <>
        <Button
          title={'Check data access'}
          onPress={alert('Has data: {}', this.hasHealthDataAccess)}
        />
      </>
    );
  }
}
