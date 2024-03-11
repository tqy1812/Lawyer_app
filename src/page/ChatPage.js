import React,{Component} from 'react';
import BaseComponent from '../components/BaseComponent';
import {
    StyleSheet,
    StatusBar,
} from 'react-native';
import Header from '../components/Header';
import {connect} from 'react-redux';
import Chat from '../chat/Chat';
import authHelper from '../helpers/authHelper';
import actionChat from '../actions/actionChat';
import { mockText,mockImage,mockLocation,mockVoice } from "../utils/mock";
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';

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
    }
    componentDidMount() {
        if (!this.props.isLogin) {
          this.props.navigation.navigate('Login');
        }
        if(this.state.type===2) {
            this.props.dispatch(actionChat.getEmployeeChatList(1, 10, this.state.id, (rs)=>{
                if(rs && rs.data && rs.data.length > 0) {
                    this.setState({hasMore: rs.data.page * rs.data.per_page < rs.data.total})
                }
            }));
        } else {
            this.props.dispatch(actionChat.getClientChatList(1, 10, this.state.id, (rs)=>{
                if(rs && rs.data && rs.data.length > 0) {
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
        const msgId = `msgid_${counter++}` ;
        if(isOutgoing){
            return { text, isOutgoing, msgType: "text",status,fromUser:this.state.rightUser } ;
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
        let sendMsg = mockImage(true,"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1536298415755&di=3979575fd677e35442398fa90233c586&imgtype=0&src=http%3A%2F%2Fs4.sinaimg.cn%2Fmw690%2F001sB7zxzy74flKL4FJb3%26690") ;
        let receiveMsg = mockImage(false,"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1536298415755&di=3979575fd677e35442398fa90233c586&imgtype=0&src=http%3A%2F%2Fs4.sinaimg.cn%2Fmw690%2F001sB7zxzy74flKL4FJb3%26690") ;
        this.messageList.appendToBottom([sendMsg]);
        setTimeout(()=>{
            this.messageList.appendToBottom([receiveMsg]);
        },800);
        setTimeout(()=>{
            sendMsg.status = "send_success" ;
            this.messageList.updateMsg(sendMsg);
        },600);
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
    onLoadMoreAsync = ()=>{
        console.log("加载更多")
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
                            onPhonePress={this.onPhonePress}
                            onUrlPress={this.onUrlPress}
                            onEmailPress={this.onEmailPress}
                            onMessageListTouch={this.onMessageListTouch}
                            onScroll={this.onScroll}
                            onLoadMoreAsync={this.onLoadMoreAsync}
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