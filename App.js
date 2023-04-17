import React from 'react';
import type {Node} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackRouter from './src/router/StackRouter';
import { RootSiblingParent } from 'react-native-root-siblings';
import * as encoding from 'text-encoding';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput } from 'react-native'
if(Text.defaultProps== null) Text.defaultProps={}
if(TextInput.defaultProps== null) TextInput.defaultProps={}
Text.defaultProps.allowFontScaling = false
TextInput.defaultProps.allowFontScaling = false

const App: () => Node = () => {
  // useEffect(() => {
  //     return () => {
  //     };},
  //  []);

  return (
    <RootSiblingParent>
      <SafeAreaProvider>
      {/* <GestureHandlerRootView style={{ flex: 1 }}> */}
        <NavigationContainer>
          <StackRouter></StackRouter>
        </NavigationContainer>
        {/* </GestureHandlerRootView> */}
      </SafeAreaProvider>
    </RootSiblingParent>
  );
};

export default App;
