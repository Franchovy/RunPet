import AsyncStorage from '@react-native-community/async-storage';

export class StoreData {
  async storeID(userID: String): Promise {
    try {
      await AsyncStorage.setItem('ID', userID);
    } catch (e) {
      // saving error
      console.error('Error saving to device');
    }

    return AsyncStorage.setItem('ID', userID);
  }

  async getID(): String {
    try {
      return await AsyncStorage.getItem('ID');
    } catch (e) {
      // error reading value
      console.error('Error reading from device');
    }
  }

  async hasHealthDataAccess(): boolean {
    try {
      return (await AsyncStorage.getItem('healthDataAccessGranted')) === 'true';
    } catch (e) {
      // error
      console.error('Error reading from device');
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
      console.error('Error writing to device');
    }
  }

  async getLatestUploadDate(): Date {
    try {
      return await AsyncStorage.getItem('latestDate');
    } catch (e) {
      // error
      console.error('Error reading from device');
    }
  }

  async storeLatestUploadDate(latestDate: Date) {
    try {
      await AsyncStorage.setItem('latestDate', latestDate.toDateString());
    } catch (e) {
      // error
      console.error('Error writing to device');
    }
  }
}
