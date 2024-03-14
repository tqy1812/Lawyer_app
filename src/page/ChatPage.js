import React,{Component} from 'react';
import BaseComponent from '../components/BaseComponent';
import {
    StyleSheet,
    StatusBar,
    NativeModules,
    Image,
    View,
    TouchableOpacity
} from 'react-native';
import Header from '../components/Header';
import {connect} from 'react-redux';
import Chat from '../chat/Chat';
import authHelper from '../helpers/authHelper';
import actionChat from '../actions/actionChat';
import { mockText,mockImage,mockLocation,mockVoice } from "../utils/mock";
import moment from 'moment';
import IcomoonIcon from "../components/IcomoonIcon";
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';
import platform from '../utils/platform';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {saveFileToLocal} from '../utils/utils';
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import Modal from "react-native-modal"
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import ImageViewer from '../chat/components/ImageView'
import { closeModal, showModal } from '../components/ShowModal';
const audioRecorderPlayer = new AudioRecorderPlayer();
const FileTypes = {
    All: DocumentPicker.types.allFiles,// All document types, on Android this is */*, on iOS is public.content (note that some binary and archive types do not inherit from public.content)
    Image: DocumentPicker.types.images, // All image types (image/* or public.image)
    Text: DocumentPicker.types.plainText, // Plain text files ie: .txt (text/plain or public.plain-text)
    Audio: DocumentPicker.types.audio, // All audio types (audio/* or public.audio)
    PDF: DocumentPicker.types.pdf, // PDF documents (application/pdf or com.adobe.pdf)
    Zip: DocumentPicker.types.zip, // Zip files (application/zip or public.zip-archive)
    Csv: DocumentPicker.types.csv, //Csv files (text/csv or public.comma-separated-values-text)
};

