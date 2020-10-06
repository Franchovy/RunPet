import React from 'react';
import {Button, Text, View} from 'react-native';

export class DataDisplay extends React.Component {
  renderData() {
    return this.props.arr.map((item) => {
      return (
        <View key={item.name} style={{marginBottom: 15, marginHorizontal: 15, alignItems:'center'}}>
          <Text style={{fontSize: 30, fontWeight: 'bold', marginBottom: 5}}>
            {item.data}
          </Text>
          <Text style={{fontSize: 25, fontWeight: 'bold', marginBottom: 5}}>
            {item.name}
          </Text>
          <Text style={{fontSize: 14}}>{item.label}</Text>
        </View>
      );
    });
  }

  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 20,
        }}>
        {this.renderData()}
      </View>
    );
  }
}
