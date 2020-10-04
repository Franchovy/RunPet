import React from 'react';
import AppleHealthKit from 'rn-apple-healthkit';
import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

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
      <TouchableOpacity
        onPress={this.checkAccess}
        disabled={this.state.accessButtonDisabled}>
        <View
          style={[
            styles.button,
            this.state.accessButtonDisabled
              ? styles.buttonDisabled
              : styles.buttonEnabled,
          ]}>
          <Text
            style={
              this.state.accessButtonDisabled
                ? styles.buttonTextDisabled
                : styles.buttonTextEnabled
            }>
            {this.state.accessButtonText}
          </Text>
        </View>
      </TouchableOpacity>
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

const styles = StyleSheet.create({
  button: {
    width: 300,
    height: 50,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  buttonEnabled: {
    borderColor: 'grey',
    backgroundColor: 'lightgrey',
  },
  buttonDisabled: {
    borderColor: 'lightgrey',
    backgroundColor: 'ghostwhite',
  },
  buttonTextEnabled: {
    fontSize: 18,
    color: 'dodgerblue',
  },
  buttonTextDisabled: {
    fontSize: 16,
    color: '#696969',
  },
});
