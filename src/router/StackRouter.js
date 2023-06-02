import React from 'react';
import {Provider} from 'react-redux';
import {
    Animated,
    Easing,
    BackHandler,
    Overlay,
    NativeModules,
    Alert,
    Linking,
  } from 'react-native';
import {createStackNavigator, CardStyleInterpolators, TransitionPresets } from '@react-navigation/stack';
import store from '../store/store';
import stateHelper from '../helpers/stateHelper';
import LoginPage from '../page/LoginPage';
import actionAuth from '../actions/actionAuth';
import ActivityPage from '../page/ActivityPage';
import MainPage from '../page/MainPage';
import CustomMainPage from '../page/CustomMainPage';
import PrivacyPage from '../page/PrivacyPage';
import ServicePage from '../page/ServicePage';
import CenterPage from '../page/CenterPage';
import ReportPage from '../page/ReportPage';
import MyInfoPage from '../page/MyInfoPage';
import ExportInfoPage from '../page/ExportInfoPage';
import AboutPage from '../page/AboutPage';
import FeedBackPage from '../page/FeedBackPage';
import PermissionPage from '../page/PermissionPage';
import ThirdApiListPage from '../page/ThirdApiListPage';
import RegisterPage from '../page/RegisterPage';
import ForgotPage from '../page/ForgotPage';
import UpdatePasswordPage from '../page/UpdatePasswordPage';
import ManageProjectPage from '../page/ManageProjectPage';
import WebPage from '../page/WebPage';
import GuidePage from '../page/GuidePage';
import SecurityPage from '../page/SecurityPage';
import AccountRemovePage from '../page/AccountRemovePage'
import platform from '../utils/platform';
import * as Storage from '../common/Storage';
import { logger, compareVersion } from '../utils/utils';
const Toast = Overlay.Toast;
const Stack = createStackNavigator();

