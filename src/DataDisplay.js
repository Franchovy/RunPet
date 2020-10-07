import React from 'react';
import {Button, Text, View} from 'react-native';

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
            marginBottom: 15,
            marginHorizontal: 10,
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 30, fontWeight: 'bold', marginBottom: 5}}>
            {item.data}
          </Text>
          <Text style={{fontSize: 25, fontWeight: 'bold', marginBottom: 5}}>
            {item.name}
          </Text>
          <Text style={{fontSize: 14}}>{item.label}</Text>
          <Text
            style={[
              {fontSize: 25, fontWeight: 'bold', marginBottom: 5},
              this.getPercentColor(item.percentage),
            ]}>
            {item.percentage}
            {item.percentage ? '%' : ''}
          </Text>
          <Text style={{fontSize: 14}}>{item.percentage ? 'of today\'s ' + item.name : ''}</Text>
        </View>
      );
    });
  }

  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 10,
        }}>
        {this.renderData()}
      </View>
    );
  }
}
