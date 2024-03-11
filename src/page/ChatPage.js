import React,{Component} from 'react';
import BaseComponent from '../components/BaseComponent';
import {
    StyleSheet,
    StatusBar,
    NativeModules,
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
    startRecording = ()=>{
        console.log("开始录音...")
    };
    stopRecording = (canceled)=>{
        if(canceled){// 取消录音发送
            return  ;
        }
        let sendMsg = mockVoice(true) ;
        let receiveMsg = mockVoice(false) ;
        this.messageList.appendToBottom([sendMsg]);
        setTimeout(()=>{
            this.messageList.appendToBottom([receiveMsg]);
        },800);
        setTimeout(()=>{
            sendMsg.status = "send_success" ;
            this.messageList.updateMsg(sendMsg);
        },600);

    };

    onSend = (text)=>{ 
        const { id } = this.state;
        let sendMsg = this.formatSendText(true,text,"send_going") ;
        this.messageList.appendToBottom([sendMsg]);
        if(this.state.type===2) {
            this.props.dispatch(actionChat.sendEmployeeMessage(id, text, 'text', (rs)=>{
                sendMsg.status = "send_success" ;
                this.messageList.updateMsg(sendMsg);
            }));
        } else {
            this.props.dispatch(actionChat.sendClientMessage(id, text, 'text', (rs)=>{
                sendMsg.status = "send_success" ;
                this.messageList.updateMsg(sendMsg);
            }));
        }
        // let sendMsg = mockText(true,text,"send_going") ;
        // let receiveMsg = mockText(false,text) ;
        // this.messageList.appendToBottom([sendMsg]);
        // setTimeout(()=>{
        //     this.messageList.appendToBottom([receiveMsg]);
        // },800);
        // setTimeout(()=>{
        //     sendMsg.status = "send_success" ;
        //     this.messageList.updateMsg(sendMsg);
        // },600);
    };
    formatSendText = (isOutgoing=true,text,status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { text, isOutgoing, msgId, msgType: "text",status,fromUser:this.state.rightUser } ;
        }
    };
    formatSendImage = (isOutgoing=true,url,status)=>{
        const msgId = `msgid_${Date.now()}` ;
        if(isOutgoing){
            return { extend:{ imageHeight:80,imageWidth:50,thumbPath:url }, isOutgoing, msgId, msgType: "image",status,fromUser:this.state.rightUser } ;
        }
    };
    onMessagePress = (message)=>{
        if(message.msgType=== "voice"){
            message.playing = true ;
            message.isRead = true ;
            this.messageList.updateMsg(message);
            setTimeout(()=>{
                message.playing = false ;
                this.messageList.updateMsg(message);
            },1000);
            return ;
        }
        alert(message.msgType+"");
        console.log("message press....",message)
    };
    onMessageLongPress = (message)=>{
        alert(message.msgType+"")
        console.log("message long press....",message)
    };
    onCameraPicker =()=>{
        this.handleImagePicker();
    };
    onFailPress = (message)=>{
        console.log("fail...")
        alert("fail messgae id"+message.msgType);
    };
    onImagePicker =()=>{
        // let sendMsg = mockImage(true,"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1536298415755&di=3979575fd677e35442398fa90233c586&imgtype=0&src=http%3A%2F%2Fs4.sinaimg.cn%2Fmw690%2F001sB7zxzy74flKL4FJb3%26690") ;
        // let receiveMsg = mockImage(false,"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1536298415755&di=3979575fd677e35442398fa90233c586&imgtype=0&src=http%3A%2F%2Fs4.sinaimg.cn%2Fmw690%2F001sB7zxzy74flKL4FJb3%26690") ;
        // this.messageList.appendToBottom([sendMsg]);
        // setTimeout(()=>{
        //     this.messageList.appendToBottom([receiveMsg]);
        // },800);
        // setTimeout(()=>{
        //     sendMsg.status = "send_success" ;
        //     this.messageList.updateMsg(sendMsg);
        // },600);
    };
    onLocationClick = ()=>{
        let sendMsg = mockLocation(true) ;
        let receiveMsg = mockLocation(false) ;
        this.messageList.appendToBottom([sendMsg]);
        setTimeout(()=>{
            this.messageList.appendToBottom([receiveMsg]);
        },800);
        setTimeout(()=>{
            sendMsg.status = "send_success" ;
            this.messageList.updateMsg(sendMsg);
        },600);
    };
    onFilePicker = ()=>{

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
        cropping: true,
        cropperCircleOverlay: true,
    }).then(image => {
        logger('....handlePromiseSelectPhoto'+ JSON.stringify(image));
        const file = {
        uri: image.path,
        name: image.modificationDate +'.jpg',
        type: image.mime
        }
        let sendMsg = this.formatSendImage(true,image.path,"send_going") ;
        this.messageList.appendToBottom([sendMsg]);
    //   if(that.state.type==1){
    //     dispatch(actionAuth.reqUpload(file, (rs, error)=>{
    //       if(error){
    //         Toast.show(error.info)
    //       }
    //       else {
            
    //       }
    //     }));
    //   }
    //   else 
    //   {
    //     dispatch(actionAuth.reqClientUpload(file, (rs, error)=>{
    //       if(error){
    //         Toast.show(error.info)
    //       }
    //       else {
            
    //       }
    //     }));
    //   }
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
    render() {
        return (
            <SafeAreaView style={[styles.container]}>
                <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
                <Header title={this.state.leftUser.name} back={true} cancelFunc={this.handleBack.bind(this)} {...this.props}/>
                <Chat onLoad={(messageList,input)=>{
                                this.messageList = messageList ;
                                this.input = input ;}}
                            onSend = { this.onSend }
                            stopRecording={this.stopRecording}
                            onAvatarPress={this.onAvatarPress}
                            onMessagePress={this.onMessagePress}
                            onMessageLongPress={this.onMessageLongPress}
                            onCameraPicker={this.onCameraPicker}
                            onFailPress={this.onFailPress}
                            onImagePicker={this.onImagePicker}
                            onLocationClick={this.onLocationClick}
                            onFilePicker={this.onFilePicker}
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
  });