/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import Amplify from 'aws-amplify';
import config from './src/aws-exports';
Amplify.configure(config);
import {name as appName} from './app.json';

const TestFairy = require('react-native-testfairy');

TestFairy.begin('SDK-4WU9iHsy');
AppRegistry.registerComponent(appName, () => App);
