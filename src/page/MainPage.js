import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Overlay,
  NativeEventEmitter,
  AppState,
  PanResponder,
  TextInput,
  DeviceEventEmitter,
  TouchableHighlight,
  ActivityIndicator,
  Keyboard,
  BackHandler,
  AppRegistry,
  NativeModules,
  Alert,
  StatusBar,
  ImageBackground
} from 'react-native';
import {
  WebView as WebViewX5
} from 'react-native-webview-tencentx5';
import {
  WebView
} from 'react-native-webview';
import { Recognizer } from 'react-native-speech-iflytek';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from 'react-native-push-notification';
import { connect } from 'react-redux';
import authHelper from '../helpers/authHelper';
import MyModal from '../components/MyModal';
import Common from "../common/constants";
import platform from "../utils/platform";
import { showDrawerModal, DrawerModal, } from '../components/DrawerModal';
import { destroySibling, destroyAllSibling, showLoading, showModal, showRecoding, showPlanModal, showFinishModal, showConfirmModal, showToast } from '../components/ShowModal';
import MyFinishPlanSlider from '../components/MyFinishPlanSlider';
import MyPlanSlider from '../components/MyPlanSlider';
import actionProcess from '../actions/actionProcess';
import * as Storage from '../common/Storage';
import { getWeekXi, getHoliday, logger } from '../utils/utils';
import IcomoonIcon from "../components/IcomoonIcon";
import MyButton from "../components/MyButton";
import actionCase from "../actions/actionCase";
import WebSocketClient from "../utils/WebSocketClient";
import GlobalData from "../utils/GlobalData";
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from "react-native-gesture-bottom-sheet";
import MyFinishPlanSheet from "../components/MyFinishPlanSheet";
import moment from 'moment';
import actionAuth from '../actions/actionAuth';
import BackgroundTimer from 'react-native-background-timer';
import ImageArr from '../common/ImageArr';
import ProcessConfirmModal from '../components/ProcessConfirmModal';
import NetInfo from '@react-native-community/netinfo';
const { width: windowWidth, height: windowHeight } = Common.window;
const Toast = Overlay.Toast;
const distance = 50;

const globalData = GlobalData.getInstance();
class MainPage extends Component {

  static mapStateToProps(state) {
    let props = {};
    props.user = state.Auth.user;
    props.isLogin = authHelper.logined(state.Auth.user);
    props.caseList = state.Case.caseList;
    props.finishList = state.Process.finishList;
    props.planList = state.Process.planList;
    props.userInfo = state.Auth.userInfo;
    props.caseListInfo = state.Case.caseListInfo;
    return props;
  }

