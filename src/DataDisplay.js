import React from 'react';
import {Button, PixelRatio, Text, View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export class DataDisplay extends React.Component {
  getPercentColor(percentage: number): any {
    if (percentage < 30) {
      return {color: '#A52A2A'};
    } else if (percentage < 50) {
      return {color: '#FF8C00'};
    } else if (percentage < 90) {
      return {color: '#FFD700'};
    } else if (percentage < 100) {
      return {color: '#008000'};
    } else if (percentage >= 100) {
      return {color: '#7CFC00'};
    } else {
      return {color: '#000000'};
    }
  }

  renderData() {
    return this.props.arr.map((item) => {
      return (
        <View
          key={item.name}
          style={{
            width: '35%',
            justifyContent: 'space-between',
            marginBottom: '1%',
            alignItems: 'center',
          }}>
          <Text style={styles.textData}>
            {item.data}
          </Text>
          <Text style={styles.textLabel}>
            {item.name}
          </Text>
          <Text style={styles.textSubText}>{item.label}</Text>
          <Text
            style={[
              styles.textPercentage,
              this.getPercentColor(item.percentageValue),
            ]}>
            {item.percentageValue}
            {item.showPercentage ? '%' : ''}
          </Text>
          <Text style={styles.textSubText}>{item.showPercentage ? 'of today\'s ' + item.name : ''}</Text>
        </View>
      );
    });
  }

  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: '1%',
          alignItems: 'flex-start',
        }}>
        {this.renderData()}
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  textPercentage: {
    fontSize: '4.0rem',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textSubText: {
    fontSize: '1.5rem',
  },
  textLabel: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: PixelRatio.getPixelSizeForLayoutSize(2),
  },
  textData: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: PixelRatio.getPixelSizeForLayoutSize(2),
  }
});
