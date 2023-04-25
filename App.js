import React, {useEffect, useState} from 'react';
import type {Node} from 'react';
import { NativeModules } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackRouter from './src/router/StackRouter';
import * as Storage from './src/common/Storage';
import { RootSiblingParent } from 'react-native-root-siblings';
import * as encoding from 'text-encoding';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput } from 'react-native';
import platform from './src/utils/platform';
import GlobalData from "./src/utils/GlobalData";
import { logger } from './src/utils/utils';
if(Text.defaultProps== null) Text.defaultProps={}
if(TextInput.defaultProps== null) TextInput.defaultProps={}
Text.defaultProps.allowFontScaling = false
TextInput.defaultProps.allowFontScaling = false
const global = GlobalData.getInstance();
const App: () => Node = () => {

  const [user, setUser] = useState({});
  useEffect(() => {
    const userAsync = async() =>{
      let user = await Storage.getUserRecord();
      if (user) {
          savedUser = Object.assign({}, JSON.parse(user));
          if(savedUser.token){
            setUser(savedUser)
          }
      }
    };
    userAsync(); 
    if(platform.isAndroid()) {
      NativeModules.SplashScreen && NativeModules.SplashScreen.hide();
        NativeModules.ScreenAdaptation.getHeight().then((height) => {
            logger('height:'+ height/PixelRatio.get()+ '    h:'+Common.window.height);
            if(height){
              global.setScreenHeight(height/PixelRatio.get())
            }
        })
        .catch((err) => {
            logger('err:', err);
        });
      }
    else {
      NativeModules.SplashScreen && NativeModules.SplashScreen.close();
      let height = NativeModules.SplashScreen ? NativeModules.SplashScreen.getStatusHeight() : 0; 
      logger('.....height', height)
      if(height){
        global.setTop(parseInt(height))
      }
      }
    },
   []);

  return (
    <RootSiblingParent>
      <SafeAreaProvider>
      {/* <GestureHandlerRootView style={{ flex: 1 }}> */}
        <NavigationContainer>
          <StackRouter user={user}></StackRouter>
        </NavigationContainer>
        {/* </GestureHandlerRootView> */}
      </SafeAreaProvider>
    </RootSiblingParent>
  );
};

export default App;
