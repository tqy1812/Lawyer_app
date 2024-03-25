import React,{Component} from 'react';
import BaseComponent from '../components/BaseComponent';
import {
    StyleSheet,
    StatusBar,
    NativeModules,
    Image,
    View,
    TouchableOpacity,
    NativeEventEmitter,
} from 'react-native';
import Header from '../components/Header';
import {connect} from 'react-redux';
import Chat from '../chat/Chat';
import authHelper from '../helpers/authHelper';
import actionChat from '../actions/actionChat';
import { Recognizer } from 'react-native-speech-iflytek';
import { mockText,mockImage,mockLocation,mockVoice } from "../utils/mock";
import moment from 'moment';
import IcomoonIcon from "../components/IcomoonIcon";
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';
import platform from '../utils/platform';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import { logger } from '../utils/utils';
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import ImageViewer from '../chat/components/ImageView'
import {VideoScreen} from '../chat/components/VideoScreen/video_screen'
import { closeModal, showModal, showToast } from '../components/ShowModal';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import {createThumbnail} from 'react-native-create-thumbnail';
import dbHepler from '../utils/dbHelper';
import * as Storage from '../common/Storage';
const audioRecorderPlayer = new AudioRecorderPlayer();
const FileTypes = {
    All: DocumentPicker.types.allFiles,// All document types, on Android this is */*, on iOS is public.content (note that some binary and archive types do not inherit from public.content)
    Image: DocumentPicker.types.images, // All image types (image/* or public.image)
    Text: DocumentPicker.types.plainText, // Plain text files ie: .txt (text/plain or public.plain-text)
    Audio: DocumentPicker.types.audio, // All audio types (audio/* or public.audio)
    PDF: DocumentPicker.types.pdf, // PDF documents (application/pdf or com.adobe.pdf)
    Zip: DocumentPicker.types.zip, // Zip files (application/zip or public.zip-archive)
    Csv: DocumentPicker.types.csv, //Csv files (text/csv or public.comma-separated-values-text)
    Doc: DocumentPicker.types.doc, 
    Docx: DocumentPicker.types.docx, 
    Ppt: DocumentPicker.types.ppt, 
    Pptx: DocumentPicker.types.pptx, 
    Xls: DocumentPicker.types.xls, 
    Xlsx: DocumentPicker.types.xlsx, 
    Video: DocumentPicker.types.video
};

