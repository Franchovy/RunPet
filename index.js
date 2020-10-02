/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import Amplify from 'aws-amplify';
import config from './aws-exports';
Amplify.configure(config);
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
