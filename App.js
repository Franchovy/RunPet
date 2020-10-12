/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  View,
  StatusBar,
  Text,
  PixelRatio,
  ActivityIndicator,
} from 'react-native';
import Amplify, {API, Auth, graphqlOperation} from 'aws-amplify';
import {withAuthenticator} from 'aws-amplify-react-native';
import awsconfig from './src/aws-exports';
Amplify.configure(awsconfig);
import EStyleSheet from 'react-native-extended-stylesheet';
import {createData, createUser} from './src/graphql/mutations';
import {getData, getUser} from './src/graphql/queries';
import AppleHealthKit from 'rn-apple-healthkit';

import {RunButton} from './src/RunButton';
import {DataDisplay} from './src/DataDisplay';
import {StoreData} from './src/StoreData';

import {AmplifyTheme} from 'aws-amplify-react';
import {getID} from './src/StoreData';

const authTheme = {
  ...AmplifyTheme,
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    color: 'red',
  },
  formSection: {
    ...AmplifyTheme.formSection,
    backgroundColor: 'green',
  },
  sectionFooter: {
    ...AmplifyTheme.sectionFooter,
    backgroundColor: 'purple',
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: 'blue',
  },
};

const {width} = Dimensions.get('window');
const rem = width / 45;
console.log(rem);

const signUpConfig = {
  header: 'My Customized Sign Up',
  hideAllDefaults: true,
  defaultCountryCode: '44',
};

class App extends React.Component {
  state = {
    hasHealthDataAccess: false,
    loading: true,
    displayAccessHealthDataButton: false,
    accessButtonText: 'Check for Health Data Access',
    sendDataButtonDisabled: true,
    sendDataButtonText: 'Update Data',
    distanceUnitMiles: true,
    todaysData: {
      stepCount: -1,
      calories: -1,
      distance: -1.0,
    },
    lastWeekData: {
      stepCount: -1,
      calories: -1,
      distance: -1.0,
    },
  };

  constructor(props) {
    super(props);

    EStyleSheet.build({ // always call EStyleSheet.build() even if you don't use global variables!
      $rem: rem,
    });

    this.storage = new StoreData();
    this.defaultHealthDataOptions = {
      permissions: {
        read: ['StepCount', 'DistanceWalkingRunning', 'ActiveEnergyBurned'],
      },
    };

    (async () => {
      // Get data about current login session / authenticated user
      let user = await Auth.currentAuthenticatedUser();
      this.username = user.username;
      this.email = user.attributes.email;

      // Check ID already stored if there is one
      let id = await this.storage.getID();
      if (id !== null) {
        this.id = await this.checkID(id, this.username, this.email);
        if (this.id !== id) {
          // Save new ID
          await (async () => {
            let result = await this.storage.storeID(this.id);
            console.log('Stored ID. + ' + JSON.stringify(result));
          })();
        } else {
          console.log('Using ID: ' + id);
        }
      } else {
        console.log('No ID found. Creating new'); //todo check online for email addr.
        await this.initUser(this.username, this.email)
          .then((result) => {
            console.log('Uploaded new user with ID: ' + this.id);
            (async () => {
              let result = await this.storage.storeID(this.id);
              console.log('Stored ID. + ' + JSON.stringify(result));
            })();
          })
          .catch((error) => {
            alert('Error syncing account!');
          });
      }

      // Check if access had previously been granted
      if (this.storage.hasHealthDataAccess()) {
        // Check permissions for apple health
        await this.checkHealthDataAccessPrompt();

        // Get data for the previous week
        let todayDate = new Date();
        for (let i = 1; i < 8; i++) {
          let date = new Date();
          date.setDate(todayDate.getDate() - i);

          API.graphql(
            graphqlOperation(getData, {
              ID: this.id,
              date: this.AWSFormatString(todayDate),
            }),
          )
            .then((result) => {
              (async () => {
                if (result.data.getData === null) {
                  console.log(
                    'Uploading data for day: ' + ' : ' + JSON.stringify(result),
                  );
                  await this.uploadDataForDate(date);
                } else {
                  console.log('Data for day: ' + ' : ' + JSON.stringify(result));
                }
              })();
            })
            .catch((error) => {
              (async () => {
                if (Object.keys(error).length === 0) {
                  await this.uploadDataForDate(date);
                } else {
                  console.error(
                    'Error checking data: ' + JSON.stringify(error),
                  );
                }
              })();
            });
        }

        // Load health data for previous week
        if (this.state.hasHealthDataAccess) {
          console.log('Access button pressed');
          this.accessButtonPressed();
        }
      } else {
        // Display access health data button if no access currently
        this.setState({displayAccessHealthDataButton: false});
      }
    })();
  }

