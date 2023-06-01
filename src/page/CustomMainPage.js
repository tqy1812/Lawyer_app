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
  ImageBackground,
  Image,
} from 'react-native';
import {
  WebView
} from 'react-native-webview';
import { Recognizer } from 'react-native-speech-iflytek';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from 'react-native-push-notification';
import {TYPE_AUTH_USER} from '../actions/actionRequest';
import { connect } from 'react-redux';
import authHelper from '../helpers/authHelper';
import MyModal from '../components/MyModal';
import BaseComponent from '../components/BaseComponent';
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
import { CommonActions, StackActions } from '@react-navigation/native';
const { width: windowWidth, height: windowHeight } = Common.window;
const Toast = Overlay.Toast;
const distance = 50;

const globalData = GlobalData.getInstance();
class CustomMainPage extends BaseComponent {

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
      editDateShow: false,
      keyboardDidShow: false,
      isMic: true,
      keyboardHeight: 0,
      recordContent: '',//录音得到的内容,
      isShowMic: true,
      isInput: false,//是否输入了内容
    }
    // DeviceEventEmitter.removeAllListeners();
    this.INJECTEDJAVASCRIPT = `
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'initial-scale=0.5, user-scalable=0'); 
    meta.setAttribute('name', 'viewport'); 
    document.getElementsByTagName('head')[0].appendChild(meta);`
    this.wv = React.createRef();
    // logger('###########', Recognizer);
    if(platform.isAndroid()) {
      Recognizer.init("5f5835be");
    }
    else{
      this.RecognizerIos = NativeModules.SpeechRecognizerModule;
      this.RecognizerIos && this.RecognizerIos.init("5f5835be");
      // this.RecognizerIos.setParameter('vad_bos', '10000');
      // this.RecognizerIos.setParameter('vad_eos', '10000');
    }
    Recognizer.setParameter('vad_bos', '10000');
    Recognizer.setParameter('vad_eos', '10000');
    Recognizer.getParameter('vad_eos').then(value=>{
      logger('RecognizerIos###########', value);
    })
    const that = this;
    this.timeStampMove = 0;

    //键盘
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    
  }
  componentDidMount() {
    if (!this.props.isLogin) {
      this.props.navigation.navigate('Login');
    }
    this.props.dispatch(actionCase.reqClientCaseList((list, infoList)=>{
      if(list) {
        this.setState({caseList: list})
      }
      if(infoList) {
        this.setState({caseListInfo: infoList})
      }
      // showPlanModal(<DrawerModal
      //   component={<MyPlanSlider finishTime={platform.isIOS() ? this.handleFinishTimeIOS.bind(this) : this.handleFinishTimeAndroid.bind(this)} finishTimeEnd={(item, callback) => this.handleFinishTimeEnd(item, callback)} {...this.props} caseList={list}/>}
      //   ref={e => this.planRef = e}
      //   height={Common.window.height - 100}
      //   showType={'bottom'}
      //   close={this.showMenu}
      // />);
  
      // showFinishModal(<DrawerModal
      //   component={<MyFinishPlanSlider finishTime={platform.isIOS() ? this.handleFinishTimeIOS.bind(this) : this.handleFinishTimeAndroid.bind(this)} finishTimeEnd={(item, callback) => this.handleFinishTimeEnd(item, callback)} {...this.props} caseList={list}/>}
      //   ref={e => this.finishRef = e}
      //   height={Common.window.height - 100}
      //   showType={'top'}
      // />);
  
      if(globalData.getIsOpenFromNotify()){
      
        globalData.setIsOpenFromNotify(false)
      }
    }));
    this.props.dispatch(actionAuth.reqUserInfo());
    //监听状态改变事件
    AppState.addEventListener('change', this.handleAppStateChange);
    //监听内存报警事件
    // AppState.addEventListener('memoryWarning', function(){
    //   logger("内存报警....");
    // });
    this.recognizerEventEmitter = new NativeEventEmitter(platform.isAndroid() ?  Recognizer : this.RecognizerIos);
    this.recognizerEventEmitter.addListener('onRecognizerResult', this.onRecognizerResult);
    this.recognizerEventEmitter.addListener('onRecognizerError', this.onRecognizerError);
    this.eventLogoutReceive = DeviceEventEmitter.addListener('requestLoginout', () => { this.handLogout(); });
    
    destroySibling();
    destroyAllSibling();
    Storage.getUserRecord().then((user) => {
      if (user) {
        let obj = Object.assign({}, JSON.parse(user));
        this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveToken("' + obj.token + '");true;');
      }
    });
   
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.recognizerEventEmitter && this.recognizerEventEmitter.removeAllListeners('onRecognizerResult');
    this.recognizerEventEmitter && this.recognizerEventEmitter.removeAllListeners('onRecognizerError');
    this.eventWsBind && this.eventWsBind.remove();
    this.eventNoticeMsgReceive && this.eventNoticeMsgReceive.remove();
    this.eventNoticeOpen && this.eventNoticeOpen.remove();
    this.eventKeepAliveSocket && this.eventKeepAliveSocket.remove();
    this.eventLogoutReceive && this.eventLogoutReceive.remove();
    //移除键盘监听
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }


      
  _keyboardDidShow(e) {
    // console.log(e)
    this.setState({
        keyboardHeight: e.endCoordinates.height,
        keyboardDidShow: true
    })
}

