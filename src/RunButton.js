import React from 'react';
import AppleHealthKit from 'rn-apple-healthkit';
import {Button, PixelRatio, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export class RunButton extends React.Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        disabled={this.props.disabled}>
        <View
          style={[
            styles.button,
            this.props.disabled ? styles.buttonDisabled : styles.buttonEnabled,
          ]}>
          <Text
            style={
              this.props.disabled
                ? styles.buttonTextDisabled
                : styles.buttonTextEnabled
            }>
            {this.props.buttonText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: PixelRatio.getPixelSizeForLayoutSize(150),
    height: PixelRatio.getPixelSizeForLayoutSize(25),
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