  async initUser(username: String, email: String): Promise {
    await API.graphql(
      graphqlOperation(createUser, {
        input: {username: username, email: email},
      }),
    )
      .then((result) => {
        this.id = result.data.createUser.ID;
        console.log('New ID: ' + this.id);
      })
      .catch((error) => {
        console.log('Failed to initialise user');
      });
  }

  /**
   * Checks for user online - if there isn't one it creates anew.
   * @param id ID to check whether present
   * @param username that is used with cognito account
   * @param email that is used with cognito account
   * @returns Promise containing ID, new ID or error upon creation.
   */
  async checkID(id: String, username: String, email: String) {
    return new Promise((resolve, reject) => {
      API.graphql(
        graphqlOperation(getUser, {
          ID: id,
        }),
      )
        .then((result) => {
          if (
            result.data.getUser.email === email &&
            result.data.getUser.username === username
          ) {
            console.log('Confirmed account on cloud.');
            resolve(id);
            return;
          }
          reject('ID mismatching!');
        })
        .catch((error) => {
          if (Object.keys(error).length !== 0) {
            // Error fetching data
            console.error('ERROR: ID unconfirmed');
            console.error(JSON.stringify(error));
            reject('Could not confirm ID');
          } else {
            // Create account on cloud
            console.log('Creating new user');
            (async () => {
              await API.graphql(
                graphqlOperation(createUser, {
                  input: {ID: id, username: username, email: email},
                }),
              )
                .then((result) => {
                  console.log('NEW ACCOUNT CREATED: ' + JSON.stringify(result));
                  resolve(result.data.createUser.ID);
                })
                .catch((error) => {
                  console.log("COULDN'T CREATE NEW ACCOUNT");
                  reject('Could not create new account');
                });
            })();
          }
        });
    });
  }

  async uploadDataForDate(date: Date) {
    console.log('No data for day: ' + date + ', uploading data.');
    let dayData = await this.calculateDailyData(date);

    API.graphql(
      graphqlOperation(createData, {
        input: {
          ID: this.id,
          date: this.AWSFormatString(date),
          stepCount: dayData.stepCount,
          distance: dayData.distance,
          calories: dayData.calories,
        },
      }),
    )
      .then((result) => {
        console.log('Successfully uploaded data for ' + date);
      })
      .catch((error) => {
        console.log(
          'Error uploading data for ' + date + ': ' + JSON.stringify(error),
        );
      });
  }

  async checkHealthDataAccessPrompt() {
    let healthDataAccessEnabled = this.storage.hasHealthDataAccess();
    // Check if Health data access is granted
    // Request permission
    AppleHealthKit.initHealthKit(
      this.defaultHealthDataOptions,
      (error, result) => {
        if (error) {
          healthDataAccessEnabled = false;
        }
        if (healthDataAccessEnabled) {
          this.getStepCount({})
            .then((result) => {
              healthDataAccessEnabled = true;
            })
            .catch((error) => {
              healthDataAccessEnabled = false;
            });
        }
      },
    );

    if (!healthDataAccessEnabled) {
      Alert.alert(
        'Permissions not granted!',
        'Please go to settings to allow access to Apple Health.',
      );
    } else {
      console.log('Health Data Access enabled');
    }
    await this.storage
      .setHasHealthDataAccess(healthDataAccessEnabled)
      .then(() => {
        console.log('Saved healthDataAccess value: ' + healthDataAccessEnabled);
      })
      .catch((error) => {
        console.log('error writing to storage!');
      });
    this.setState({
      hasHealthDataAccess: healthDataAccessEnabled,
    });
  }

