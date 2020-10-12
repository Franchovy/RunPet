import React from 'react';
import {Button, PixelRatio, Text, View} from 'react-native';

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
            marginBottom: PixelRatio.getPixelSizeForLayoutSize(7),
            marginHorizontal: 10,
            alignItems: 'center',
          }}>
          <Text style={{fontSize: PixelRatio.getPixelSizeForLayoutSize(15), fontWeight: 'bold', marginBottom: PixelRatio.getPixelSizeForLayoutSize(2)}}>
            {item.data}
          </Text>
          <Text style={{fontSize: PixelRatio.getPixelSizeForLayoutSize(12), fontWeight: 'bold', marginBottom: PixelRatio.getPixelSizeForLayoutSize(2)}}>
            {item.name}
          </Text>
          <Text style={{fontSize: PixelRatio.getPixelSizeForLayoutSize(7)}}>{item.label}</Text>
          <Text
            style={[
              {fontSize: PixelRatio.getPixelSizeForLayoutSize(13), fontWeight: 'bold', marginBottom: 5},
              this.getPercentColor(item.percentage),
            ]}>
            {item.percentage}
            {item.percentage ? '%' : ''}
          </Text>
          <Text style={{fontSize: PixelRatio.getPixelSizeForLayoutSize(7)}}>{item.percentage ? 'of today\'s ' + item.name : ''}</Text>
        </View>
      );
    });
  }

  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: PixelRatio.getPixelSizeForLayoutSize(5),
        }}>
        {this.renderData()}
      </View>
    );
  }
}
