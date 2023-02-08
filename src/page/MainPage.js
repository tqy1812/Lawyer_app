import React,{Component} from 'react';
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
  ActivityIndicator
} from 'react-native';
import {
  WebView
} from 'react-native-webview-tencentx5';
import { Recognizer } from 'react-native-speech-iflytek';
// import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, {Importance} from 'react-native-push-notification';
import {connect} from 'react-redux';
import authHelper from '../helpers/authHelper';
import MyModal from '../components/MyModal';
import Common from "../common/constants";
import {showDrawerModal, DrawerModal, } from '../components/DrawerModal';
import {destroySibling, destroyAllSibling, showLoading, showModal, showRecoding, showPlanModal, showFinishModal} from '../components/ShowModal';
import MyFinishPlanSlider from '../components/MyFinishPlanSlider';
import MyPlanSlider from '../components/MyPlanSlider';
import actionProcess from '../actions/actionProcess';
import * as Storage from '../common/Storage';
import {getWeekXi} from '../utils/utils';
import IcomoonIcon from "../components/IcomoonIcon";
import MyButton from "../components/MyButton";
import actionCase from "../actions/actionCase";
import WebSocketClient from "../utils/WebSocketClient";
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from "react-native-gesture-bottom-sheet";
import MyFinishPlanSheet from "../components/MyFinishPlanSheet";
import moment from 'moment';

const {width: windowWidth,height: windowHeight} = Common.window;
const Toast = Overlay.Toast;
const distance = 50;

class MainPage extends Component {

  static mapStateToProps(state) {
      let props = {};
      props.user = state.Auth.user;
      props.isLogin = authHelper.logined(state.Auth.user);
      props.caseList = state.Case.caseList;
      props.finishList = state.Process.finishList;
      props.planList = state.Process.planList;
      return props;
  }
  
