import AsyncStorage from '@react-native-community/async-storage';

export class StoreData {
  async storeID(userID: String): Promise {
    try {
      await AsyncStorage.setItem('ID', userID);
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

  async hasHealthDataAccess(): boolean {
    try {
      return (await AsyncStorage.getItem('healthDataAccessGranted')) === 'true';
    } catch (e) {
      // error
      alert('Error reading from device');
    }
  }

  async setHasHealthDataAccess(hasAccess: boolean) {
    try {
      await AsyncStorage.setItem(
        'healthDataAccessGranted',
        hasAccess ? 'true' : 'false',
      );
    } catch (e) {
      // error
      alert('Error writing to device');
    }
  }
}