  async getCalories(dateOptionsPeriod): Promise {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getActiveEnergyBurned(dateOptionsPeriod, (err, res) => {
        if (err) {
          if (err.message.startsWith('No data available')) {
            console.log(
              'Error: No calories data available for ' +
                dateOptionsPeriod.startDate +
                ' - ' +
                dateOptionsPeriod.endDate,
            );
          } else {
            console.log('Calories error.');
          }
          return reject(err);
        }
        if (res.length === 0) {
          console.log(
            'Returned no Calorie data for ' +
              dateOptionsPeriod.startDate +
              ' - ' +
              dateOptionsPeriod.endDate,
          );
          return reject();
        }
        resolve(parseInt(res[0].value));
      });
    });
  }

  async getDistance(dateOptions, unitOptions): Promise {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getDistanceWalkingRunning(
        {...unitOptions, ...dateOptions},
        (err, res) => {
          if (err) {
            if (err.message.startsWith('No data available')) {
              console.log(
                'Error: No distance data available for ' + dateOptions.date,
              );
            } else {
              console.log('Distance error.');
            }

            return reject(err);
          }
          resolve(parseFloat(res.value));
        },
      );
    });
  }

  async getStepCount(dateOptions): Promise {
    return new Promise((resolve, reject) => {
      AppleHealthKit.getStepCount(dateOptions, (err, res) => {
        if (err) {
          if (err.message.startsWith('No data available')) {
            console.log(
              'Error: No step count data available for ' + dateOptions.date,
            );
          } else {
            console.log('Step count error.');
          }
          return reject(err);
        }
        resolve(parseInt(res.value));
      });
    });
  }

  async calculateDailyData(date: Date): Promise {
    return new Promise((resolve, reject) => {
      date.setHours(0, 0, 0, 0);
      let dateOptionsDay = {
        date: date.toISOString(),
      };
      let startDate = new Date(date);
      startDate.setDate(date.getDate());
      let endDate = new Date(date);
      endDate.setDate(date.getDate() + 1);
      console.log(
        'Start date: ' +
          startDate.toISOString() +
          ' End date: ' +
          endDate.toISOString(),
      );
      let dateOptionsPeriod = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      (async () => {
        // Get step count
        let stepCount = await this.getStepCount(dateOptionsDay);
        // Get distance walked
        let distance = await this.getDistance(dateOptionsDay, {unit: 'mile'});
        // Get Calories burned
        let calories = await this.getCalories(dateOptionsPeriod);
        resolve({
          stepCount: stepCount,
          distance: distance,
          calories: calories,
        });
      })();
    });
  }

  async calculateAverageWeeklyData() {
    return new Promise((resolve, reject) => {
      // Calculate last week's average data
      let sumData = {stepCount: 0, distance: 0.0, calories: 0};
      (async () => {
        let todayDate = new Date();
        for (let i = 1; i < 8; i++) {
          let date = new Date();
          date.setDate(todayDate.getDate() - i);
          let dayData = await this.calculateDailyData(date);
          sumData.stepCount += dayData.stepCount;
          sumData.distance += dayData.distance;
          sumData.calories += dayData.calories;
          console.log(
            'Steps: ' +
              dayData.stepCount +
              ' Distance: ' +
              dayData.distance +
              ' Calories: ' +
              dayData.calories,
          );
        }
        // Calculate average data
        sumData.stepCount = this.roundTo(sumData.stepCount / 7, 0);
        sumData.distance = this.roundTo(sumData.distance / 7, 1);
        sumData.calories = this.roundTo(sumData.calories / 7, 0);
        console.log(
          'Average data: ' +
            sumData.stepCount +
            ' ' +
            sumData.distance +
            ' ' +
            sumData.calories,
        );
        resolve(sumData);
      })();
    });
  }

  async updateTodaysData() {
    let todaysData = await this.calculateDailyData(new Date());

    this.setState({
      todaysData: {
        stepCount: todaysData.stepCount,
        distance: todaysData.distance,
        calories: todaysData.calories,
      },
    });
  }

  async updateWeeklyData() {
    let averageWeeklyData = await this.calculateAverageWeeklyData();

    this.setState({
      lastWeekData: {
        stepCount: averageWeeklyData.stepCount,
        distance: averageWeeklyData.distance,
        calories: averageWeeklyData.calories,
      },
    });
  }

  accessButtonPressed() {
    if (!this.state.hasHealthDataAccess) {
      this.checkHealthDataAccessPrompt().catch((error) => {
        this.setState({
          accessButtonText: 'Missing access - Please change settings',
          accessButtonDisabled: false,
          sendDataButtonDisabled: true,
          hasHealthDataAccess: false,
        });
        console.warn(JSON.stringify(error));
      });
      if (!this.state.hasHealthDataAccess) {
        console.log('No health access.');
        return;
      }
    }

    AppleHealthKit.initHealthKit(
      this.defaultHealthDataOptions,
      (error, result) => {
        if (error) {
          console.log('Health Data Access not granted!');
          this.state.loading = false;
          return;
        }
        this.setState({
          accessButtonText: 'Access granted, Thank you.',
          accessButtonDisabled: true,
          sendDataButtonDisabled: false,
          hasHealthDataAccess: true,
        });

        (async () => {
          await this.updateTodaysData();
          await this.updateWeeklyData();
          this.setState({loading: false, displayAccessHealthDataButton: false});
        })();
      },
    );
  }

  async sendDataButtonPressed() {
    this.setState({loading: true});

    await API.graphql(
      graphqlOperation(createData, {
        input: {
          ID: this.id,
          date: this.AWSFormatString(new Date()),
          distance: this.state.todaysData.distance,
          stepCount: this.state.todaysData.stepCount,
          calories: this.state.todaysData.calories,
        },
      }),
    )
      .then(
        (result) => {
          console.log('Testing: ');
          console.log(result);
        },
        (error) => {
          console.log('Error: ');
          console.log(error);
        },
      )
      .finally(() => {
        this.setState({loading: false});
      });
  }

  displayData() {
    return (
      <View style={{alignItems: 'center'}}>
        <View style={{margin: 10}}>
          <Text style={styles.dataDisplayText}>Over last week you averaged:</Text>
        </View>
        <DataDisplay
          arr={[
            {
              name:
                this.state.lastWeekData.stepCount.valueOf() === 1
                  ? 'Step'
                  : 'Steps',
              label: 'per day',
              data: this.state.lastWeekData.stepCount,
            },
            {
              name:
                this.state.lastWeekData.calories.valueOf() === 1
                  ? 'Calorie'
                  : 'Calories',
              label: 'per day',
              data: this.state.lastWeekData.calories,
            },
            {
              name:
                this.state.lastWeekData.distance.valueOf() === 1.0
                  ? 'Mile'
                  : 'Miles',
              label: 'per day',
              data: this.roundTo(this.state.lastWeekData.distance, 1),
            },
          ]}
        />
        <View style={{margin: 10}}>
          <Text style={styles.dataDisplayText}>Today you've completed:</Text>
        </View>
        <DataDisplay
          displayPercentage={true}
          arr={[
            {
              name:
                this.state.todaysData.stepCount.valueOf() === 1
                  ? 'Step'
                  : 'Steps',
              percentage:
                this.roundTo(
                  this.state.todaysData.stepCount /
                    this.state.lastWeekData.stepCount,
                  2,
                ) * 100,
              data: this.state.todaysData.stepCount,
            },
            {
              name:
                this.state.todaysData.calories.valueOf() === 1
                  ? 'Calorie'
                  : 'Calories',
              percentage:
                this.roundTo(
                  this.state.todaysData.calories /
                    this.state.lastWeekData.calories,
                  2,
                ) * 100,
              data: this.state.todaysData.calories,
            },
            {
              name:
                this.state.todaysData.distance.valueOf() === 1.0
                  ? 'Mile'
                  : 'Miles',
              percentage: this.roundTo(
                (this.state.todaysData.distance /
                  this.state.lastWeekData.distance) *
                  100,
                0,
              ),
              data: this.roundTo(this.state.todaysData.distance, 1),
            },
          ]}
        />
      </View>
    );
  }

  AWSFormatString(date: Date): String {
    let dateString = date.toISOString();
    return dateString.slice(0, dateString.lastIndexOf('T'));
  }

  roundTo(number: number, numDecimalPlaces: number): number {
    return Number(number.toFixed(numDecimalPlaces));
  }

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}>
          <Image
            style={{
              resizeMode: 'contain',
              width: '30%',
              height: '30%',
            }}
            source={require('./resources/image.png')}
          />
          <Text style={styles.titleText}>RunPet</Text>
          {this.state.displayAccessHealthDataButton ? (
            <View>
              <RunButton
                buttonText={this.state.accessButtonText}
                disabled={this.state.accessButtonDisabled}
                onPress={() => this.accessButtonPressed()}
              />
            </View>
          ) : (
            <></>
          )}
          {this.state.hasHealthDataAccess ? (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator
                animating={this.state.loading}
                style={{marginBottom: PixelRatio.getPixelSizeForLayoutSize(5)}}
              />
              {this.displayData()}
            </View>
          ) : (
            <></>
          )}
        </View>
      </>
    );
  }
}

export default withAuthenticator(App, {
  signUpConfig: signUpConfig,
  theme: authTheme,
});

const styles = EStyleSheet.create({
  titleText: {
    fontSize: '5.5rem',
    fontWeight: 'bold',
  },
  dataDisplayText: {
    fontSize: '2.0rem',
  },
});
