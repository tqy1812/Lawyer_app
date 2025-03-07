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
  ScrollView
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
import { destroySibling, destroyAllSibling, showLoading, showModal, showCustomRecoding, showPlanModal, showFinishModal, showConfirmModal, showToast } from '../components/ShowModal';
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
import Wave from "../components/Wave";
import ImageArr from '../common/ImageArr';
import ProcessConfirmModal from '../components/ProcessConfirmModal';
import NetInfo from '@react-native-community/netinfo';
import { CommonActions, StackActions } from '@react-navigation/native';
import actionChat from '../actions/actionChat';
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
    props.chatLawPage = state.Chat.chatLawPage;
    return props;
  }

  constructor(props) {
    super(props);
    // 设置初始值
    this.updateProcessCallback = null;
    this.lastBackPressed = 0;
    this.currentAudioName = '';
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
      recoding: false,
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
    this.isCancel = false;
    this.INJECTEDJAVASCRIPT = `
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'initial-scale=0.5, user-scalable=0'); 
    meta.setAttribute('name', 'viewport'); 
    document.getElementsByTagName('head')[0].appendChild(meta);`
    this.wv = React.createRef();
    if(platform.isAndroid()) {
      Recognizer.init("5f5835be");
    }
    else{
      this.RecognizerIos = NativeModules.SpeechRecognizerModule;
      this.RecognizerIos && this.RecognizerIos.init("5f5835be");
    }
    Recognizer.setParameter('vad_bos', '10000');
    Recognizer.setParameter('vad_eos', '10000');
    
    Recognizer.getParameter('vad_eos').then(value=>{
      logger('RecognizerIos###########', value);
    })
    const that = this;
    this.timeStampMove = 0;
    this._panResponderMyPlan = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (e, gestureState) => {
        logger('onMoveShouldSetPanResponder.......................' + gestureState.dy)
        if (Math.abs(gestureState.dy) > 15) {
          return true;
        }
        else {
          return false;
        }
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: (evt, gestureState) => {
        // 另一个组件已经成为了新的响应者，所以当前手势将被取消。
        logger('劫走移动：' + evt.timeStamp + ' X轴：' + gs.dx + '，Y轴：' + gs.dy);
      },
      onPanResponderGrant: (evt, gs) => {
        this.timeStampMove = evt.timeStamp;
        logger('开始移动：' + evt.timeStamp + ' X轴：' + gs.dx + '，Y轴：' + gs.dy);
      },
      onPanResponderMove: (evt, gs) => {
        if (this.timeStampMove > 0 && gs.dy < -distance) {   //上滑
          this.isCancel = true;
          logger('上滑')
        } else if (this.timeStampMove > 0 && gs.dy > distance) { //下滑
          this.isCancel = false;
          logger('下滑')
        }
      },
      onPanResponderRelease: (evt, gs) => {
        logger('结束移动：X轴移动了：' + gs.dx + '，Y轴移动了：' + gs.dy);
        this.timeStampMove = 0;
        that.stopRecord();
      },
    });
    //键盘
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
  }
  componentDidMount() {
    if (!this.props.isLogin) {
      this.props.navigation.navigate('Login');
    }

    this.props.dispatch(actionChat.setChatLawPage(false));
    this.props.dispatch(actionCase.reqClientCaseList((list, infoList)=>{
      if(list) {
        this.setState({caseList: list})
      }
      if(infoList) {
        this.setState({caseListInfo: infoList})
      }

      if(globalData.getIsOpenFromNotify()){

        globalData.setIsOpenFromNotify(false)
      }
    }));
    this.props.dispatch(actionAuth.reqClientUserInfo());
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
    // if(platform.isIOS())
    //   NativeModules.SplashScreen && NativeModules.SplashScreen.IqKeyboardEnable();
    //移除键盘监听
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
  }



  _keyboardDidShow(e) {

    // if(platform.isIOS())
    //   NativeModules.SplashScreen && NativeModules.SplashScreen.IqKeyboardDisable();
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
    this.content && this.content.blur();
}

  // onRegistered = (deviceToken) => {
  //   const { dispatch } = this.props;
  //   logger('.......deviceToken='+deviceToken);
  //   if(deviceToken) {
  //     dispatch(actionAuth.reqDeviceToken(Common.devicePushType['IOS'], deviceToken, (result, error)=>{
  //       if(error){
  //         Toast.show(error.info)
  //       }
  //     }));
  //   }
  // };

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

  onBackButtonPressAndroid = () => {
    logger("...............onBackButtonPressAndroid ")
    return false;
  };

  handleAppStateChange = (nextAppState) => {
    logger('****************nextAppState==' + nextAppState);
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {

      this.props.dispatch(actionCase.reqClientCaseList((list, infoList)=>{
        if(list) {
          this.setState({caseList: list})
        }
        if(infoList) {
          this.setState({caseListInfo: infoList})
        }
      }));
      this.props.dispatch(actionAuth.reqClientUserInfo());
    }
    else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {

    }
    this.setState({ appState: nextAppState });
  };

  sendRecording = (value) => {
    const { dispatch } = this.props;
    const that = this;
    if(!value || value.trim()==='') {
      return;
    }
    that.setState({ talkContent: '', talkModalVisible: false });
    Storage.getUserRecord().then((user) => {
      if (user) {
        let obj = Object.assign({}, JSON.parse(user));
        value = value.replace(/\n/g, "&#10;");
        // logger('....value', value)
        this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + value + '", "' + obj.token + '");true;');
        this.setState({ input: '', isInput: false })
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
    const that = this;
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
    if(NativeModules.NotifyOpen){
      NativeModules.NotifyOpen.getAudioDir((file) =>{
        that.currentAudioName = file +'/'+ moment().format('YYYYMMDDHHmmss')+'.wav';
        Recognizer.setParameter('audio_format', 'wav');
        Recognizer.setParameter('asr_audio_path', that.currentAudioName.replace("/storage/emulated/0", ""));
        logger('.....audioDir='+that.currentAudioName);
        // this.setState({recoding: true});
        showCustomRecoding();
        that.startTimeout = setTimeout(()=>{
          this.timeStampMove = 0;
          that.stopRecord()
        }, 60000)
        that.isCancel = false;
        this.timeStampMove = 0;
        Recognizer.start();
      });
    }
  }
  startRecordIOS = () => {
    const isHasMic = NativeModules.OpenNoticeEmitter ? NativeModules.OpenNoticeEmitter.getRecordPermission() : 0;
    logger('...........isHasMic', isHasMic);
    const that = this;
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
      that.currentAudioName = 'asr'+moment().format('YYYYMMDDHHmmss')+'.pcm';
      this.RecognizerIos.setParameter('audio_source', '1');
      this.RecognizerIos.setParameter('asr_audio_path', that.currentAudioName);
      showCustomRecoding();
      // this.setState({recoding: true});
      this.startTimeout = setTimeout(()=>{
        console.log('....fei error ')
        this.timeStampMove = 0;
        that.stopRecord()
      }, 60000)
      logger('...........RecognizerIos', this.RecognizerIos);
      this.isCancel = false;
      this.timeStampMove = 0;
      this.RecognizerIos && this.RecognizerIos.start();
  }
  stopRecord = () => {
    const that = this;
    if(this.timeStampMove > 0) {
      return;
    }
    if(platform.isAndroid()){
      Recognizer.isListening().then(value => {
        logger('stopRecord..........' + value)
        if (value) {
          Recognizer.stop();
        }
        // that.setState({recoding: false});
        destroySibling();
      });
    }
    else {
      this.RecognizerIos.isListening().then(value => {
        logger('stopRecord..........' + value)
        if (value) {
          this.RecognizerIos.stop();
        }
        // that.setState({recoding: false});
        destroySibling();
      });
    }
    this.startTimeout && clearTimeout(this.startTimeout)
  }

  onRecognizerResult = (e) => {
    const that = this;
    if(this.props.chatLawPage) {
      return;
    }
    console.log('....islast', e.isLast)
    if (!e.isLast) {
      return;
    }
    // this.setState({recoding: false });
    destroySibling();
    if(this.isCancel){
      Toast.show('已取消发送');
      return;
    }
    if (e.result== '' || JSON.stringify(e.result)=="" )  {
      Toast.show('不好意思，没听清楚');
      return;
    }
    logger(e.result + "............." + JSON.stringify(this.state.updateItem));
    this.setState({loading: true});
    this.sendRecording(e.result);
    this.processTimeOut = setTimeout(() => {
      that.setState({loading: false});
    }, 5000);
  }


  onRecognizerError = (result) => {
    console.log("error............." + JSON.stringify(result));
    // this.setState({recoding: false });
    destroySibling();
    if (result.errorCode !== 0) {
      // alert(JSON.stringify(result));

    }
  }

  handleNativeMessage = (event) => {
    logger('handleNativeMessage====' + event.nativeEvent.data);
    const { dispatch } = this.props;
    const that = this;
    const content = event.nativeEvent.data;
    if (content.indexOf('custom:') === 0) {
      const codeArr = content.split('&');
      const code = codeArr[0].replace('custom:', '');
      if (code === '0') {
        const id = codeArr[1].replace('id:', '');
      }
      else{
        destroySibling();
        that.setState({ loading: false });
      }
    }
    else{
      destroySibling();
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
  handleTalkContentChanged(text) {
    let content = text.trim();
    this.setState({ talkContent: content });
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
    const { keyboardDidShow, isMic, recordContent, isShowMic, isInput, recoding } = this.state;
    const menuHeight = platform.isIOS() ? globalData.getTop() : Common.statusBarHeight;
    logger('..menuHeight', this.props.userInfo)
    return (
      <View style={styles.container}>
        <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
        {this.state.loading && <View style={styles.mask}>
          <ActivityIndicator size="large" color="black" />
        </View>}

        <WebView
            ref={this.wv}
            source={{ uri: Common.webUrl + 'customer/' }}
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
            allowsInlineMediaPlayback={true}
          />
          <View style={[styles.contentView, { top: 0, height: 80 + menuHeight}]} >
            <View style={[styles.topMenu, {height: 80 + menuHeight}]}>
              <MyButton style={[styles.menuBtnView, {height: 80 + menuHeight}]} onPress={() => this.props.navigation.navigate('Center', { key: this.props.navigation.getState().key })}>
                <Image resizeMode='contain' style={{ width: 42, height: 42 }} source={ImageArr['custom_menu_center']} />
              </MyButton>
               <MyButton style={[styles.menuBtnView, {height: 80 + menuHeight}]} onPress={() => this.props.navigation.navigate('ClientCase')}>
                <Image resizeMode='contain' style={{ width: 42, height: 42 }} source={ImageArr['custom_menu_report']} />
              </MyButton>
            </View>

            <View style={{ paddingRight: 30, paddingTop: 5, width: windowWidth, }}>
              <TouchableOpacity style={{ height: 30, display: 'flex', justifyContent: 'flex-end', flexDirection: 'row', width: '100%' }} onPress={() => this.props.navigation.navigate('ContactList', {key: this.RecognizerIos, emit: this.recognizerEventEmitter})}>
                <Image
                  style={{ width: 30, height: 30 }}
                  resizeMode='contain'
                  source={{ uri: 'https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/images/Vector.png' }} />
              </TouchableOpacity>
            </View>
          </View>
          {
              !isMic && <ScrollView style={[styles.scorllView, {bottom: 0, height: windowHeight - 80 - menuHeight}]} alwaysBounceVertical={false}>
         
              <View style={[styles.buttonView, { top: 0, height: windowHeight - 80 - menuHeight,}]} >
                
                  <View style={[styles.bottom, keyboardDidShow ? platform.isAndroid() ? { marginBottom: 20  } :  { marginBottom: 50  } : {}]}>
                      <TextInput
                          ref={(r) => this.content = r}
                          style={{ height: 60, width: windowWidth * 0.9 - 100, marginLeft: 20, fontSize: 20, color: '#fff' }}
                          onChange={() => { this.setState({ isInput: true }) }}
                          placeholder="请输入内容"
                          placeholderTextColor={'#b3b3b3'}
                          value={this.state.input}
                          onChangeText={newText => this.handleInput(newText)}
                      />

                      {!isInput && <MyButton style={styles.keyboardStyle} onPress={() => { this.setState({ isMic: true }) }}>
                          <Image resizeMode='contain' style={{ width: 50, height: 50 }} source={{ uri: 'https://lawyer-ky.oss-cn-hangzhou.aliyuncs.com/app_img/microphone-00.png' }} />
                      </MyButton>}

                      {isInput && <MyButton style={styles.keyboardStyle} onPress={() => { this.sendRecording(this.state.input) }}>
                          <Image resizeMode='contain' style={{ width: 50, height: 50 }} source={{ uri: 'https://lawyer-ky.oss-cn-hangzhou.aliyuncs.com/app_img/input.png' }} />
                      </MyButton>}
                  </View>

              
                </View>
            </ScrollView>
          }
          {
              isMic && <View style={[styles.recordView, { bottom: 0, height: windowHeight - 80 - menuHeight}]} {...this._panResponderMyPlan.panHandlers}>
                <View style={styles.bottom}>
                    <Text style={[styles.micStyle, { height: 60 }]} onLongPress={platform.isIOS() ? this.startRecordIOS.bind(this) : this.startRecordAndroid.bind(this)} onPressOut={this.stopRecord}>
                        {recordContent}
                    </Text>

                    { isShowMic && <Image resizeMode='contain' style={{ width: 30, height: 30, marginLeft: -windowWidth * 0.6 }} source={{ uri: 'https://lawyer-ky.oss-cn-hangzhou.aliyuncs.com/app_img/microphone.png' }} />}

                    <MyButton style={styles.keyboardStyle} onPress={() => { this.setState({ isMic: false }) }}>
                        <Image resizeMode='contain' style={{ width: 50, height: 50 }} source={{ uri: 'https://lawyer-ky.oss-cn-hangzhou.aliyuncs.com/app_img/keyboard.png' }} />
                    </MyButton> 
                    {/* { recoding && <View style={styles.waveView}><Wave height={35} width={6} lineColor={'#fff'}></Wave></View> } */}
                </View>
            </View> 
          }

          {/* { recoding && <View style={[styles.isRecoding, { height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]} >
              <Wave height={50} lineColor={'#fff'}></Wave>
            </View>
          } */}
        </View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#ffffff'
  },
  scorllView: {
      position: 'absolute',
      width: windowWidth,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 2,
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
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  buttonView: {
    width: windowWidth,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  recordView: {
    position: 'absolute',
    width: windowWidth,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'column',
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
    width: windowWidth,
    zIndex: 4,
    backgroundColor: "#000",
    opacity: 0.5,
    top: 0,
  },
  menuBtnView: {
    width: 100,
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
      color: '#fff',
      padding: 20
  },
  bottomBtnClicked: {
      backgroundColor: 'rgba(0, 0, 0, 0.20)',
      color: "#fff"
  },
  waveView: {
    height: 60,
    width: windowWidth * 0.9,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderRadius: 40,
    position: "absolute",
    zIndex: 3,
    top: 0,
  },
});
export default connect(CustomMainPage.mapStateToProps)(CustomMainPage);
