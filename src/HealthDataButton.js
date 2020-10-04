import React from 'react';
import AppleHealthKit from 'rn-apple-healthkit';
import {Alert, Button} from 'react-native';

export class AccessButton extends React.Component {
  state = {
    accessButtonDisabled: false,
    accessButtonText: 'Check Health Data Access',
    hasHealthDataAccess: false,
  };

  constructor(props) {
    super(props);

    this.defaultHealthDataOptions = {
      permissions: {
        read: ['StepCount', 'DistanceWalkingRunning', 'ActiveEnergyBurned'],
      },
    };

    this.checkAccess = this.checkAccess.bind(this);
  }

  checkAccess = () => {
    if (!this.state.hasHealthDataAccess) {
      this.setState({
        hasHealthDataAccess: AppleHealthKit.initHealthKit(
          this.defaultHealthDataOptions,
          (error, result) => {
            if (error) {
              alert('No data access!');
              this.state.accessButtonText =
                'Missing access - Please change settings';
              return;
            }
            alert('Access granted');
            this.setState({
              accessButtonText: 'Access granted, Thank you.',
              accessButtonDisabled: true,
            });
          },
        ),
      });
    }
  };

  render() {
    return (
      <Button
        title={this.state.accessButtonText}
        onPress={this.checkAccess}
        disabled={this.state.accessButtonDisabled}
      />
    );
  }
}

export class SendDataButton extends React.Component {
  testAlert() {
    alert('alert!');
  }

  render() {
    return <Button title={'Update online data'} onPress={() => alert()} />;
  }
}
