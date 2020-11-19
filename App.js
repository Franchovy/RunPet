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

import {HealthDataModel} from './src/models/HealthData.model';

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
      stepCount: 0,
      calories: 0,
      distance: 0.0,
    },
    lastWeekData: {
      stepCount: 0,
      calories: 0,
      distance: 0.0,
    },
  };

  constructor(props) {
    super(props);

    EStyleSheet.build({
      // always call EStyleSheet.build() even if you don't use global variables!
      $rem: rem,
    });

    this.storage = new StoreData();
    this.defaultHealthDataOptions = {
      permissions: {
        read: [
          'StepCount',
          'DistanceWalkingRunning',
          'ActiveEnergyBurned',
          'BasalEnergyBurned',
        ],
      },
    };

    let newLatestUploadDate = new Date();
    newLatestUploadDate.setDate(new Date().getDate() - 4);
    // Store today as the previous upload date
    this.storage.storeLatestUploadDate(newLatestUploadDate);

    (async () => {
      // Get data about current login session / authenticated user
      let user = await Auth.currentAuthenticatedUser();
      this.username = user.username;
      this.email = user.attributes.email;

      // Fetch ID from database using email
      let idResult = await API.graphql(
        //Data for the graphql query
        graphqlOperation(getUser, {
          email: this.email,
        }),
      );

      // Check if a user was found
      if (idResult.data.getUser == null) {
        // Initialise new user on the database
        console.log('Creating new user');
        await API.graphql(
          graphqlOperation(createUser, {
            input: {username: this.username, email: this.email},
          }),
        )
          .then((result) => {
            console.log('NEW ACCOUNT CREATED: ' + JSON.stringify(result));
            return {id: result.data.createUser.ID};
          })
          .catch((error) => {
            console.log("COULDN'T CREATE NEW ACCOUNT");
            console.error(error);
            return {error: error, message: 'Could not create new account'};
          });
      }
      if (idResult.data.getUser !== null) { /////////////////////////////
        this.userId = idResult.data.getUser.ID;
      }

      // Log ID being used
      console.log('Using ID: ' + this.userId);

      // Health Data access test
      await this.checkHealthDataAccessPrompt().then((result) => {
        (async () => {
          // Upload data since last upload
          if (result.access) {
            this.setState({hasHealthDataAccess: true});

            // Get last date
            let latestDateResult = await this.storage.getLatestUploadDate();
            let latestDate = new Date(latestDateResult);

            //Set latest date to one week ago by default
            if (latestDateResult === null) {
              latestDate = new Date();
              latestDate.setDate(new Date().getDate() - 14);
            }

            console.log('Latest upload on ' + JSON.stringify(latestDateResult));

            // Upload data since
            let todayDate = new Date();
            let numDaysToUpload = todayDate.getDate() - latestDate.getDate();

            // Iterate for each day needing an upload
            console.log('Num days to upload: ' + numDaysToUpload);
            for (let i = 0; i < numDaysToUpload; i++) {
              let date = new Date();
              date.setDate(todayDate.getDate() - i);

              // Upload data for date
              let healthData = {};
              healthData.date = date;

              // Get health data for date
              let dayData = await this.fetchDataForDay(healthData.date);
              healthData.stepCount = dayData.stepCount;
              healthData.distance = dayData.distance;
              healthData.calories = dayData.calories;

              // Set UserID to current user
              healthData.userId = this.userId;

              // Upload data
              await this.uploadDataForDate(dayData);
              console.log(healthData);
              //todo error handling here
            }
            let newLatestUploadDate = todayDate;
            newLatestUploadDate.setDate(new Date().getDate() - 1);
            // Store today as the previous upload date
            await this.storage.storeLatestUploadDate(newLatestUploadDate);

            // Load health data for previous week
            if (this.state.hasHealthDataAccess) {
              console.log('Access button pressed');
              this.accessButtonPressed();
            }
          }
        })();
      });
    })();
  }

  // Uploads healthData model to graphQL
  //input: {
  //           ID: this.id,
  //           date: this.AWSFormatString(date),
  //           stepCount: dayData.stepCount,
  //           distance: dayData.distance,
  //           calories: dayData.calories,
  //         },
  async uploadDataForDate(healthData) {
    API.graphql(
      graphqlOperation(createData, {
        healthData,
      }),
    )
      .then((result) => {
        return {message: 'Successfully uploaded data for ' + healthData.date};
      })
      .catch((error) => {
        return {
          message: 'Error uploading data for date: ' + healthData.date,
          error: error,
        };
        // error startsWith('DynamoDB:ConditionalCheckFailedException') -> data already present
      });
  }

  async checkHealthDataAccessPrompt() {
    return new Promise((resolve, reject) => {
      (async () => {
        // Request permission
        await AppleHealthKit.initHealthKit(
          this.defaultHealthDataOptions,
          (error, result) => {
            let hasAccess;
            if (error) {
              hasAccess = false;
            }
            (async () => {
              await this.getStepCount({})
                .then((result) => {
                  hasAccess = true;
                })
                .catch((error) => {
                  hasAccess = false;
                });

              if (hasAccess) {
                resolve({access: true});
              } else {
                //todo display message instead
                Alert.alert(
                  'Permissions not granted!',
                  'Please go to settings to allow access to Apple Health.',
                );
                reject({error: 'Permissions not granted', access: false});
              }
            })();
          },
        );
      })();
    });
  }

  async getCalories(dateOptionsPeriod): Promise {
    return new Promise((resolve, reject) => {
      (async () => {
        let caloriesTotal = 0;

        // Add active calorie data
        caloriesTotal += await new Promise((resolve, reject) => {
          AppleHealthKit.getActiveEnergyBurned(
            dateOptionsPeriod,
            (err, res) => {
              if (err) {
                if (err.message.startsWith('No data available')) {
                  console.warn(
                    'Error: No active calories data available for ' +
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
                console.warn(
                  'No Active Calorie data for ' +
                    dateOptionsPeriod.startDate +
                    ' - ' +
                    dateOptionsPeriod.endDate,
                );
                return reject();
              }
              return resolve(parseInt(res[0].value));
            },
          );
        }).catch((error) => {
          return 0;
        });

        // Add passive calorie data
        caloriesTotal += await new Promise((resolve, reject) => {
          AppleHealthKit.getBasalEnergyBurned(dateOptionsPeriod, (err, res) => {
            if (err) {
              if (err.message.startsWith('No data available')) {
                console.warn(
                  'Error: No resting calories data available for ' +
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
              console.warn(
                'No Resting Calorie data for ' +
                  dateOptionsPeriod.startDate +
                  ' - ' +
                  dateOptionsPeriod.endDate,
              );
              return reject();
            }
            return resolve(parseInt(res[0].value));
          });
        }).catch((error) => {
          return 0;
        });

        resolve(caloriesTotal);
      })();
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

  async fetchDataForDay(date: Date): Promise {
    return new Promise((resolve, reject) => {
      date.setHours(0, 0, 0, 0);
      let startDate = new Date(date);
      startDate.setDate(date.getDate() - 1);

      let dateOptionsDay = {
        date: startDate.toISOString(),
      };

      let endDate = new Date(date);
      endDate.setDate(date.getDate());
      let dateOptionsPeriod = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      (async () => {
        // Get step count
        let stepCount = await this.getStepCount(dateOptionsDay).catch(
          (error) => {
            return 0;
          },
        );
        // Get distance walked
        let distance = await this.getDistance(dateOptionsDay, {
          unit: 'mile',
        }).catch((error) => {
          return 0;
        });
        // Get Calories burned
        let calories = await this.getCalories(dateOptionsPeriod).catch(
          (error) => {
            return 0;
          },
        );
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
          let dayData = await this.fetchDataForDay(date);
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
    let todaysData = await this.fetchDataForDay(new Date());

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

    console.log(JSON.stringify(averageWeeklyData));

    this.setState({
      lastWeekData: {
        stepCount: averageWeeklyData.stepCount,
        distance: averageWeeklyData.distance,
        calories: averageWeeklyData.calories,
      },
    });
  }

  accessButtonPressed() {
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
          ID: this.userId,
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
          <Text style={styles.dataDisplayText}>
            Over last week you averaged:
          </Text>
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
              percentageValue:
                this.roundTo(
                  this.state.todaysData.stepCount /
                    this.state.lastWeekData.stepCount,
                  2,
                ) * 100,
              showPercentage: true,
              data: this.state.todaysData.stepCount,
            },
            {
              name:
                this.state.todaysData.calories.valueOf() === 1
                  ? 'Calorie'
                  : 'Calories',
              percentageValue:
                this.roundTo(
                  this.state.todaysData.calories /
                    this.state.lastWeekData.calories,
                  2,
                ) * 100,
              showPercentage: true,
              data: this.state.todaysData.calories,
            },
            {
              name:
                this.state.todaysData.distance.valueOf() === 1.0
                  ? 'Mile'
                  : 'Miles',
              percentageValue: this.roundTo(
                (this.state.todaysData.distance /
                  this.state.lastWeekData.distance) *
                  100,
                0,
              ),
              showPercentage: true,
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
