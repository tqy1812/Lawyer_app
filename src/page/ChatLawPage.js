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
import {getFileName, saveFileToLocal} from '../utils/utils';
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
        return props;
    }

    constructor(props) {
        super(props);
        this.state = {
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
            imagePath: '', 
        };
        this.page = 1;
        this.fileList = {}
        this.loading = false
    }
    componentDidMount() {
        if (!this.props.isLogin) {
          this.props.navigation.navigate('Login');
        }
        this.page = 1;
    }
    componentWillUnmount() {
        dbHepler.closeDB()
    }
    startRecording = async() =>{
        console.log("开始录音...")
        
        
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
            name: this.recorderName,
            type: 'audio/mp3'
        }
        let sendMsg = this.formatSendVoice(true, file.uri, false, false, this.recorderNameDuration, "send_going") ;
        this.messageList.appendToTop([sendMsg]);
        let meta = {duration: this.recorderNameDuration}
        this.uploadAip(sendMsg, file, 'voice', meta);
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
        this.sendApi(text, 'text', undefined, (rs, error) => {
            console.log('send succsee', rs, error)
            if(error) {
                sendMsg.status = "send_failed" ;
                this.messageList.updateMsg(sendMsg);
            }
            else {
                console.log('send succsee')
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

    formatSendVideo = (isOutgoing=true,url, meta,status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { extend:{ ...meta, thumbPath:url }, isOutgoing, msgId, msgType: "video",status,fromUser:this.state.rightUser } ;
        }
    };
    formatSendFile = (isOutgoing=true,url,size, name, status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { extend:{ thumbPath:url, size , name}, isOutgoing, msgId, msgType: "file",status,fromUser:this.state.rightUser } ;
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
            let filePath = message.extend.thumbPath
            // let filePath = 'file:///var/mobile/Containers/Data/Application/B21DA04D-9099-4FE4-A24E-584FB6F8EAC6/tmp/73216103108__780D5230-972F-4322-A68B-05B96FAC4430.MOV'
            // let filePath = decodeURI('file:///var/mobile/Containers/Data/Application/B21DA04D-9099-4FE4-A24E-584FB6F8EAC6/Library/Caches/7DDA4417-C0D3-4F0A-A877-2C9D538CF381/1130%E9%A1%B9%E7%9B%AE%E5%BC%80%E5%8F%91%E5%90%88%E4%BD%9C%E5%8D%8F%E8%AE%AE%EF%BC%88%E5%BE%8B%E6%97%B6%E9%A1%B9%E7%9B%AE%E4%BA%8C%E6%9C%9F%20%20%E5%BF%AB%E8%AF%AD%E4%B8%8E%E5%B0%86%E6%89%8D%EF%BC%890%202.docx')
            if(message.msgType === "image"){
                if(filePath) {
                    let localFilePath;
                    if(filePath.indexOf('http')==0) {
                        if(message.extend.localPath && message.extend.localPath.length > 0) {
                            localFilePath = decodeURI(message.extend.localPath)
                        }
                        else {
                            localFilePath = filePath;
                        }
                    } else {
                        localFilePath = decodeURI(filePath);
                    }
                    that.setState({imagePath: filePath})
                    RNFS.exists(localFilePath).then(isExit => {
                        console.log(isExit)
                        if (!isExit) {
                            localFilePath = filePath
                        } 
                        console.log('image', localFilePath)
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
                                url: localFilePath,
                                },
                            ]}
                        />) 
                    });
                }
            } else if(message.msgType === "video") {
                if(filePath) {
                    let localFilePath;
                    if(filePath.indexOf('http')==0) {
                        if(message.extend.localPath && message.extend.localPath.length > 0) {
                            localFilePath = decodeURI(message.extend.localPath)
                        }
                        else {
                            localFilePath = filePath;
                        }
                    } else {
                        localFilePath = decodeURI(filePath);
                    }
                    console.log('video', localFilePath)
                    RNFS.exists(localFilePath).then(isExit => {
                        console.log(isExit)
                        if (!isExit) {
                            localFilePath = filePath
                        } 
                        console.log('image', localFilePath)
                        showModal(<VideoScreen
                            onScreenDismissed={this.closeImageModal}
                            url={localFilePath}
                        />) 
                        
                    });
                }
            } else if(message.msgType === "file"){
                if(filePath) {
                    let localFilePath;
                    if(filePath.indexOf('http')==0) {
                        if(message.extend.localPath && message.extend.localPath.length > 0) {
                            localFilePath = decodeURI(message.extend.localPath)
                        }
                        else {
                            let match = filePath.match(/\/([^\/?#]+)[^\/]*$/);
                            let fileName = match && match[1];
                            localFilePath = `${RNFetchBlob.fs.dirs.DocumentDir}/lawyerapp/file/`+ fileName;
                        }
                    } else {
                        localFilePath = decodeURI(filePath);
                    }
                    RNFS.exists(localFilePath).then(isExit => {
                        console.log(isExit)
                        if (isExit) {
                          FileViewer.open(localFilePath, {showOpenWithDialog: true}) // absolute-path-to-my-local-file.
                            .then(() => {
                              console.log('open success');
                            })
                            .catch(error => {
                              console.log('open file error', error);
                            });
                        } else {
                            that.downloadFile(message);
                        }
                    });
                }
            }
        }
        console.log("message press....",message)
    };
    downloadFile = async(message) => {
        let filePath = message.extend.thumbPath
        console.log('加入下载队列', filePath);
        try {
            const savedResponse = await saveFileToLocal(filePath);
            showToast('下载成功，路径:'+savedResponse.data)
            if(savedResponse.data){
                this.fileList[filePath] = savedResponse.data
                message.extend.localPath = savedResponse.data
                dbHepler.insertDataToTable('LOCAL_FILE', {'OSS_URL': filePath, 'LOCAL_PATH': savedResponse.data})
            }
            console.log("File saved successfully", savedResponse);
        } catch (error) {
            console.log("Failed to save the file", error);
        }
    }
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
        if(platform.isAndroid()) {
            let isHasMic = await NativeModules.NotifyOpen.getRecordCamera();
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
        }
        
        launchCamera({
            durationLimit: 60,
            mediaType: 'mixed', 
            maxHeight: 256, 
            presentationStyle: 'fullScreen'
        }).then((rs)=>{
            const {assets} = rs;
            console.log(rs)
            this.sendImageVideo(assets);
        })
    };
    sendImageVideo = (assets) => {
        const that = this;
        const {dispatch} = this.props;
        
        if(assets && assets.length > 0) {
            const {duration, fileName, fileSize, height, uri, width, type} = assets[0]
            let file = {
                uri: uri,
                name: fileName,
                type: type
            }
            let meta;
            let sendMsg;
            if(type ===  "video/quicktime"){
                createThumbnail({
                    url: uri,
                }).then(thumb=>{
                    console.log("createThumbnail", thumb)
                    const {
                        path,
                        width: coverWidth,
                        height: coverHeight,
                    } =thumb;
                    let coverPath = "file://" + path;
                    meta = {width, height, duration, fileSize, localPath: decodeURI(uri), coverPath, coverWidth, coverHeight }
                    sendMsg = this.formatSendVideo(true, uri, meta,"send_going") ;
                    this.messageList.appendToTop([sendMsg]);

                    const coverPathFile = {
                        uri: coverPath,
                        name: new Date().getTime() +'.jpg',
                    }
                    if(that.state.type==2){
                        dispatch(actionChat.reqEmployeeFileUpload(coverPathFile, (rs, error)=>{
                            // console.log(rs)
                            meta.coverPath = rs.url
                            this.uploadAip(sendMsg, file, 'video', meta);
                        }));
                    }
                    else 
                    {
                        dispatch(actionChat.reqClientFileUpload(coverPathFile, (rs, error)=>{
                            console.log('coverPath',rs)
                            meta.coverPath = rs.url
                            that.uploadAip(sendMsg, file, 'video', meta);
                        }));
                    }
                })
            } else {
                meta = {width, height, localPath: decodeURI(uri)}
                sendMsg = this.formatSendImage(true, uri, width, height, "send_going") ;
                this.messageList.appendToTop([sendMsg]);                   
                this.uploadAip(sendMsg, file, 'image', meta);
            }
        }
    }
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
        DocumentPicker.pickSingle({
            mode: 'open',
            presentationStyle: 'fullScreen',
            copyTo: 'cachesDirectory',
            type: [FileTypes['Text'], FileTypes['PDF'], FileTypes['Zip'], FileTypes['Csv'], FileTypes['Doc'], FileTypes['Docx'], FileTypes['Ppt'], FileTypes['Pptx'], FileTypes['Xls'], FileTypes['Xlsx']],
        }).then(res => {
            console.log('DocumentPicker',res);
            const file = {
                uri: res.uri,
                name: res.name,
                type: res.type
            }
            let meta = {size: res.size, name: res.name, localPath: decodeURI(res.uri)}
            let sendMsg = this.formatSendFile(true, file.uri, res.size, res.name, "send_going") ;
            this.messageList.appendToTop([sendMsg]);
            that.uploadAip(sendMsg, file, 'file', meta);
        }).catch(error => {
            console.log('DocumentPicker', error);
        });
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
        launchImageLibrary({
            mediaType: 'mixed',
            presentationStyle: 'fullScreen',
            selectionLimit: 1,
        }).then((rs)=>{
            console.log('launchImageLibrary', rs)
            const {assets} = rs;
            this.sendImageVideo(assets);
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
    uploadAip = (sendMsg, file, type, meta) => {
        const that = this;
        const {dispatch} = this.props;
        if(that.state.type==2){
            dispatch(actionChat.reqEmployeeFileUpload(file, (rs, error)=>{
                // console.log(rs)
                if(error){
                    showToast(error.info)
                    sendMsg.status = "send_failed" ;
                    this.messageList.updateMsg(sendMsg);
                }
                else {
                    this.fileList[rs.url] = meta.localPath
                    dbHepler.insertDataToTable('LOCAL_FILE', {'OSS_URL': rs.url, 'LOCAL_PATH': meta.localPath})
                    this.sendApi(rs.url, type, JSON.stringify(meta), (rs, error) => {
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
                    showToast(error.info)
                    sendMsg.status = "send_failed" ;
                    this.messageList.updateMsg(sendMsg);
                }
                else {
                    this.fileList[rs.url] = meta.localPath
                    dbHepler.insertDataToTable('LOCAL_FILE', {'OSS_URL': rs.url, 'LOCAL_PATH': meta.localPath})
                    this.sendApi(rs.url, type, JSON.stringify(meta), (rs, error) => {
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
