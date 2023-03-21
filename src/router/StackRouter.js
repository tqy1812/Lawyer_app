import React from 'react';
import {Provider} from 'react-redux';
import {
    Animated,
    Easing,
    BackHandler,
    Overlay,
  } from 'react-native';
import {createStackNavigator, CardStyleInterpolators, TransitionPresets } from '@react-navigation/stack';
import store from '../store/store';
import stateHelper from '../helpers/stateHelper';
import LoginPage from '../page/LoginPage';
import ActivityPage from '../page/ActivityPage';
import MainPage from '../page/MainPage';
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
const Toast = Overlay.Toast;
const Stack = createStackNavigator();

stateHelper.store = store;

let lastBackPressed = Date.now();

export default function StackRouter() {
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
            <Stack.Navigator initialRouteName="Login" screenOptions={props => {
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
                {/* <Stack.Screen
                    name="UpdatePassword"
                    component={LoginPage}
                    options={{headerShown: false}}
                /> */}
            </Stack.Navigator>
        </Provider>
    );
  }