  constructor (props){
    super(props);
    // 设置初始值
    this.planRef = React.createRef();
    this.finishRef = React.createRef();
    this.state={
      appState:AppState.currentState,
      lastId:0,
      myPlanState: false,
      myFinishPlanState: false,
      talkModalVisible: false,
      talkSuccessModalVisible: false,
      talkContent: '',
      item: {},
      itemNotice: 0,
      isRecoding: false,
      loading: true,
      menuVisible: true,
    }
    DeviceEventEmitter.removeAllListeners();
    this.INJECTEDJAVASCRIPT = `
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'initial-scale=1, maximum-scale=1, user-scalable=0'); 
    meta.setAttribute('name', 'viewport'); 
    document.getElementsByTagName('head')[0].appendChild(meta);`
    this.wv = React.createRef();
    Recognizer.init("ed00abad");
    const that = this;
    this.timeStampMove = 0;
    this._panResponderMyPlan = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gs) => {
        this.timeStampMove = evt.timeStamp; 
          console.log('开始移动：' + evt.timeStamp + ' X轴：' + gs.dx + '，Y轴：' + gs.dy);
      },
      onPanResponderMove: (evt, gs) => {
        console.log('正在移动：'+ evt.timeStamp + ' X轴：' + gs.dx + '，Y轴：' + gs.dy);
        // if (this.timeStampMove > 0 && gs.dx < -distance) {
        //   this.timeStampMove = 0;

        //   console.log('由右向左');
        // } 
        // else 
        if(this.timeStampMove > 0 && gs.dy < -distance * 2){
          this.timeStampMove = 0;
          // this.finishRef.close();
          that.setState({menuVisible: false})
          // this.planRef.open('plan');
          this.planRef && this.planRef.current.show()
        } else if (this.timeStampMove > 0 && gs.dy > distance * 2) {
          this.timeStampMove = 0;
          //  this.planRef.close();
          // this.finishRef.open('finish');
          this.finishRef && this.finishRef.current.show()
        }
      },
      onPanResponderRelease: (evt, gs) => {
          console.log('结束移动：X轴移动了：' + gs.dx + '，Y轴移动了：' + gs.dy);
          that.stopRecord();
      }
    })
  }
  componentDidMount(){
    if(!this.props.isLogin) {
      this.props.navigation.navigate('Login');
    }
    this.props.dispatch(actionCase.reqCaseList()); 
    let wc = WebSocketClient.getInstance();
    console.log(wc);
    wc.initWebSocket();
    //监听状态改变事件
    AppState.addEventListener('change', this.handleAppStateChange);
    //监听内存报警事件
    // AppState.addEventListener('memoryWarning', function(){
    //   console.log("内存报警....");
    // });
     this.recognizerEventEmitter = new NativeEventEmitter(Recognizer);
     this.recognizerEventEmitter.addListener('onRecognizerResult', this.onRecognizerResult);
     this.recognizerEventEmitter.addListener('onRecognizerError', this.onRecognizerError);
     PushNotification.getChannels(function(channels) {
       console.log('....channels:'+JSON.stringify(channels));
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
      (created) => console.log(`createChannel '任务通知' returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
    destroySibling();
    destroyAllSibling();
    Storage.getUserRecord().then((user) => {
      if (user) {
        let obj = Object.assign({}, JSON.parse(user));
        this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveToken("'+obj.token+'");true;'); 
      }    
    });
    this.eventNoticeMsgReceive = DeviceEventEmitter.addListener('noticeMsg', 
   		(msg) => { this.scheduleNotfication(msg); });
      
    // showPlanModal(<DrawerModal
    //   component={<MyPlanSlider {...this.props}/>}
    //   ref={e => this.planRef = e}
    //   height={Common.window.height - 100}
    //   showType={'bottom'}
    //   close={this.showMenu}
    // /> );
    
    // showFinishModal(<DrawerModal
    //   component={<MyFinishPlanSlider finishTime={this.handleFinishTime.bind(this)} finishTimeEnd={this.handleFinishTimeEnd.bind(this)} {...this.props}/>}
    //   ref={e => this.finishRef = e}
    //   height={Common.window.height - 100}
    //   showType={'top'}
    // />);
  }
  componentWillUnmount(){
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.recognizerEventEmitter.removeAllListeners('onRecognizerResult');
    this.recognizerEventEmitter.removeAllListeners('onRecognizerError');
    this.eventNoticeMsgReceive && this.eventNoticeMsgReceive.remove();
    DeviceEventEmitter.removeAllListeners();
  }
  handleAppStateChange = (nextAppState) => {
    console.log('****************nextAppState=='+nextAppState);
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
        // this.wv && this.wv.current && this.wv.current.reload();
        // let map = {mouth: '{"height": [0.16, 0.4, 0.12, 0.0, 0.04, 0.08, 0.0, 0.04, 0.32, 0.12, 0.28, 0.16, 0.0, 0.0, 0.36, 0.28, 0.0, 0.0, 0.0, 0.0, 0.0, 0.08, 0.0, 0.0, 0.0, 0.0, 0.12, 0.04, 0.0, 0.0, 0.2, 0.08, 0.04, 0.2, 0.28, 0.44, 0.16, 0.12, 0.2, 0.2, 0.2, 0.24, 0.28, 0.32, 0.2, 0.12, 0.12, 0.0, 0.04, 0.04, 0.12, 0.2, 0.16, 0.24, 0.0, 0.04, 0.32, 0.16, 0.4, 0.12, 0.04, 0.0, 0.0, 0.12, 0.08, 0.0, 0.0, 0.04, 0.0, 0.04, 0.04, 0.16, 0.16, 0.16, 0.04, 0.16, 0.0, 0.12, 0.0, 0.08, 0.0, 0.12, 0.04, 0.16, 0.0, 0.12, 0.0, 0.0, 0.0, 0.0, 0.24, 0.08, 0.12, 0.0, 0.16, 0.16, 0.16, 0.2, 0.36, 0.04, 0.0, 0.04, 0.0, 0.04, 0.0, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.16, 0.36, 0.32, 0.28, 0.24, 0.2, 0.16, 0.0, 0.08, 0.0, 0.16, 0.08, 0.04, 0.0, 0.08, 0.08, 0.08, 0.0, 0.08, 0.2, 0.0, 0.12, 0.16, 0.08, 0.0, 0.0, 0.0, 0.0, 0.16, 0.12, 0.12, 0.08], "width": [0.04, 0.0, 0.0, 0.0, -0.04, 0.0, 0.0, 0.04, 0.0, 0.0, 0.0, 0.04, 0.04, 0.0, 0.08, 0.0, 0.0, 0.0, 0.0, 0.04, 0.08, 0.12, 0.08, 0.12, 0.04, 0.08, 0.04, 0.08, 0.04, 0.04, 0.04, 0.04, 0.12, 0.0, 0.0, 0.0, 0.0, 0.0, -0.04, 0.04, 0.04, -0.04, -0.04, 0.0, 0.04, 0.04, 0.08, 0.08, 0.04, 0.0, 0.0, 0.04, 0.0, 0.04, 0.04, 0.0, 0.04, 0.08, 0.0, 0.08, 0.04, 0.04, 0.04, 0.0, 0.0, 0.0, 0.0, 0.08, 0.04, 0.04, 0.04, 0.08, 0.04, 0.0, 0.04, 0.08, 0.04, 0.04, 0.0, 0.0, 0.04, 0.08, 0.04, 0.04, 0.0, 0.08, 0.0, 0.0, -0.04, 0.04, 0.0, 0.04, 0.0, 0.08, -0.04, 0.08, -0.04, 0.04, 0.0, 0.04, 0.08, 0.08, -0.04, 0.04, 0.04, 0.0, 0.0, 0.04, 0.08, 0.04, 0.04, 0.12, 0.0, 0.0, 0.04, 0.0, 0.0, 0.04, -0.04, 0.04, -0.04, 0.04, 0.08, 0.04, 0.04, 0.12, 0.12, 0.04, 0.04, 0.12, 0.12, 0.08, 0.04, 0.0, 0.0, -0.04, 0.0, 0.04, 0.0, 0.0, 0.0, 0.0, 0.0]}',
        // mp3_url: 'https://21-pub-dev.oss-cn-hangzhou.aliyuncs.com/21pub_speak/20221117165947957459.mp3' }
        // console.log('****************show'+ map.mouth);
        // let te = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbXBsb3llZV9pZCI6IjEiLCJwaG9uZSI6IjE3Nzc3Nzc3Nzc3IiwiaWF0IjoxNjczNDA1MTMxLjA5ODczMjIsImV4cCI6MTY3NDAwOTkzMS4wOTg3MzIyfQ.Zpc2Q0ugIKTLQj5gvO7-ya1ZTiPbPjjuB_6Bu2_VXm8"
        // this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("'+te+'");true;'); 
        // Storage.getUserRecord().then((user) => {
        //   if (user) {
        //     let obj = Object.assign({}, JSON.parse(user));
        //     console.log(obj)
        //     this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("1111", "'+obj.token+'");true;'); 
        //   }    
        // });
    }
    // else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)){
    //   console.log('***************hidden', this.wv);
    //   this.wv && this.wv.current && this.wv.current.injectJavaScript(`receiveMessage("stop");true;`);
    // }
    this.setState({appState: nextAppState});
  };

  sendRecording = (value) => {
    const {dispatch} = this.props;
    const that = this;
    that.setState({talkContent: '', talkModalVisible: false, loading: true});
    Storage.getUserRecord().then((user) => {
      if (user) {
        let obj = Object.assign({}, JSON.parse(user));
        this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("'+value+'", "'+obj.token+'");true;'); 
        setTimeout(() => {
          that.setState({loading: false});
        }, 15000)
      } 
      else{
        that.setState({loading: false});
      }
    });
    // dispatch(actionProcess.reqAddTalk(value, (rs)=>{
    //   // Toast.show(rs.answer ? rs.answer: '添加成功!');
    //   console.log(rs)
    //   that.setState({talkContent: '', talkModalVisible: false});
    //   this.wv && this.wv.current && this.wv.current.injectJavaScript(`receiveMessage(${JSON.stringify(rs)});true;`); 
    // })); 
  }

  startRecord = () => {
    console.log('startRecoding..........')
    // Toast.show('请开始添加');
    showRecoding();
    // this.setState({isRecoding: true});
    // this.sendRecording('recording')
    Recognizer.start();
  }

  stopRecord = () => {
    const that = this;
    Recognizer.isListening().then(value=>{
      console.log('stopRecord..........'+value)
      if(value) 
      {
        Recognizer.stop();
        destroySibling();
      }
      // that.setState({isRecoding: false});
    });
  }

  onRecognizerResult = (e) => {
    if (!e.isLast) {
        return;
    }
    if(e.result==''){
      Toast.show('不好意思，没听清楚');
      // this.sendRecording('stop_recording');
      return;
    }
    console.log(e.result);
    // this.setState({talkContent: e.result, talkModalVisible: true})
    this.sendRecording(e.result);
  }
 
  onRecognizerError= (result) => {
    if (result.errorCode !== 0) {
      // alert(JSON.stringify(result));
      
    }
  }

  scheduleNotfication = (content) =>{ 
    console.log('5555555555555555555555555===='+content);
    if(content) {
      let item = JSON.parse(content);
      console.log('5555555555555555555555555===='+item.case_name);
      PushNotification.localNotification({ 
        channelId: 'NEW_MESSAGE_NOTIFICATION',
        title: "任务提醒-" + item.case_name,
        message: item.process_name + ',时间:' + item.start_time, 
        id: this.state.lastId,
        date: new Date(Date.now() + (60 * 1000))
      }); 
      this.setState({lastId: (this.state.lastId+1)});
    }
  }
 
  test = () => {
    PushNotification.localNotification({ 
      channelId: 'NEW_MESSAGE_NOTIFICATION',
      title: "任务提醒-",
      message: "test", 
      id: this.state.lastId,
    }); 
    this.setState({lastId: (this.state.lastId+1)});
  }
  
  handleNativeMessage = (content) =>{ 
    console.log('handleNativeMessage===='+content);
    const {dispatch} = this.props;
    const that = this;
    if(content.indexOf('talk:') === 0) {
      const codeArr = content.split('&');
      const code = codeArr[0].replace('talk:', '')
      if(code ==='0') {
        const id = codeArr[1].replace('id:', '')
        if(id) {
          dispatch(actionProcess.reqGetProcess(id, (rs)=>{
            that.setState({loading: false, talkSuccessModalVisible: true, item: rs});
          })); 
        }
        else {
          that.setState({loading: false});
        }
      }
      else {
        that.setState({loading: false});
      }
    }
  }

  closePlan = () => {
    this.setState({myPlanState: false});
  }
  closeFinishPlan = () => {
    this.setState({myFinishPlanState: false});
  }
  handleFinishTime = (item) => {
    console.log(item)
    Recognizer.start();
  }
  handleFinishTimeEnd = () => {
    Recognizer.isListening().then(value=>{
      console.log('stopRecord..........'+value)
      if(value) 
      {
        Recognizer.stop();
      }
    });
  }
  closeTalk = () => {
    this.setState({talkModalVisible: false});
  }
  handleSending = () =>{
    if(this.state.talkContent) {
      this.sendRecording(this.state.talkContent);
    }
    else{
      this.setState({talkContent: '', talkModalVisible: false})
    }
  }
  handleTalkContentChanged(text) {
    let content = text.trim();
    this.setState({talkContent: content});
  }
  closeTalkSuccess = () => {
    this.setState({talkSuccessModalVisible: false, item: {}, itemNotice: false});
  }

  sendTalkSuccess = () => {
    const that = this;
    const {dispatch} = this.props;
    const { item } = this.state;
    showLoading();
    dispatch(actionProcess.reqEnableProcess(item.id, (rs)=>{
      destroySibling();
      DeviceEventEmitter.emit('refreshDailyProcess');
      that.setState({loading: false, talkSuccessModalVisible: false, item: {}, itemNotice: false});
    })); 
  }

  closeLoading = () => {
    this.setState({loading: false});
  }
  showMenu = () => {
    this.setState({menuVisible: true});
  }
  render() {
    const { menuVisible } = this.state;
     return (
      <SafeAreaView style={styles.container}>
        { this.state.loading && <View style={styles.mask}>
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
        </MyModal> */}
        <MyModal customTitleViewShow={false} cancelShow={true} confirmText={'确认'} isVisible={this.state.talkSuccessModalVisible} close={this.closeTalkSuccess} send={this.sendTalkSuccess} isTouchMaskToClose={true}>
          { this.props.caseList && this.state.item && this.state.item.id && JSON.stringify(this.props.caseList)!='{}' && <View style={styles.processInfo}>
            <View style={styles.listTitleView}>
              <View style={styles.titleList}><View style={styles.titleTime}><Text style={styles.listItemTitleFont}>{moment(this.state.item.start_time).format('MM月DD日')}</Text><Text style={styles.listItemTitleWeekFont}>{getWeekXi(this.state.item.start_time)}</Text></View>{<Text style={styles.titleTodayFont1}>假日/节日</Text>}</View>
            </View>
            <View style={styles.listItemView}>
              <View style={styles.listItemTimeView}><Text style={styles.listItemTimeStart}>{this.state.item.start_time ? moment(this.state.item.start_time).format('HH:mm') : '-- : --'}</Text><Text style={styles.listItemTimeEnd}>{this.state.item.end_time ? moment(this.state.item.end_time).format('HH:mm') : '-- : --'}</Text></View>
              <View style={[styles.listItemTimeSplit, {backgroundColor: this.props.caseList[this.state.item.case.id+''][2],}]}></View>
              <View style={styles.listItemRightView}><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{this.state.item.name}</Text><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{this.state.item.case.name}</Text></View>
              <View style={styles.listItemNoticeView}><MyButton style={styles.setNoticeView} onPress={() => {this.setState({itemNotice: !this.state.itemNotice})}}><IcomoonIcon name='alert_0' size={30} color={this.state.itemNotice ? '#007afe' : '#fff'} /></MyButton></View>
            </View>
            </View>
           }
        </MyModal>
        <WebView 
          ref={this.wv}
          source={{ uri: 'https://www.kykyai.com/cartoon/applive2d/demo/index.html' }} 
          // source={{ uri: 'https://human.kykyai.cn' }} 
          scalesPageToFit={false} 
          bounces={false}
          style={{width:windowWidth,height:'100%'}} 
          javaScriptEnabled={true}
          injectedJavaScript={this.INJECTEDJAVASCRIPT }
          onMessage={(event) => {this.handleNativeMessage(event.nativeEvent.data)}}
          mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
          userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
          incognito={true}
          onLoadEnd={this.closeLoading.bind(this)}
        />
        {/* { this.state.isRecoding && <View style={styles.isRecoding}><Wave height={50} lineColor={'#fff'}></Wave></View> } */}
        <View style={styles.contentView}>
          <View style={styles.topMenu}>
            { menuVisible && <MyButton style={styles.menuBtnView} onPress={()=> this.props.navigation.navigate('Center')}>
              <IcomoonIcon name='center' size={30} style={{color: 'rgb(0, 122, 254)'}}/>
            </MyButton>}
            {/* <View style={styles.sliderView}>
              <View style={styles.sliderBtn}></View>
            </View> */}
            { menuVisible && <MyButton style={styles.menuBtnView} onPress={()=> this.props.navigation.navigate('Daily')}>
              <IcomoonIcon name='calendar' size={30} style={{color: 'rgb(0, 122, 254)'}}/>
            </MyButton> }
          </View>
          <View style={styles.sliderTopBtn}></View>
          <Text style={styles.content} onLongPress={this.startRecord} onPressOut={this.stopRecord} {...this._panResponderMyPlan.panHandlers}>
          </Text>
          <View style={styles.sliderBottomBtn}></View>
          <BottomSheet hasDraggableIcon ref={this.planRef} height={Common.window.height - 100} closeFunction={this.showMenu} sheetBackgroundColor={'#FFF'}>
            <MyPlanSlider {...this.props}/>
          </BottomSheet>
          <MyFinishPlanSheet hasDraggableIcon ref={this.finishRef} height={Common.window.height - 100} sheetBackgroundColor={'#FFF'}>
            <MyFinishPlanSlider finishTime={this.handleFinishTime.bind(this)} finishTimeEnd={this.handleFinishTimeEnd.bind(this)} {...this.props}/>
            </MyFinishPlanSheet>
        </View>
      </SafeAreaView>)
    }
}

const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    width: windowWidth,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8
  },
  topMenu: {
    width: windowWidth,
    height: 50,
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
    top: 50,
    left: windowWidth/2 - 25,
  },
  sliderBottomBtn: {
    width: 50,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgb(0, 122, 254)',
    position: 'absolute', 
    zIndex: 2,
    bottom: 50,
    left: windowWidth/2 - 25,
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
    height: windowHeight,
    width: windowWidth,
    // top:  windowHeight/4,
    top: 0,
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
    width: windowWidth/2,
    top: 0,
    left:  windowWidth/4,
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
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    zIndex: 2
  },
  pressBtn: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: '#4C5164',
    opacity: 0.6,
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
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
  titleTime:{
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
    width: 100,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingTop: 20,
  }
});
export default connect(MainPage.mapStateToProps)(MainPage);
