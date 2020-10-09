import AsyncStorage from '@react-native-community/async-storage';

export class StoreData {
  state = {
    hasID: false,
    unitMiles: true,
  };

  init() {
    (async () => {
      let IDpromise = await AsyncStorage.getItem('ID');
      IDpromise.then((result) => {
        console.log('retreived ID from storage: ' + JSON.stringify(result));
      }).catch((error) => {
        console.log('Error: ' + JSON.stringify(error));
      });
    })();
    (async () => {
      let UnitPromise = await AsyncStorage.getItem('UnitMiles');
      UnitPromise.then((result) => {
        console.log('Retreived unit from storage: ' + JSON.stringify(result));
      }).catch((error) => {
        console.log('Error: ' + JSON.stringify(error));
      });
    })();
  }

  async storeID(userID: String): Promise {
    try {
      await AsyncStorage.setItem('@storage_Key', userID);
    } catch (e) {
      // saving error
      alert('Error saving to device');
    }

    return AsyncStorage.setItem('ID', userID);
  }

  async getID(): String {
    try {
      return await AsyncStorage.getItem('ID');
    } catch (e) {
      // error reading value
      alert('Error reading from device');
    }
  }
}