_keyboardDidHide(e) {
    this.setState({
        keyboardHeight: 0,
        keyboardDidShow: false
    })
}

  onRegistered = (deviceToken) => {
    const { dispatch } = this.props;
    logger('.......deviceToken='+deviceToken);
    if(deviceToken) {
      dispatch(actionAuth.reqDeviceToken(Common.devicePushType['IOS'], deviceToken, (result, error)=>{
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

  handLogout() {
    const {dispatch} = this.props;
    dispatch({type: TYPE_AUTH_USER, data: {}});
    Storage.setAutoLogin('0');
    dispatch(actionAuth.logoutRecord());
    this.props.navigation.dispatch(state => {
      logger('.......handLogout', state)
      return CommonActions.reset({
        ...state,
        routes: [{name: 'Login'}],
        index:0,
      });
    });
  }

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
    logger('****************nextAppState==' + nextAppState);
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      if(platform.isAndroid()){
        NativeModules.NotifyOpen.getDeviceType((type) =>{
          const deviceType = Common.devicePushType[type] ? Common.devicePushType[type] : Common.devicePushType.WSS;
          if(Common.devicePushType['WSS'] === deviceType) {
            if (this.wc) this.wc.setIsBackground(false);
            NativeModules.WebSocketWorkManager.stopBackgroundWork();
          }
        })
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
      DeviceEventEmitter.emit('refreshDailyProcess');
    }
    else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {
      // logger('***************hidden', this.wc);
      if(platform.isAndroid()){
        NativeModules.NotifyOpen.getDeviceType((type) =>{
          const deviceType = Common.devicePushType[type] ? Common.devicePushType[type] : Common.devicePushType.WSS;
          if(Common.devicePushType['WSS'] === deviceType) {
            if (this.wc) this.wc.setIsBackground(true);
            NativeModules.WebSocketWorkManager.startBackgroundWork();
           }
        })
      }
    }
    this.setState({ appState: nextAppState });
  };

  sendRecording = (value) => {
    const { dispatch } = this.props;
    const that = this;
    that.setState({ talkContent: '', talkModalVisible: false });
    Storage.getUserRecord().then((user) => {
      if (user) {
        let obj = Object.assign({}, JSON.parse(user));
        this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + value + '", "' + obj.token + '");true;');
      }
      else {
        that.setState({ loading: false });
        this.processTimeOut && clearTimeout(this.processTimeOut);
        destroySibling();
      }
    });
  }
  async startRecordAndroid() {
    let isHasMic = await NativeModules.NotifyOpen.getRecordPermission();
    if(isHasMic== 0){
      return;
    }
    else if(isHasMic== 1){
      Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
        text: '取消',
        onPress: null,
        },
        {
          text: '去设置',
          onPress: () => {NativeModules.NotifyOpen && NativeModules.NotifyOpen.openPermission();},
        },
        ]);
      return;
    }
    showRecoding();
    // this.setState({isRecoding: true});
    // this.sendRecording('recording')
    Recognizer.start();
  }
  startRecordIOS = () => {
    const isHasMic = NativeModules.OpenNoticeEmitter ? NativeModules.OpenNoticeEmitter.getRecordPermission() : 0;
    logger('...........isHasMic', isHasMic);
    if(isHasMic== 0){
      return;
    }
    else if(isHasMic== 1){
      Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
        text: '取消',
        onPress: null,
        },
        {
          text: '去设置',
          onPress: () => {NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting();},
        },
        ]);
        return;
      }
      showRecoding();
      logger('...........RecognizerIos', this.RecognizerIos);
      this.RecognizerIos && this.RecognizerIos.start();
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
    const that = this;
    if (!e.isLast) {
      return;
    }
    if (e.result== '' || JSON.stringify(e.result)=="" )  {
      Toast.show('不好意思，没听清楚');
      this.setState({ updateItem: {} });
      destroySibling();
      // this.sendRecording('stop_recording');
      return;
    }
    logger(e.result + "............." + JSON.stringify(this.state.updateItem));
    if (this.state.updateItem && this.state.updateItem.id) {
      showLoading();
      if (this.updateProcessCallback) this.updateProcessCallback(this.state.updateItem, e.result);
      this.setState({ updateItem: {} });
      // destroySibling();
    }
    else{
      this.setState({loading: true});
      this.sendRecording(e.result);
      this.processTimeOut = setTimeout(() => {
        that.setState({loading: false});
      }, 5000);
      // destroySibling();
    }
  }


  onRecognizerError = (result) => {
    logger("error............." + JSON.stringify(result));
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
          title: "任务提醒-" + item.process_name,
          message: '时间:' + item.start_time,
          id: this.state.lastId,
          date: new Date(Date.now()),
          when: new Date().getTime()
        });
        this.setState({ lastId: (this.state.lastId + 1) });
      }
      else {
        this.sendLocalNotification({ Title: "任务提醒-" + item.process_name, Message:'时间:' + item.start_time });
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

  handleNativeMessage = (event) => {
    logger('handleNativeMessage====' + event.nativeEvent.data);
    const { dispatch } = this.props;
    const that = this;
    const content = event.nativeEvent.data;
    if (content.indexOf('talk:') === 0) {
      const codeArr = content.split('&');
      const code = codeArr[0].replace('talk:', '')
      if (code === '0') {
        const id = codeArr[1].replace('id:', '')
        const caselist = codeArr.length > 2 ? codeArr[2].replace('caselist:', '') ? JSON.parse(codeArr[2].replace('caselist:', '')) : [] : []
        if (id) {
          dispatch(actionProcess.reqGetProcess(id, (rs, error) => {
            if(error) {
              Toast.show(error.info);
              destroySibling();
              this.processTimeOut && clearTimeout(this.processTimeOut);
              that.setState({ loading: false});
            }
            else {
              that.showConfirm(rs, caselist);
              destroySibling();
              this.processTimeOut && clearTimeout(this.processTimeOut);
              that.setState({ loading: false});
            }
          }));
        }
        else {
          destroySibling();
          this.processTimeOut && clearTimeout(this.processTimeOut);
          that.setState({ loading: false });
        }
      }
      else {
        destroySibling();
        this.processTimeOut && clearTimeout(this.processTimeOut);
        that.setState({ loading: false });
      }
    }
    else{
      destroySibling();
      this.processTimeOut && clearTimeout(this.processTimeOut);
      that.setState({ loading: false });
    }
  }

  closePlan = () => {
    this.setState({ myPlanState: false });
  }
  closeFinishPlan = () => {
    this.setState({ myFinishPlanState: false });
  }
  handleFinishTimeIOS(item) {
    const isHasMic = NativeModules.OpenNoticeEmitter ? NativeModules.OpenNoticeEmitter.getRecordPermission() : 0;
    logger('...........isHasMic', isHasMic);
    if(isHasMic== 0){
      return;
    }
    else if(isHasMic== 1){
      Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
        text: '取消',
        onPress: null,
        },
        {
          text: '去设置',
          onPress: () => {NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting();},
        },
        ]);
        return;
    }
    this.RecognizerIos.start();
    this.updateProcessCallback = null;
    // logger('.....handleFinishTime' + JSON.stringify(item))
    this.setState({ updateItem: item });
  }
  async handleFinishTimeAndroid(item) {
    let isHasMic = await NativeModules.NotifyOpen.getRecordPermission();
    logger('...........isHasMic', isHasMic);
    if(isHasMic== 0){
      return;
    }
    else if(isHasMic== 1){
      Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
        text: '取消',
        onPress: null,
        },
        {
          text: '去设置',
          onPress: () => {NativeModules.NotifyOpen && NativeModules.NotifyOpen.openPermission();},
        },
        ]);
      return;
    }
    Recognizer.start();
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
  handleInput(text) {
    this.setState({ input: text }, () => {
        if (!this.state.input) {
            this.setState({ isInput: false })
        }
    });
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

  showConfirm = (item, caseListInfo) => {
    
    if(item && item.id) {
      showConfirmModal(<ProcessConfirmModal {...this.props} submint={(item)=>this.sendProcessConfirm(item)} item={item} close={this.closeTalkSuccess} caseLists={this.props.caseList} 
      caseListInfo={caseListInfo}/>);
    }
  } 
  render() {
    const { keyboardDidShow, isMic, recordContent, isShowMic, isInput } = this.state;
    const menuHeight = platform.isIOS() ? globalData.getTop() : Common.statusBarHeight;
    logger('..menuHeight', menuHeight)
    return (
      <View style={styles.container}>
        <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
        {this.state.loading && <View style={styles.mask}>
          <ActivityIndicator size="large" color="black" />
        </View>}
        
        <WebView
            ref={this.wv}
            source={{ uri: this.props.userInfo.voice_type==='male' ? Common.webUrl + 'lawyer_male/index.html' :  Common.webUrl + 'demo/index.html' }}
            // source={{ uri: 'https://human.kykyai.cn' }}
            scalesPageToFit={true}
            bounces={false}
            style={{ width: windowWidth, height: '100%' }}
            javaScriptEnabled={true}
            // injectedJavaScript={this.INJECTEDJAVASCRIPT}
            onMessage={this.handleNativeMessage.bind(this)}
            mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined} 
            startInLoadingState={true}
            userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
            incognito={false}
            onLoadEnd={this.closeLoading.bind(this)}
          />

         <View style={[styles.contentView, { top: 0, height: windowHeight,}]} >
            <View style={[styles.topMenu, {height: 80 + menuHeight}]}>
              <MyButton style={[styles.menuBtnView, {height: 80 + menuHeight}]} onPress={() => this.props.navigation.navigate('Center', { key: this.props.navigation.getState().key })}>
                <Image style={{ width: 42, height: 42 }} source={ ImageArr['custom_menu_center'] } />
              </MyButton>
               <MyButton style={[styles.menuBtnView, {height: 80 + menuHeight}]} onPress={() => this.props.navigation.navigate('Daily')}>
               <Image style={{ width: 42, height: 42 }} source={ ImageArr['custom_menu_report'] } />
              </MyButton>
            </View>
            <Text style={styles.content} >
            </Text>

            {
              !isMic &&
              <View style={[styles.bottom, keyboardDidShow && { marginBottom: 80 + this.state.keyboardHeight }]}>
                  <TextInput
                      style={{ height: 60, width: windowWidth * 0.9 - 100, marginLeft: 20, fontSize: 20 }}
                      onChange={() => { this.setState({ isInput: true }) }}
                      placeholder="请输入内容"
                      placeholderTextColor={'#b3b3b3'}
                      value={this.state.input}
                      onChangeText={newText => this.handleInput(newText)}
                  />

                  {!isInput && <MyButton style={styles.keyboardStyle} onPress={() => { this.setState({ isMic: true }) }}>
                      <Image style={{ width: 50, height: 50 }} source={ ImageArr['microphone'] } />
                  </MyButton>}

                  {isInput && <MyButton style={styles.keyboardStyle} onPress={() => { this.sendMessage(index) }}>
                      <Image style={{ width: 50, height: 50 }} source={ ImageArr['input'] } />
                  </MyButton>}
              </View>

           }
           {
              isMic &&
                <View style={styles.bottom}>
                    <Text style={[styles.micStyle, { height: 60 }]} onLongPress={platform.isIOS() ? this.startRecordIOS : this.startRecordAndroid} onPressOut={this.stopRecord}>
                        {recordContent}
                    </Text>

                    {isShowMic && < Image style={{ width: 30, height: 30, marginLeft: -windowWidth * 0.6 }} source={ ImageArr['microphone'] } />}

                    <MyButton style={styles.keyboardStyle} onPress={() => { this.setState({ isMic: false }) }}>
                        <Image style={{ width: 50, height: 50 }} source={ ImageArr['input'] } />
                    </MyButton>
                </View>
            }
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
    alignItems: 'center',
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
  sliderTopBtn: {
    width: Common.window.width /10,
    height: Common.window.width /50,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 122, 254, 0.75)',
    position: 'absolute',
    zIndex: 2,
    left: windowWidth / 2 - Common.window.width /20,
  },
  sliderBottomBtn: {
    width: Common.window.width /10,
    height: Common.window.width /50,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 122, 254, 0.75)',
    position: 'absolute',
    zIndex: 2,
    bottom: 50,
    left: windowWidth / 2 - 25,
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
  menuBtnView: {
    width: 80,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  bottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 40,
    marginBottom: 40,
    width: windowWidth * 0.9,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

      // padding: 10
  },
  keyboardStyle: {
      width: 60,
      height: 45,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      borderRadius: 50,
  },
  micStyle: {
      alignItems: 'center',
      justifyContent: 'center',
      // textAlign: 'center',
      backgroundColor: "rgba(217, 217, 217, 0)",
      borderRadius: 50,
      width: windowWidth * 0.9 - 80,
      zIndex: 2,
      fontSize: 20,
      color: '#b3b3b3',
      padding: 20
  },
  bottomBtnClicked: {
      backgroundColor: 'rgba(0, 0, 0, 0.20)',
      color: "#fff"
  },
});
export default connect(CustomMainPage.mapStateToProps)(CustomMainPage);