stateHelper.store = store;
let lastBackPressed = Date.now();
let version = '';
export default function StackRouter(props) {
  logger('.........init user',props.user)
  props.user && props.user.token && store.dispatch(actionAuth.loadUser(props.user));
  const updateIosApp = () => {
    let downloadUrl =  'https://apps.apple.com/cn/app/%E5%BE%8B%E6%97%B6/id6446157793';
        store.dispatch(actionAuth.reqVersion((ver, error) => {
            if(ver){
                let num = compareVersion(version, ver);
                Storage.getVersion().then((localVersion)=>{ 
                    let oldCompare = -1;
                    if(localVersion) {
                        oldCompare = compareVersion(localVersion, ver);
                    }
                    if(num < 0 && oldCompare < 0) {
                        Alert.alert('App升级', `发现最新新版本[${ver}]，是否前往升级！。`, [{
                            text: '稍后升级',
                            onPress: () => {Storage.setVersion(ver)},
                            },
                            {
                              text: '去升级',
                              onPress: () => {
                                Storage.setVersion(ver);
                                Linking.openURL(downloadUrl).catch(err => {
                                    logger('.....error', error)
                                });
                            },
                            },
                        ]);
                    }
                })
                
            }
        }))
  };

  if(platform.isAndroid()) {
    NativeModules.ScreenAdaptation.getAppVersion((event) =>{
        version = event;
        let downloadUrl = 'https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/app/LAWYER.apk';
        store.dispatch(actionAuth.reqAndroidVersion((rs, error) => {
          if(rs){
              logger('.........getAppVersion', rs.version)
              const ver = rs.version;
              let num = compareVersion(version, ver);
              Storage.getVersion().then((localVersion)=>{ 
                  let oldCompare = -1;
                  if(localVersion) {
                      oldCompare = compareVersion(localVersion, ver);
                  }
                  if(num < 0 && oldCompare < 0) {
                      Alert.alert('App升级', `发现最新新版本[${ver}]，是否升级！。`, [{
                          text: '稍后升级',
                          onPress: () => {Storage.setVersion(ver)},
                          },
                          {
                            text: '下载升级包',
                            onPress: () => {
                              Storage.setVersion(ver);
                              Linking.openURL(downloadUrl).catch(err => {
                                  logger('.....error', error)
                              });
                          },
                          },
                      ]);
                  }
              })
              
          }
        }))
    });
  }
  else {
    version = NativeModules.SplashScreen && NativeModules.SplashScreen.getAppVersion();
    updateIosApp();
  }
  const forLeftSlide = ({ current, next, inverted, layouts: { screen } }) => {
    const progress = Animated.add(
      current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      next
        ? next.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          })
        : 0
    );
  
    return {
      cardStyle: {
        transform: [
          {
            translateX: Animated.multiply(
              progress.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [
                  screen.width, // Focused, but offscreen in the beginning
                  0, // Fully focused
                  screen.width * -0.3, // Fully unfocused
                ],
                extrapolate: 'clamp',
              }),
              inverted
            ),
          },
        ],
      },
    };
  };
      const forRightSlide = ({ current, next, inverted, layouts: { screen } }) => {
        const progress = Animated.add(
          current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
          next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              })
            : 0
        );
      
        return {
          cardStyle: {
            transform: [
              {
                translateX: Animated.multiply(
                  progress.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [
                      screen.width, // Focused, but offscreen in the beginning
                      0, // Fully focused
                      screen.width * -0.3, // Fully unfocused
                    ],
                    extrapolate: 'clamp',
                  }),
                  inverted
                ),
              },
            ],
          },
        };
      };
    return (
        <Provider store={store}>
            <Stack.Navigator initialRouteName={props.user && props.user.token ? props.user.type ===2 ? 'CustomMain' : 'Main' : 'Login'} screenOptions={props => {
              const { navigation, route } = props;
              // if (route.name === 'Main' && navigation.isFocused()) {
              //     BackHandler.addEventListener('hardwareBackPress',  () => {
              //       if (lastBackPressed && lastBackPressed + 2000 >= Date.now()) {
              //         BackHandler.exitApp();
              //         return false;
              //       }
              //       lastBackPressed = Date.now();
              //       Toast('再按一次退出应用');
              //       return true;
              //     });
              // } else if (route.name !== 'Main' && navigation.isFocused()) {
              //     console.log("==-=-=-=other");
              //     BackHandler.removeEventListener('hardwareBackPress', () => { return true; });
              // }
              return { cardStyleInterpolator: forRightSlide }}}>
                <Stack.Screen
                    name="Main"
                    component={MainPage}
                    options={{headerShown: false}}
                />

                <Stack.Screen
                    name="CustomMain"
                    component={CustomMainPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="Daily"
                    component={ActivityPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="Privacy"
                    component={PrivacyPage}
                    options={{headerShown: false, 
                    }}
                />
                <Stack.Screen
                    name="Service"
                    component={ServicePage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="Center"
                    component={CenterPage}
                    options={{headerShown: false,
                      ...TransitionPresets.SlideFromRightIOS,
                      gestureDirection: 'horizontal-inverted',}}
                />
                <Stack.Screen
                    name="Report"
                    component={ReportPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="MyInfo"
                    component={MyInfoPage}
                    options={{headerShown: false}}
                />  
                <Stack.Screen
                    name="Export"
                    component={ExportInfoPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="About"
                    component={AboutPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="FeedBack"
                    component={FeedBackPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="Permission"
                    component={PermissionPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="ThirdApiList"
                    component={ThirdApiListPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="WebPage"
                    component={WebPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterPage}
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="Forgot"
                    component={ForgotPage}
                    options={{headerShown: false}}
                />

                <Stack.Screen
                    name="UpdatePassword"
                    component={UpdatePasswordPage}
                    options={{headerShown: false}}
                />

                <Stack.Screen
                    name="ManageProject"
                    component={ManageProjectPage}
                    options={{headerShown: false}}
                />

                <Stack.Screen
                    name="Guide"
                    component={GuidePage}
                    options={{headerShown: false}}
                />

                <Stack.Screen
                    name="Security"
                    component={SecurityPage}
                    options={{headerShown: false}}
                />

                <Stack.Screen
                    name="AccountRemove"
                    component={AccountRemovePage}
                    options={{headerShown: false}}
                />
            </Stack.Navigator>
        </Provider>
    );
  }