  constructor(props) {
    super(props);
    // 设置初始值
    // this.planRef = React.createRef();
    // this.finishRef = React.createRef();
    this.updateProcessCallback = null;
    this.lastBackPressed = 0;
    this.state = {
      appState: AppState.currentState,
      lastId: 0,
      myPlanState: false,
      myFinishPlanState: false,
      talkModalVisible: false,
      talkSuccessModalVisible: false,
      talkContent: '',
      item: {
      },
      itemNotice: false,
      itemName: '',
      isRecoding: false,
      loading: true,
      menuVisible: true,
      updateItem: {},
      caseId: undefined,
      caseList: props.caseList,
      caseListInfo: props.caseListInfo,

    }
    // DeviceEventEmitter.removeAllListeners();
    this.INJECTEDJAVASCRIPT = `
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'initial-scale=0.5, maximum-scale=0.5, user-scalable=0'); 
    meta.setAttribute('name', 'viewport'); 
    document.getElementsByTagName('head')[0].appendChild(meta);`
    this.wv = React.createRef();
    // logger('###########', Recognizer);
    if(platform.isAndroid()) {
      Recognizer.init("ed00abad");
    }
    else{
      this.RecognizerIos = NativeModules.SpeechRecognizerModule;
      this.RecognizerIos && this.RecognizerIos.init("ed00abad");
    }
    const that = this;
    this.timeStampMove = 0;
    this._panResponderMyPlan = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (e, gestureState) => {
        // logger('onMoveShouldSetPanResponder.......................' + gestureState.dy)
        if (Math.abs(gestureState.dy) > 25) {
          return true;
        }
        else {
          return false;
        }
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt, gs) => {
        this.timeStampMove = evt.timeStamp;
        // logger('开始移动：' + evt.timeStamp + ' X轴：' + gs.dx + '，Y轴：' + gs.dy);
      },
      onPanResponderMove: (evt, gs) => {
        // logger('正在移动：' + evt.timeStamp + ' X轴：' + gs.dx + '，Y轴：' + gs.dy);
        // if (this.timeStampMove > 0 && gs.dx < -distance) {
        //   this.timeStampMove = 0;

        //   logger('由右向左');
        // }
        // else
        if (this.timeStampMove > 0 && gs.dy < -distance) {
          this.timeStampMove = 0;
          this.finishRef.close('finish');
          that.setState({ menuVisible: false })
          this.planRef.open('plan');
          // this.planRef && this.planRef.current.show()
        } else if (this.timeStampMove > 0 && gs.dy > distance) {
          this.timeStampMove = 0;
          this.planRef.close('plan');
          this.finishRef.open('finish');
          // this.finishRef && this.finishRef.current.show()
        }
      },
      onPanResponderRelease: (evt, gs) => {
        // logger('结束移动：X轴移动了：' + gs.dx + '，Y轴移动了：' + gs.dy);
        that.stopRecord();
      }
    });
    this.processName = Keyboard.addListener('keyboardDidHide', this.processNameForceLoseFocus);
    if(platform.isAndroid()) {
      this.wc = WebSocketClient.getInstance();
    }
    this.unsubscribe = NetInfo.addEventListener(state => {
      logger("Listener Is connected?", state.isConnected);
      if(!state.isConnected){
        // this.wc && this.wc.onDisconnectWS();
      }
      else {
        this.wc && this.wc.initWebSocket(this.props.user.employee_id);
      }
    });
  }
  componentDidMount() {
    if (!this.props.isLogin) {
      this.props.navigation.navigate('Login');
    }
    this.props.dispatch(actionCase.reqCaseList((list, infoList)=>{
      logger(list)
      if(list) {
        this.setState({caseList: list})
      }
      if(infoList) {
        this.setState({caseListInfo: infoList})
      }
    }));
    this.props.dispatch(actionAuth.reqUserInfo());
    // NativeModules.WebSocketWorkManager.startBackgroundWork();
    // logger(this.wc);
    // this.wc.initWebSocket(this.props.user.employee_id);
    //监听状态改变事件
    AppState.addEventListener('change', this.handleAppStateChange);
    //监听内存报警事件
    // AppState.addEventListener('memoryWarning', function(){
    //   logger("内存报警....");
    // });
    this.recognizerEventEmitter = new NativeEventEmitter(platform.isAndroid() ?  Recognizer : this.RecognizerIos);
    this.recognizerEventEmitter.addListener('onRecognizerResult', this.onRecognizerResult);
    this.recognizerEventEmitter.addListener('onRecognizerError', this.onRecognizerError);
    if (platform.isAndroid()) {
      PushNotification.getChannels(function (channels) {
        logger('....channels:' + JSON.stringify(channels));
      });
      PushNotification.createChannel(
        {
          channelId: 'NEW_MESSAGE_NOTIFICATION', // (required)
          channelName: `任务通知`, // (required)
          channelDescription: "任务提醒通知", // (optional) default: undefined.
          soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
          importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
          vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
        },
        (created) => logger(`createChannel '任务通知' returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
      );
    }
    else {
      PushNotificationIOS.addEventListener('register', this.onRegistered);
      PushNotificationIOS.addEventListener('registrationError', this.onRegistrationError);
      PushNotificationIOS.addEventListener('notification', this.onRemoteNotification);
      PushNotificationIOS.addEventListener('localNotification', this.onLocalNotification);

      PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
        critical: true,
      }).then(
        (data) => {
          logger('PushNotificationIOS.requestPermissions', data);
        },
        (data) => {
          logger('PushNotificationIOS.requestPermissions failed', data);
        },
      );
      this.setNotificationCategories();
      const { OpenNoticeEmitter } = NativeModules;
      const eventEmitter = new NativeEventEmitter(OpenNoticeEmitter);
      this.iosOpenNotice = eventEmitter.addListener('openNotice', this.openNotfication);
    }
    destroySibling();
    destroyAllSibling();
    Storage.getUserRecord().then((user) => {
      if (user) {
        let obj = Object.assign({}, JSON.parse(user));
        this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveToken("' + obj.token + '");true;');
      }
    });
    this.eventNoticeMsgReceive = DeviceEventEmitter.addListener('noticeMsg',
      (msg) => { this.scheduleNotfication(msg); });
    this.eventNoticeOpen = DeviceEventEmitter.addListener('noticeOpen', () => { this.openNotfication(); });
    if (platform.isAndroid()) {
      this.eventKeepAliveSocket = DeviceEventEmitter.addListener('keepTimer', () => { this.wc.keepAlive(); });
      this.eventWsBind = DeviceEventEmitter.addListener('wsBind', (id) => { this.wc.onSubscription(id); });
      this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }
    showPlanModal(<DrawerModal
      component={<MyPlanSlider {...this.props} caseList={this.state.caseList}/>}
      ref={e => this.planRef = e}
      height={Common.window.height - 100}
      showType={'bottom'}
      close={this.showMenu}
    />);

    showFinishModal(<DrawerModal
      component={<MyFinishPlanSlider finishTime={this.handleFinishTime.bind(this)} finishTimeEnd={(item, callback) => this.handleFinishTimeEnd(item, callback)} {...this.props} caseList={this.state.caseList}/>}
      ref={e => this.finishRef = e}
      height={Common.window.height - 100}
      showType={'top'}
    />);
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.recognizerEventEmitter && this.recognizerEventEmitter.removeAllListeners('onRecognizerResult');
    this.recognizerEventEmitter && this.recognizerEventEmitter.removeAllListeners('onRecognizerError');
    this.eventWsBind && this.eventWsBind.remove();
    this.eventNoticeMsgReceive && this.eventNoticeMsgReceive.remove();
    this.eventNoticeOpen && this.eventNoticeOpen.remove();
    this.eventKeepAliveSocket && this.eventKeepAliveSocket.remove();
    this.processName && this.processName.remove();
    if (platform.isIOS()) {
      PushNotificationIOS.removeEventListener('register');
      PushNotificationIOS.removeEventListener('registrationError');
      PushNotificationIOS.removeEventListener('notification');
      PushNotificationIOS.removeEventListener('localNotification');
      this.iosOpenNotice && this.iosOpenNotice.remove();
    }
    // this.backHandler && this.backHandler.remove();
    if (platform.isAndroid()) {
      NativeModules.WebSocketWorkManager.stopBackgroundWork();
    }
    this.unsubscribe();
    this.wc && this.wc.onDisconnectWS();
    // DeviceEventEmitter.removeAllListeners();
  }
  onRegistered = (deviceToken) => {
    const { dispatch } = this.props;
    logger('.......deviceToken='+deviceToken);
    if(deviceToken) {
      dispatch(actionAuth.reqUserUpdate(undefined, deviceToken, (result, error)=>{
        if(error){
          Toast.show(error.info)
        }
      }));
    }
    // Alert.alert('远程消息推送已经注册', `注册令牌: ${deviceToken}`, [
    //   {
    //     text: '关闭',
    //     onPress: null,
    //   },
    // ]);
  };
  onRegistrationError = (error) => {
    Alert.alert(
      '远程消息推送注册失败',
      `Error (${error.code}): ${error.message}`,
      [
        {
          text: '关闭',
          onPress: null,
        },
      ],
    );
  };
  setNotificationCategories = () => {
    PushNotificationIOS.setNotificationCategories([
      {
        id: 'userAction',
        actions: [
          { id: 'open', title: '打开', options: { foreground: true } },
          {
            id: 'ignore',
            title: '忽略',
            options: { foreground: true, destructive: true },
          },
        ],
      },
    ]);
  };

  onRemoteNotification = (notification) => {
    const isClicked = notification.getData().userInteraction === 1;
    logger('##########isClicked=' + isClicked);
    const result = `
      Title:  ${notification.getTitle()};\n
      Subtitle:  ${notification.getSubtitle()};\n
      Message: ${notification.getMessage()};\n
      badge: ${notification.getBadgeCount()};\n
      sound: ${notification.getSound()};\n
      category: ${notification.getCategory()};\n
      content-available: ${notification.getContentAvailable()};\n
      Notification is clicked: ${String(isClicked)}.`;
    if (isClicked) {
      this.openNotfication();
      // PushNotificationIOS.getApplicationIconBadgeNumber((num) => {
      //   PushNotificationIOS.setApplicationIconBadgeNumber(num-1);
      // });
    }
    else {
      this.sendLocalNotification(result);
    }
    // else if (notification.getTitle() == undefined) {
    // Alert.alert('静默推送消息已接收', result, [
    //   {
    //     text: '发送本地推送',
    //     onPress: this.sendLocalNotification(result),
    //   },
    // ]);
    // }
    // else {
    //   Alert.alert('消息推送已经接收', result, [
    //     {
    //       text: '关闭',
    //       onPress: null,
    //     },
    //   ]);
    // }
    notification.finish('UIBackgroundFetchResultNoData')
  };
  onLocalNotification = (notification) => {
    const isClicked = notification.getData().userInteraction === 1;
    logger('##########isClicked=' + isClicked);
    if (isClicked) {
      this.openNotfication();
      // PushNotificationIOS.getApplicationIconBadgeNumber((num) => {
      //   PushNotificationIOS.setApplicationIconBadgeNumber(num - 1);
      // });
    }
    // Alert.alert(
    //   'Local Notification Received',
    //   `Alert title:  ${notification.getTitle()},
    //   Alert subtitle:  ${notification.getSubtitle()},
    //   Alert message:  ${notification.getMessage()},
    //   Badge: ${notification.getBadgeCount()},
    //   Sound: ${notification.getSound()},
    //   Thread Id:  ${notification.getThreadID()},
    //   Action Id:  ${notification.getActionIdentifier()},
    //   User Text:  ${notification.getUserText()},
    //   Notification is clicked: ${String(isClicked)}.`,
    //   [
    //     {
    //       text: '关闭',
    //       onPress: null,
    //     },
    //   ],
    // );
  };
  sendLocalNotification = (result) => {
    // PushNotificationIOS.getApplicationIconBadgeNumber((num) => {
    PushNotificationIOS.presentLocalNotification({
      alertTitle: result.Title,
      alertBody: result.Message,
      applicationIconBadgeNumber: 0,
      category: ''
    });
    // });
  };

  sendNotification = (result) => {
    DeviceEventEmitter.emit('remoteNotificationReceived', {
      remote: true,
      aps: {
        alert: { title: result.Title, subtitle: 'subtitle', body: result.Message },
        badge: 1,
        sound: 'default',
        category: 'REACT_NATIVE',
        'content-available': 1,
        'mutable-content': 1,
      },
    });
  };
  processNameForceLoseFocus = () => {
    this.item_name && this.item_name.blur();
  }

  onBackButtonPressAndroid = () => {
    logger("...............onBackButtonPressAndroid ")
    // if(this.props.navigation.state.routeName=="Main"){
    //   if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
    //     //最近2秒内按过back键，可以退出应用。
    //     BackHandler.exitApp()
    //     return false
    //   }
    //   this.lastBackPressed = Date.now();
    //   Toast.show('再按一次退出应用');
    //   return true;
    // }else{
    return false;
    // }
  };

  handleAppStateChange = (nextAppState) => {
    // logger('****************nextAppState==' + nextAppState);
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.wv && this.wv.current && this.wv.current.reload();
      if (this.wc) this.wc.setIsBackground(false);
      if (platform.isAndroid()) {
        NativeModules.WebSocketWorkManager.stopBackgroundWork();
      }
      this.props.dispatch(actionCase.reqCaseList((list, infoList)=>{
        if(list) {
          this.setState({caseList: list})
        }
        if(infoList) {
          this.setState({caseListInfo: infoList})
        }
      }));
      this.props.dispatch(actionAuth.reqUserInfo());
      // logger('****************show', this.wc.getKeepSocket());
      // this.wc.getKeepSocket() && BackgroundTimer.clearInterval(this.wc.getKeepSocket());
      // let te = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbXBsb3llZV9pZCI6IjEiLCJwaG9uZSI6IjE3Nzc3Nzc3Nzc3IiwiaWF0IjoxNjczNDA1MTMxLjA5ODczMjIsImV4cCI6MTY3NDAwOTkzMS4wOTg3MzIyfQ.Zpc2Q0ugIKTLQj5gvO7-ya1ZTiPbPjjuB_6Bu2_VXm8"
      // this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("'+te+'");true;');
      // Storage.getUserRecord().then((user) => {
      //   if (user) {
      //     let obj = Object.assign({}, JSON.parse(user));
      //     logger(obj)
      //     this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("1111", "'+obj.token+'");true;');
      //   }
      // });
    }
    else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {
      // logger('***************hidden', this.wc);
      if (this.wc) this.wc.setIsBackground(true);
      if (platform.isAndroid()) {
        NativeModules.WebSocketWorkManager.startBackgroundWork();
      }
      // if(this.wc) this.wc.backTimer();
      // this.wv && this.wv.current && this.wv.current.injectJavaScript(`receiveMessage("stop");true;`);
      // AppRegistry.startHeadlessTask(1, 'WebSocketConnectService', {});
    }
    this.setState({ appState: nextAppState });
  };

  sendRecording = (value) => {
    const { dispatch } = this.props;
    const that = this;
    that.setState({ talkContent: '', talkModalVisible: false, loading: true });
    Storage.getUserRecord().then((user) => {
      if (user) {
        let obj = Object.assign({}, JSON.parse(user));
        this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + value + '", "' + obj.token + '");true;');
        setTimeout(() => {
          that.setState({ loading: false });
        }, 15000)
      }
      else {
        that.setState({ loading: false });
      }
    });
  }
  handleSetting() {
    if(platform.isAndroid()){
      NativeModules.NotifyOpen && NativeModules.NotifyOpen.openPermission();
    }
    else {
      NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting();
    }
  }
  startRecord = () => {
    logger('startRecoding..........')
    if(platform.isIOS()){
      const isHasMic = NativeModules.OpenNoticeEmitter ? NativeModules.OpenNoticeEmitter.getRecordPermission() : 0;
      logger('...........isHasMic', isHasMic);
      if(!isHasMic){
        Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
          text: '取消',
          onPress: null,
          },
          {
            text: '去设置',
            onPress: () => {this.handleSetting();},
          },
          ]);
          return;
        }
    }
    // Toast.show('请开始添加');
    showRecoding();
    // this.setState({isRecoding: true});
    // this.sendRecording('recording')
    if(platform.isAndroid()){
      Recognizer.start();
    }
    else{
      this.RecognizerIos.start();
    }
  }

  stopRecord = () => {
    const that = this;
    if(platform.isAndroid()){
      Recognizer.isListening().then(value => {
        logger('stopRecord..........' + value)
        if (value) {
          Recognizer.stop();
        }
        destroySibling();
        // that.setState({isRecoding: false});
      });
    }
    else {
      this.RecognizerIos.isListening().then(value => {
        logger('stopRecord..........' + value)
        if (value) {
          this.RecognizerIos.stop();
        }
        destroySibling();
        // that.setState({isRecoding: false});
      });
    }
  }

  onRecognizerResult = (e) => {
    logger("result............." + JSON.stringify(e.result), '.....' + e.isLast);
    if (!e.isLast) {
      return;
    }
    if (e.result== '' || JSON.stringify(e.result)=="" )  {
      Toast.show('不好意思，没听清楚');
      this.setState({ updateItem: {} });
      // this.sendRecording('stop_recording');
      return;
    }
    logger(e.result + "............." + JSON.stringify(this.state.updateItem));
    if (this.state.updateItem && this.state.updateItem.id) {
      logger(e.result);
      if (this.updateProcessCallback) this.updateProcessCallback(this.state.updateItem.id, e.result);
      this.setState({ updateItem: {} });
    }
    else
      this.sendRecording(e.result);
  }


  onRecognizerError = (result) => {
    logger("error............." + JSON.stringify(e.result));
    if (result.errorCode !== 0) {
      // alert(JSON.stringify(result));

    }
  }

  scheduleNotfication = (content) => {
    logger('5555555555555555555555555====' + content);
    if (content) {
      let item = JSON.parse(content);
      if (platform.isAndroid()) {
        PushNotification.localNotification({
          channelId: 'NEW_MESSAGE_NOTIFICATION',
          title: "任务提醒-" + item.case_name,
          message: item.process_name + ',时间:' + item.start_time,
          id: this.state.lastId,
          date: new Date(Date.now()),
          when: new Date().getTime()
        });
        this.setState({ lastId: (this.state.lastId + 1) });
      }
      else {
        this.sendLocalNotification({ Title: "任务提醒-" + item.case_name, Message: item.process_name + ',时间:' + item.start_time });
      }
    }
  }

  openNotfication = () => {
    this.props.navigation.navigate('Main');
    this.finishRef && this.finishRef.close('finish');
    this.setState({ menuVisible: false });
    this.planRef && this.planRef.open('plan');
  }

  test = () => {
    if (platform.isAndroid()) {
      PushNotification.localNotification({
        channelId: 'NEW_MESSAGE_NOTIFICATION',
        title: "任务提醒-",
        message: "test",
        id: this.state.lastId,
        when: new Date().getTime(),
      });
      this.setState({ lastId: (this.state.lastId + 1) });
    }
    else {
      this.sendLocalNotification({ Title: '任务提醒-', Message: '测试' });
    }
  }

  handleNativeMessage = (content) => {
    logger('handleNativeMessage====' + content);
    const { dispatch } = this.props;
    const that = this;
    if (content.indexOf('talk:') === 0) {
      const codeArr = content.split('&');
      const code = codeArr[0].replace('talk:', '')
      if (code === '0') {
        const id = codeArr[1].replace('id:', '')
        if (id) {
          dispatch(actionProcess.reqGetProcess(id, (rs, error) => {
            if(error) {
              Toast.show(error.info)
            }
            else {
              that.showConfirm(rs);
              that.setState({ loading: false});
            }
            // that.setState({ loading: false, talkSuccessModalVisible: true, item: rs, itemName: rs.name });
          }));
        }
        else {
          that.setState({ loading: false });
        }
      }
      else {
        that.setState({ loading: false });
      }
    }
  }

  closePlan = () => {
    this.setState({ myPlanState: false });
  }
  closeFinishPlan = () => {
    this.setState({ myFinishPlanState: false });
  }
  handleFinishTime = (item) => {
    if(platform.isIOS()){
      const isHasMic = NativeModules.OpenNoticeEmitter ? NativeModules.OpenNoticeEmitter.getInputAudio() : 1;
      logger('...........isHasMic', isHasMic);
      // if(isHasMic){
      //   Toast.show('未检测到麦克风');
      //   return;
      // }
    }
    if(platform.isAndroid()){
      Recognizer.start();
    }
    else {
      this.RecognizerIos.start();
    }
    this.updateProcessCallback = null;
    // logger('.....handleFinishTime' + JSON.stringify(item))
    this.setState({ updateItem: item });
  }
  handleFinishTimeEnd = (item, callback) => {
    const that = this;
    // logger('.....handleFinishTimeEnd' + JSON.stringify(item))
    if(platform.isAndroid()){
      Recognizer.isListening().then(value => {
        logger('stopRecord..........' + value)
        if (value) {
          Recognizer.stop();
          this.updateProcessCallback = callback;
        }
        else {
          that.setState({ updateItem: {} });
          
        }
      });
    }
    else {
      this.RecognizerIos.isListening().then(value => {
        logger('stopRecord..........' + value)
        if (value) {
          this.RecognizerIos.stop();
          this.updateProcessCallback = callback;
        }
        else {
          that.setState({ updateItem: {} });
          
        }
      });
    }
  }
  closeTalk = () => {
    this.setState({ talkModalVisible: false });
  }
  handleSending = () => {
    if (this.state.talkContent) {
      this.sendRecording(this.state.talkContent);
    }
    else {
      this.setState({ talkContent: '', talkModalVisible: false })
    }
  }
  handleTalkContentChanged(text) {
    let content = text.trim();
    this.setState({ talkContent: content });
  }
  handleTalkNameChanged(text) {
    let content = text.trim();
    this.setState({ itemName: content });
  }
  closeTalkSuccess = () => {
    this.setState({ talkSuccessModalVisible: false, item: {}, itemNotice: false, itemName: '' });
  }

  sendTalkSuccess = () => {
    const that = this;
    const { dispatch } = this.props;
    const { item, itemNotice, itemName, caseId } = this.state;
    showLoading();
    dispatch(actionProcess.reqSubmitProcess(item.id, itemNotice, itemName, true, caseId, (rs, error) => {
      destroySibling();
      that.setState({ loading: false, talkSuccessModalVisible: false, item: {}, itemNotice: false, itemName: '' });
      if (error) {
        Toast.show(error.info);
      }
      else {
        DeviceEventEmitter.emit('refreshDailyProcess');
        this.finishRef && this.finishRef.close('finish');
        this.planRef && this.planRef.open('plan');
      }
    }));
  }

  sendProcessConfirm = (item) => {
    const that = this;
    const isLast = moment(item.end_time).diff(moment(new Date())) < 0;
    logger(that.state.item.end_time ,isLast)
    that.setState({ loading: false, talkSuccessModalVisible: false, item: {}, itemNotice: false, itemName: '' });
    DeviceEventEmitter.emit('refreshDailyProcess');
    if(isLast) {
      this.planRef && this.planRef.close('plan');
      this.finishRef && this.finishRef.open('finish');
    }
    else {
      this.finishRef && this.finishRef.close('finish');
      this.planRef && this.planRef.open('plan');
    }
  }

  closeLoading = () => {
    this.setState({ loading: false });
  }
  showMenu = () => {
    this.setState({ menuVisible: true });
  }

  showConfirm = (item) => {
    logger(item)
    // item=  {
    //     id: 313,
    //     name:'cessd',
    //     case: {
    //       id: 3,
    //       name: 'dedddd',
    //     },
    //     start_time: '2022-01-02 11:00:00',
    //     end_time: '2022-01-02 12:00:00'
    //   }
    
    if(item && item.id) {
      showConfirmModal(<ProcessConfirmModal {...this.props} submint={(item)=>this.sendProcessConfirm(item)} item={item} close={this.closeTalkSuccess} caseLists={this.state.caseList} 
      caseListInfo={this.state.caseListInfo}/>);
    }
  }
  render() {
    const { menuVisible, caseList } = this.state;
    const menuHeight = platform.isIOS() ? globalData.getTop() : Common.statusBarHeight;
    // logger('statusBarHeight11......', StatusBar.currentHeight)
    // logger('..onBackButtonPressAndroid', this.props.navigation.getState())
    return (
      <View style={styles.container}>
        <StatusBar translucent={true}  backgroundColor='transparent' barStyle="light-content" />
        {this.state.loading && <View style={styles.mask}>
          <ActivityIndicator size="large" color="black" />
        </View>}
        {/* <MyPlan isVisible={this.state.myPlanState} close={this.closePlan}  {...this.props}>
        </MyPlan> */}
        {/* <MyFinishPlan isVisible={this.state.myFinishPlanState} close={this.closeFinishPlan} finishTime={this.handleFinishTime} finishTimeEnd={this.handleFinishTimeEnd} caseList={this.props.caseList}>
        </MyFinishPlan> */}
        {/* <DrawerModal
          component={<MyPlanSlider {...this.props}/>}
          ref={e => this.planRef = e}
          height={Common.window.height - 100}
          showType={'bottom'}
        /> */}
        {/* <DrawerModal
            component={<MyFinishPlanSlider finishTime={this.handleFinishTime.bind(this)} finishTimeEnd={this.handleFinishTimeEnd.bind(this)} {...this.props}/>}
            ref={e => this.finishRef = e}
            height={Common.window.height - 100}
            showType={'top'}
          /> */}
        {/* <MyModal customTitleViewShow={true} title={'内容确认'} cancelShow={true} confirmText={'添加'} isVisible={this.state.talkModalVisible} close={this.closeTalk} send={this.handleSending} isTouchMaskToClose={false}>
          <TextInput
            placeholder='发送内容'
            placeholderTextColor='#999'
            style={styles.talkInput}
            onChangeText={this.handleTalkContentChanged.bind(this)}
            value={this.state.talkContent}
            multiline
            textAlignVertical='top'
            />
        </MyModal>*/}
        {/* <MyModal customTitleViewShow={false} cancelShow={true} confirmText={'确认'} isVisible={this.state.talkSuccessModalVisible} close={this.closeTalkSuccess} send={this.sendTalkSuccess} isTouchMaskToClose={false}>
          {caseList && this.state.item && this.state.item.id && JSON.stringify(caseList) != '{}' && <View style={styles.processInfo}>
            <View style={styles.listTitleView}>
              <View style={styles.titleList}><View style={styles.titleTime}><Text style={styles.listItemTitleFont}>{moment(this.state.item.start_time).format('MM月DD日')}</Text><Text style={styles.listItemTitleWeekFont}>{getWeekXi(this.state.item.start_time)}</Text></View>{<Text style={styles.titleTodayFont1}>{getHoliday(this.state.item.start_time)}</Text>}</View>
            </View>
            <View style={styles.listItemView}>
              <View style={styles.listItemTimeView}><Text style={styles.listItemTimeStart}>{this.state.item.start_time ? moment(this.state.item.start_time).format('HH:mm') : '-- : --'}</Text><Text style={styles.listItemTimeEnd}>{this.state.item.end_time ? moment(this.state.item.end_time).format('HH:mm') : '-- : --'}</Text></View>
              <View style={[styles.listItemTimeSplit, { backgroundColor: caseList[this.state.item.case.id + ''][2], }]}></View>
              <View style={styles.listItemRightView}>
                <TextInput
                  ref={(r) => this.item_name = r}
                  placeholder='内容'
                  placeholderTextColor='#999'
                  style={styles.talkNameInput}
                  onChangeText={this.handleTalkNameChanged.bind(this)}
                  value={this.state.itemName}
                />
                <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{this.state.item.case.name}</Text>
              </View>
              <View style={styles.listItemNoticeView}><MyButton style={styles.setNoticeView} onPress={() => { this.setState({ itemNotice: !this.state.itemNotice }) }}><IcomoonIcon name='alert_0' size={30} color={this.state.itemNotice ? '#007afe' : '#fff'} /></MyButton></View>
            </View>
          </View>
          }
        </MyModal> */}
        {
          platform.isAndroid() ? <WebViewX5
            ref={this.wv}
            source={{ uri: Common.webUrl + 'demo/index.html' }}
            // source={{ uri: 'https://human.kykyai.cn' }}
            scalesPageToFit={true}
            bounces={false}
            style={{ width: windowWidth, height: '100%' }}
            javaScriptEnabled={true}
            injectedJavaScript={this.INJECTEDJAVASCRIPT}
            onMessage={(event) => { this.handleNativeMessage(event.nativeEvent.data) }}
            mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
            incognito={true}
            onLoadEnd={this.closeLoading.bind(this)}
          /> : <WebView
            ref={this.wv}
            source={{ uri:  Common.webUrl + 'demo/index.html' }}
            // source={{ uri: 'https://human.kykyai.cn' }}
            scalesPageToFit={false}
            bounces={false}
            style={{ width: windowWidth, height: '100%' }}
            javaScriptEnabled={true}
            injectedJavaScript={this.INJECTEDJAVASCRIPT}
            onMessage={(event) => { this.handleNativeMessage(event.nativeEvent.data) }}
            mediaPlaybackRequiresUserAction={false}
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
            incognito={true}
            onLoadEnd={this.closeLoading.bind(this)}
          />
        }

        {/* { this.state.isRecoding && <View style={styles.isRecoding}><Wave height={50} lineColor={'#fff'}></Wave></View> } */}
        <View style={[styles.contentView, { top: 0, height: windowHeight}]} {...this._panResponderMyPlan.panHandlers}>
          <TouchableOpacity activeOpacity={1} style={styles.content} onLongPress={this.startRecord} onPressOut={this.stopRecord}>
            <View style={[styles.topMenu, {height: 50 + menuHeight}]}>
              {menuVisible && <MyButton style={[styles.menuBtnView, {height: 50 + menuHeight}]} onPress={() => this.props.navigation.navigate('Center', { key: this.props.navigation.getState().key })}>
                <IcomoonIcon name='center' size={30} style={{ color: 'rgb(0, 122, 254)' }} />
              </MyButton>}
              {/* <View style={styles.sliderView}>
              <View style={styles.sliderBtn}></View>
            </View> */}
              {menuVisible && <MyButton style={[styles.menuBtnView, {height: 50 + menuHeight}]} onPress={() => this.props.navigation.navigate('Daily')}>
                <IcomoonIcon name='calendar' size={30} style={{ color: 'rgb(0, 122, 254)' }} />
              </MyButton>}
            </View>
            <View style={[styles.sliderTopBtn, {top: 50 + menuHeight}]}></View>
            <Text style={styles.content} >
            </Text>
            <View style={styles.sliderBottomBtn}></View>
          </TouchableOpacity>
          {/* <BottomSheet hasDraggableIcon ref={this.planRef} height={Common.window.height - 100} closeFunction={this.showMenu} sheetBackgroundColor={'#FFF'}>
            <MyPlanSlider {...this.props}/>
          </BottomSheet>
          <MyFinishPlanSheet hasDraggableIcon ref={this.finishRef} height={Common.window.height - 100} sheetBackgroundColor={'#FFF'}>
            <MyFinishPlanSlider finishTime={this.handleFinishTime.bind(this)} finishTimeEnd={(callback)=>this.handleFinishTimeEnd.bind(this, callback)} {...this.props}/>
            </MyFinishPlanSheet> */}
        </View>
        </View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#ffffff'
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8
  },
  topMenu: {
    width: windowWidth,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    // paddingLeft: 20,
    // paddingRight: 20,
    // marginTop: 20,
  },
  bottomMenu: {
    width: windowWidth,
    height: 40,
    marginBottom: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderBtn: {
    width: 50,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgb(0, 122, 254)',
  },
  sliderTopBtn: {
    width: 50,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgb(0, 122, 254)',
    position: 'absolute',
    zIndex: 2,
    left: windowWidth / 2 - 25,
  },
  sliderBottomBtn: {
    width: 50,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgb(0, 122, 254)',
    position: 'absolute',
    zIndex: 2,
    bottom: 50,
    left: windowWidth / 2 - 25,
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24
  },
  contentView: {
    position: 'absolute',
    width: windowWidth,
    // top:  windowHeight/4,
    // left:  windowWidth/4,
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    // backgroundColor: '#ff0000'
  },
  content: {
    flex: 1,
    width: windowWidth,
  },
  contentPress: {
    height: windowHeight,
    width: windowWidth / 2,
    top: 0,
    left: windowWidth / 4,
    // backgroundColor: '#ff0000'
  },
  mask: {
    width: windowWidth,
    height: windowHeight,
    top: 0,
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
  },
  isRecoding: {
    position: 'absolute',
    height: windowHeight,
    width: windowWidth,
    zIndex: 2,
    backgroundColor: "#000",
    opacity: 0.5,
    top: 0,
  },
  myFinishContent: {
    position: 'absolute',
    height: distance,
    width: windowWidth,
    top: 0,
    zIndex: 2
  },
  myPlanContent: {
    position: 'absolute',
    height: distance,
    width: windowWidth,
    bottom: 0,
    zIndex: 2
  },
  pressView: {
    position: 'absolute',
    height: 230,
    width: '100%',
    bottom: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  },
  pressBtn: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: '#4C5164',
    opacity: 0.6,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressBtnTxt: {
    fontSize: 16,
    color: '#fff',
  },
  talkInput: {
    height: 40,
    width: Common.window.width - 40,
    fontSize: 16,
    color: '#333',
    margin: 10,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  talkNameInput: {
    height: 30,
    flex: 1,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#eee',
    fontSize: 19,
    padding: 0,
    lineHeight: 19,
    color: '#606266',
    fontWeight: 'bold',
    marginRight: 3,
  },
  processInfo: {
    width: Common.window.width - 40,
    fontSize: 16,
    color: '#333',
  },
  listItemView: {
    display: 'flex',
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
    marginLeft: 15,
    marginRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  listItemTimeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    justifyContent: 'space-between'
  },
  listItemTimeStart: {
    fontSize: 17,
    color: '#606266',
    fontWeight: 'bold',
  },
  listItemTimeEnd: {
    fontSize: 17,
    color: '#909399',
    fontWeight: 'bold',
  },
  listItemTimeSplit: {
    width: 6,
    height: 43,
    borderRadius: 6,
    marginLeft: 10,
    marginRight: 10,
  },
  listItemRightView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    flex: 1,
    justifyContent: 'space-between'
  },
  listItemNoticeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    justifyContent: 'space-between'
  },
  listItemTitle: {
    fontSize: 19,
    color: '#606266',
    fontWeight: 'bold',
  },
  listItemContent: {
    fontSize: 15,
    color: '#909399',
    fontWeight: 'bold',
  },
  listTitleView: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleList: {
    marginTop: 5,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
    display: 'flex',
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleTime: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  listItemTitleFont: {
    fontSize: 18,
    color: '#909399',
    paddingTop: 5,
    paddingBottom: 5,
    // width: 78,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  listItemTitleWeekFont: {
    fontSize: 18,
    color: '#909399',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  titleTodayFont1: {
    fontSize: 15,
    color: '#007afe',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
  },
  setNoticeView: {
    backgroundColor: '#eee',
    width: 40,
    height: 40,
    borderRadius: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuBtnView: {
    width: 80,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  }
});
export default connect(MainPage.mapStateToProps)(MainPage);