class ChatPage extends BaseComponent {
    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        props.userInfo = state.Auth.userInfo;
        props.chatMessageList = state.Chat.chatMessageList;
        return props;
    }

    constructor(props) {
        super(props);
        this.state = {
            show:false,
            text:"",
            color:"",
            type: props.user.type ? props.user.type : 1,
            id: props.route.params.id,
            hasMore: false,
            rightUser: {
                _id: props.userInfo.id,
                name: props.userInfo.name,
                avatar: props.userInfo.avatar
            },
            leftUser: {
                _id: props.route.params.id,
                name: props.route.params.name,
                avatar: props.route.params.avatar
            },
            imagePath: ''
        };
        this.page = 1;
    }
    componentDidMount() {
        if (!this.props.isLogin) {
          this.props.navigation.navigate('Login');
        }
        this.page = 1;
        this.getList()
        
    }
    getList = () => {
        if(!this.state.hasMore && this.page > 1) {
            return 
        }
        if(this.state.type===2) {
            this.props.dispatch(actionChat.getEmployeeChatList(this.page, 10, this.state.id, (rs)=>{
                if(rs && rs.data && rs.data.length > 0) {
                    this.page = this.page+1
                    this.messageList.appendToBottom(rs.data)
                    this.setState({hasMore: rs.data.page * rs.data.per_page < rs.data.total})
                }
            }));
        } else {
            this.props.dispatch(actionChat.getClientChatList(this.page, 10, this.state.id, (rs)=>{
                if(rs && rs.data && rs.data.length > 0) {
                    this.page = this.page+1
                    console.log(rs.data)
                    this.messageList.appendToBottom(rs.data)
                    this.setState({hasMore: rs.data.page * rs.data.per_page < rs.data.total})
                }
            }));
        }
    }
    startRecording = async() =>{
        console.log("开始录音...")
        this.recorderName = new Date().getTime() + '.m4a'
        const rs = await audioRecorderPlayer.startRecorder(this.recorderName);
        audioRecorderPlayer.addRecordBackListener((e)=>{
            console.log("startRecording", e)
            this.recorderNameDuration = Math.round(e.currentPosition)
        })
        this.recorderUrl = rs
        console.log("startRecording.....", rs)
    };
    stopRecording = async(canceled)=>{
        if(canceled){// 取消录音发送
            return;
        }
        const that = this;
        const {dispatch} = this.props;
        const rs = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        const file = {
            uri: this.recorderUrl,
            name: this.recorderName
        }
        let sendMsg = this.formatSendVoice(true, file.uri, false, false, this.recorderNameDuration, "send_going") ;
        this.messageList.appendToTop([sendMsg]);
        let meta = {duration: this.recorderNameDuration}
        if(that.state.type==2){
            dispatch(actionChat.reqEmployeeFileUpload(file, (rs, error)=>{
                console.log(rs)
                if(error){
                    sendMsg.status = "send_failed" ;
                    this.messageList.updateMsg(sendMsg);
                }
                else {
                    this.sendApi(rs.url, 'voice', JSON.stringify(meta), (rs, error) => {
                        if(error){
                            sendMsg.status = "send_failed" ;
                            this.messageList.updateMsg(sendMsg);
                        }
                        else {
                            sendMsg.status = "send_success" ;
                            this.messageList.updateMsg(sendMsg);
                        }
                    })
                }
            }));
        }
        else 
        {
            dispatch(actionChat.reqClientFileUpload(file, (rs, error)=>{
                console.log(rs)
                if(error){
                    sendMsg.status = "send_failed" ;
                    this.messageList.updateMsg(sendMsg);
                }
                else {
                    this.sendApi(rs.url, 'voice', JSON.stringify(meta), (rs, error) => {
                        if(error){
                            sendMsg.status = "send_failed" ;
                            this.messageList.updateMsg(sendMsg);
                        }
                        else {
                            sendMsg.status = "send_success" ;
                            this.messageList.updateMsg(sendMsg);
                        }
                    })
                }
            }));
        }
    };
    sendApi = (content, content_type, meta, callback) => {
        const { id, type } = this.state;
        if(type===2) {
            this.props.dispatch(actionChat.sendEmployeeMessage(id, content, content_type, meta, callback));
        } else {
            this.props.dispatch(actionChat.sendClientMessage(id, content, content_type, meta, callback));
        }
    };
    onSend = (text)=>{ 
        const { id } = this.state;
        let sendMsg = this.formatSendText(true,text,"send_going") ;
        this.messageList.appendToTop([sendMsg]);
        this.sendApi(text, 'text', (rs, error) => {
            if(error) {
                sendMsg.status = "send_failed" ;
                this.messageList.updateMsg(sendMsg);
            }
            else {
                sendMsg.status = "send_success" ;
                this.messageList.updateMsg(sendMsg);
            }
        })
    };
    formatSendText = (isOutgoing=true,text,status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { text, isOutgoing, msgId, msgType: "text",status,fromUser:this.state.rightUser } ;
        }
    };
    formatSendImage = (isOutgoing=true,url, width, height,status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { extend:{ imageHeight:height,imageWidth:width,thumbPath:url }, isOutgoing, msgId, msgType: "image",status,fromUser:this.state.rightUser } ;
        }
    };
    formatSendFile = (isOutgoing=true,url,size, status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { extend:{ thumbPath:url, size }, isOutgoing, msgId, msgType: "file",status,fromUser:this.state.rightUser } ;
        }
    };
    formatSendVoice = (isOutgoing=true,url,isRead=false ,playing=false, duration,status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { extend:{ thumbPath:url }, isOutgoing, msgId, msgType: "voice",status,fromUser:this.state.rightUser,isRead,playing,duration} ;
        }
    };
    onMessagePress = async(message) =>{
        const that = this;
        if(message.msgType === "voice"){
            if(message.playing) {
                this.voicePlaying = false
                message.playing = false ;
                this.messageList.updateMsg(message);
                that.stopPlay()
            }
            else {
                this.voicePlaying = true
                message.playing = true ;
                message.isRead = true ;
                this.messageList.updateMsg(message);
                await audioRecorderPlayer.startPlayer(message.extend.thumbPath);
                audioRecorderPlayer.addPlayBackListener((e)=>{
                    if(e.currentPosition == e.duration) {
                        message.playing = false ;
                        that.messageList.updateMsg(message);
                        that.stopPlay()
                    }
                })
            }
        } else {
            that.stopPlay()
            if(message.msgType === "image"){
                that.setState({imagePath: message.extend.thumbPath})
                showModal(<ImageViewer
                    style={{position: 'absolute', top: 0, left: 0, width: Common.window.width, height: Common.window.height,}}
                    swipeDownThreshold={100}
                    onSwipeDown={this.closeImageModal}
                    onClick={this.closeImageModal}
                    renderFooter={this.renderFooter}
                    enableSwipeDown
                    enableImageZoom
                    imageUrls={[
                        {
                        url: message.extend.thumbPath,
                        },
                    ]}
                />)
                
            }
        }
        console.log("message press....",message)
    };
    stopPlay = async() => {
        if(!this.voicePlaying) {
            return
        }
        await audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
    }
    onMessageLongPress = (message)=>{
        // alert(message.msgType+"")
        console.log("message long press....",message)
    };
    async onCameraPicker(){
        const that = this;
        const {dispatch} = this.props;
        
        ImagePicker.openCamera({
            width: 300,
            height: 300,
            cropping: false,
            cropperCircleOverlay: false,
        }).then(image => {
            console.log('....handlePromiseSelectPhoto'+ JSON.stringify(image));
            const file = {
                uri: image.path,
                name: image.creationDate +'.jpg',
                type: image.mime
            }
            let meta = {width: image.width, height: image.height}
            let sendMsg = this.formatSendImage(true,image.path, image.width, image.height,"send_going") ;
            this.messageList.appendToTop([sendMsg]);
            console.log(file)
            if(that.state.type==2){
                dispatch(actionChat.reqEmployeeFileUpload(file, (rs, error)=>{
                    // console.log(rs)
                    if(error){
                        sendMsg.status = "send_failed" ;
                        this.messageList.updateMsg(sendMsg);
                    }
                    else {
                        this.sendApi(rs.url, 'image', JSON.stringify(meta), (rs, error) => {
                            if(error){
                                sendMsg.status = "send_failed" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                            else {
                                sendMsg.status = "send_success" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                        })
                    }
                }));
            }
            else 
            {
                dispatch(actionChat.reqClientFileUpload(file, (rs, error)=>{
                    // console.log(rs)
                    if(error){
                        sendMsg.status = "send_failed" ;
                        this.messageList.updateMsg(sendMsg);
                    }
                    else {
                        this.sendApi(rs.url, 'image', JSON.stringify(meta), (rs, error) => {
                            if(error){
                                sendMsg.status = "send_failed" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                            else {
                                sendMsg.status = "send_success" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                        })
                    }
                }));
            }
        }).catch(e => {
            if(e && e.toString().indexOf('User did not grant library permission') > -1){
            Alert.alert('未授权', `图片访问权限没有开启，请前往设置去开启。`, [{
                text: '取消',
                onPress: null,
                },
                {
                text: '去设置',
                onPress: () => {this.handleSetting();},
                },
                ]);
            }
        });
    };
    onFailPress = (message)=>{
        console.log("fail...")
        alert("fail messgae id"+message.msgType);
    };
    onLocationClick = ()=>{
        let sendMsg = mockLocation(true) ;
        let receiveMsg = mockLocation(false) ;
        this.messageList.appendToTop([sendMsg]);
        setTimeout(()=>{
            this.messageList.appendToTop([receiveMsg]);
        },800);
        setTimeout(()=>{
            sendMsg.status = "send_success" ;
            this.messageList.updateMsg(sendMsg);
        },600);
    };
    async onFilePicker(){
        const that = this;
        const {dispatch} = this.props;
        DocumentPicker.pick({
            type: [FileTypes['All']],
            allowMultiSelection: false,
        }).then(res => {
            console.log('DocumentPicker',res);
            // res =  [ { fileCopyUri: null,
            //     size: 87829,
            //     name: '111.pdf',
            //     type: 'application/pdf',
            //     uri: 'content://com.android.providers.media.documents/document/document%3A50443' } ]
            const file = {
                uri: res[0].uri,
                name: res[0].name
            }
            let meta = {size: res[0].size}
            let sendMsg = this.formatSendFile(true,file.name, res[0].size, "send_going") ;
            this.messageList.appendToTop([sendMsg]);
            if(that.state.type==2){
                dispatch(actionChat.reqEmployeeFileUpload(file, (rs, error)=>{
                    console.log(rs)
                    if(error){
                        sendMsg.status = "send_failed" ;
                        this.messageList.updateMsg(sendMsg);
                    }
                    else {
                        this.sendApi(rs.url, 'file', JSON.stringify(meta), (rs, error) => {
                            if(error){
                                sendMsg.status = "send_failed" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                            else {
                                sendMsg.status = "send_success" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                        })
                    }
                }));
            }
            else 
            {
                dispatch(actionChat.reqClientFileUpload(file, (rs, error)=>{
                    console.log(rs)
                    if(error){
                        sendMsg.status = "send_failed" ;
                        this.messageList.updateMsg(sendMsg);
                    }
                    else {
                        this.sendApi(rs.url, 'file', JSON.stringify(meta), (rs, error) => {
                            if(error){
                                sendMsg.status = "send_failed" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                            else {
                                sendMsg.status = "send_success" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                        })
                    }
                }));
            }
        }).catch(error => {
            console.log('DocumentPicker', error);
        });
        // try {
        //     const savedResponse = await saveFileToLocal('https://lawyer-ky.oss-cn-hangzhou.aliyuncs.com/download/case_template.xlsx');
            
        //     console.log("File saved successfully", savedResponse);
        // } catch (error) {
        //     console.log("Failed to save the file", error);
        // }

    };
    onPhonePress = (phone)=>{
        console.log("电话号码点击事件...",phone);
    };
    onUrlPress = (url)=>{
        console.log("url点击事件...",url);
    };
    onEmailPress = (email)=>{
        console.log("邮件点击事件...",email);
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
    onAvatarPress = (message)=>{
        console.log("avatar press...",message)
    }

    handleBack = () => {
        if (this.state.backButtonEnabled) {
          this.wv && this.wv.current && this.wv.current.goBack();
        } else {//否则返回到上一个页面
          this.props.navigation.goBack();
        }
    }

    async handlePromiseSelectPhoto(){
        const that = this;
        const {dispatch} = this.props;
        if(platform.isAndroid()) {
            let isGrant = await NativeModules.NotifyOpen.getMediaPermission();
            if(isGrant== 0){
            return;
            }
            else if(isGrant== 1){
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
        }

        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: false,
            cropperCircleOverlay: false,
        }).then(image => {
            console.log('...........handlePromiseSelectPhoto', JSON.stringify(image));
            const file = {
                uri: image.path,
                name: image.filename,
                // type: image.mime
            }
            let meta = {width: image.width, height: image.height}
            let sendMsg = this.formatSendImage(true,image.path, image.width, image.height,"send_going") ;
            this.messageList.appendToTop([sendMsg]);
            if(that.state.type==2){
                dispatch(actionChat.reqEmployeeFileUpload(file, (rs, error)=>{
                    // console.log(rs)
                    if(error){
                        sendMsg.status = "send_failed" ;
                        this.messageList.updateMsg(sendMsg);
                    }
                    else {
                        this.sendApi(rs.url, 'image', JSON.stringify(meta), (rs, error) => {
                            if(error){
                                sendMsg.status = "send_failed" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                            else {
                                sendMsg.status = "send_success" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                        })
                    }
                }));
            }
            else 
            {
                dispatch(actionChat.reqClientFileUpload(file, (rs, error)=>{
                    console.log(rs)
                    if(error){
                        sendMsg.status = "send_failed" ;
                        this.messageList.updateMsg(sendMsg);
                    }
                    else {
                        this.sendApi(rs.url, 'image', JSON.stringify(meta), (rs, error) => {
                            if(error){
                                sendMsg.status = "send_failed" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                            else {
                                sendMsg.status = "send_success" ;
                                this.messageList.updateMsg(sendMsg);
                            }
                        })
                    }
                }));
            }
        }).catch(e => {
            if(e && e.toString().indexOf('User did not grant library permission') > -1){
            Alert.alert('未授权', `图片访问权限没有开启，请前往设置去开启。`, [{
                text: '取消',
                onPress: null,
                },
                {
                text: '去设置',
                onPress: () => {this.handleSetting();},
                },
                ]);
            }
        });
    }
    handleSetting = () => {
        if(platform.isAndroid()){
            NativeModules.NotifyOpen && NativeModules.NotifyOpen.openPermission();
        }
        else {
            NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting();
        }
    }
    closeImageModal = () => {
        closeModal()
    }
    saveToLocal = async () => {
        // const result = check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log(this.state.imagePath)
        if (this.state.imagePath) {
          const response = await CameraRoll.save(this.state.imagePath);
          console.log('response', response);
        }
      };
   renderFooter = () => {
        return (
          <View style={{...styles.footer, width: Common.window.width}}>
            <TouchableOpacity  onPress={this.closeImageModal}>
            <Image
              source={require('../chat/components/Images/close.png')}
              style={styles.icon}
             
            />
            </TouchableOpacity>
            <TouchableOpacity  onPress={this.saveToLocal}>
            <Image
              source={require('../chat/components/Images/download.png')}
              style={styles.icon}
            />
            </TouchableOpacity>
          </View>
        );
      };
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
                            onAvatarPress={this.onAvatarPress}
                            onMessagePress={this.onMessagePress}
                            onMessageLongPress={this.onMessageLongPress}
                            onCameraPicker={this.onCameraPicker.bind(this)}
                            onFailPress={this.onFailPress}
                            onImagePicker={this.handlePromiseSelectPhoto.bind(this)}
                            onLocationClick={this.onLocationClick}
                            onFilePicker={this.onFilePicker.bind(this)}
                            onPhonePress={this.onPhonePress}
                            onUrlPress={this.onUrlPress}
                            onEmailPress={this.onEmailPress}
                            onMessageListTouch={this.onMessageListTouch}
                            onScroll={this.onScroll}
                            canLoadMore={this.state.hasMore}
                            onLoadMoreAsync={this.onLoadMoreAsync}
                            onRefreshAsync={this.onRefreshAsync}
                            messages={this.props.chatMessageList}
                />
        </SafeAreaView>  )
    }
}
export default connect(ChatPage.mapStateToProps)(ChatPage);


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