class ChatLawPage extends BaseComponent {
    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        props.userInfo = state.Auth.userInfo;
        props.chatMessageList = state.Chat.chatMessageList;
        props.chatLawPage = state.Chat.chatLawPage;
        return props;
    }

    constructor(props) {
        super(props);
        console.log('law....', props.route.params.contact)
        this.state = {
            type: props.user.type ? props.user.type : 1,
            id: props.route.params.contact.id,
            hasMore: false,
            url: props.route.params.contact.url,
            method: props.route.params.contact.method,
            headers: props.route.params.contact.headers,
            params: props.route.params.contact.params,
            rightUser: {
                _id: props.userInfo.id,
                name: props.userInfo.name,
                avatar: props.userInfo.avatar
            },
            leftUser: {
                _id: props.route.params.contact.id,
                name: props.route.params.contact.name,
                avatar: props.route.params.contact.avatar
            },
            imagePath: '', 
        };
        this.page = 1;
        this.fileList = {}
        this.loading = false
        this.isCancel = false
    }
    componentDidMount() {
        if (!this.props.isLogin) {
          this.props.navigation.navigate('Login');
        }
        this.page = 1;
        if(platform.isIOS()) {
            this.RecognizerIos = this.props.route.params.key
        }
        this.recognizerEventEmitter = this.props.route.params.emit;
        console.log(this.RecognizerIos,  this.recognizerEventEmitter)
        this.recognizerEventEmitter.addListener('onRecognizerResult', this.onRecognizerResult);
        this.props.dispatch(actionChat.setChatLawPage(true));
    }
    componentWillUnmount() {
        // dbHepler.closeDB()
      this.props.dispatch(actionChat.setChatLawPage(false));
    }
    onRecognizerResult = (e) => {
      const that = this;
      if(!this.props.chatLawPage) {
        return;
      }
      if(this.isCancel) {
        return;
      }
      if (!e.isLast) {
        return;
      }
      if (e.result == '' || JSON.stringify(e.result) == "") {
        showToast('不好意思，没听清楚');
        return;
      }
      console.log(e.result + ".............");
      this.onSend(e.result)
    }
  
    async startRecordAndroid() {
        let isHasMic = await NativeModules.NotifyOpen.getRecordPermission();
        const that = this;
        if (isHasMic == 0) {
          return;
        }
        else if (isHasMic == 1) {
          Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
            text: '取消',
            onPress: null,
          },
          {
            text: '去设置',
            onPress: () => { NativeModules.NotifyOpen && NativeModules.NotifyOpen.openPermission(); },
          },
          ]);
          return;
        }
        Recognizer.start();
        this.startTimeout = setTimeout(() => {
          that.stopRecording()
        }, 60000)
    }
    startRecordIOS = (type) => {
        const isHasMic = NativeModules.OpenNoticeEmitter ? NativeModules.OpenNoticeEmitter.getRecordPermission() : 0;
        const that = this;
        logger('...........isHasMic', isHasMic);
        if (isHasMic == 0) {
          return;
        }
        else if (isHasMic == 1) {
          Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
            text: '取消',
            onPress: null,
          },
          {
            text: '去设置',
            onPress: () => { NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting(); },
          },
          ]);
          return;
        }
        this.RecognizerIos && this.RecognizerIos.start();
        this.startTimeout = setTimeout(() => {
            that.stopRecording()
          }, 60000)
      }
      startRecording = () => {
        this.isCancel = false
        if(platform.isAndroid()){
            this.startRecordAndroid()
        } else {
            this.startRecordIOS()
        }
      }
      stopRecording = (canceled) => {
        const that = this;
        this.isCancel = canceled;
        Recognizer.isListening().then(value => {
            logger('stopRecord..........' + value)
            if (value) {
              Recognizer.stop();
            }
          });
        this.startTimeout && clearTimeout(this.startTimeout)
      }
      getList = () => {
      }
    sendApi = (content, callback) => {
        const { url, method, headers, params } = this.state;
        this.props.dispatch(actionChat.sendLawApi(url, method, headers, params, content, callback));
    };
    onSend = (text)=>{ 
        const { id } = this.state;
        let sendMsg = this.formatSendText(true, text,"send_success") ;
        this.messageList.appendToTop([sendMsg]);
        let recMsg = this.formatSendText(false, '', "send_going");
        setTimeout(()=>{
          this.messageList.appendToTop([recMsg]);
        }, 300)
        this.sendApi(text, (rs, error) => {
            console.log('send succsee', rs, error)
            if(error) {
                showToast(error.info)
            }
            else {
                recMsg.status = "send_success";
                recMsg.text = rs.data.answer;
                this.messageList.updateMsg(recMsg);
            }
        })
    };
    formatSendText = (isOutgoing=true,text,status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { text, isOutgoing, msgId, msgType: "text",status,fromUser:this.state.rightUser } ;
        } else {
            return { text, isOutgoing, msgId, msgType: "text",status, fromUser:this.state.leftUser } ;
        }
    };
    onMessageLongPress = (message)=>{
        // alert(message.msgType+"")
        console.log("message long press....",message)
    };
    onFailPress = (message)=>{
        console.log("fail...")
        alert("fail messgae id"+message.msgType);
    };
    onMessageListTouch = ()=>{
        console.log("列表手指点下事件...");
    };
    onScroll(){
        console.log("滚动消息列表");
    }
    onLoadMoreAsync = (callback) => {
        console.log("加载更多")
        this.getList()
        if(callback) callback();
    };
    onRefreshAsync = () => {
        console.log("重新加载")
        this.page = 1;
        this.getList()
    };

    handleBack = () => {
      this.props.dispatch(actionChat.setChatLawPage(false));
      this.
      props.navigation.goBack();
    }
    render() {
        return (
            <SafeAreaView style={[styles.container]}>
                <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
                <Header title={this.state.leftUser.name} back={true} cancelFunc={this.handleBack.bind(this)} {...this.props}/>
                <Chat onLoad={(messageList,input)=>{
                                this.messageList = messageList ;
                                this.input = input ;}}
                            onSend = { this.onSend }
                            startRecording={this.startRecording}
                            stopRecording={this.stopRecording}
                            onFailPress={this.onFailPress}
                            canLoadMore={this.state.hasMore}
                            onLoadMoreAsync={this.onLoadMoreAsync}
                            onRefreshAsync={this.onRefreshAsync}
                            isTools={false}
                />
        </SafeAreaView>  )
    }
}
export default connect(ChatLawPage.mapStateToProps)(ChatLawPage);


const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: Common.window.height,
      backgroundColor: '#fff',
      color: '#000',
      justifyContent: 'center'
   },
   icon: {
     width: 50,
     height: 50,
   },
   footer: {
     display: 'flex',
     flexDirection: 'row',
     justifyContent: 'space-around',
     alignItems: 'center',
     marginBottom: 20
   },
  });
