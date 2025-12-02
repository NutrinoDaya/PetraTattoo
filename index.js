/**
 * @format
 */

import 'react-native-get-random-values'; // Required for AWS SDK crypto support
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);