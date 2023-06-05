import React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    Overlay,
    ScrollView,
    StatusBar,
    ImageBackground, InteractionManager, TouchableOpacity,
    NativeModules
} from 'react-native';
import Header from '../components/Header';
import { CommonActions, StackActions } from '@react-navigation/native';
import {connect} from 'react-redux';
import actionAuth from '../actions/actionAuth';
import * as Storage from '../common/Storage';
import platform from '../utils/platform';
import {logger, getPhone, FontSize} from '../utils/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';
import MyButton from '../components/MyButton';
import {TYPE_AUTH_USER} from '../actions/actionRequest';
import AntDesign from 'react-native-vector-icons/AntDesign';
import authHelper from '../helpers/authHelper';
import actionCase from '../actions/actionCase';
import IcomoonIcon from "../components/IcomoonIcon";
import GlobalData from '../utils/GlobalData';
import AccountRemoveConfirmModal from '../components/AccountRemoveConfirmModal';
import { showToast } from '../components/ShowModal';
import BaseComponent from '../components/BaseComponent';
import { tr } from 'date-fns/locale';
const Toast = Overlay.Toast;

class AccountRemovePage extends BaseComponent {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        props.userInfo = state.Auth.userInfo;
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
            imgAvatar: props.userInfo.avatar,
            confirmVisible: false
        };
        this.globalDate = GlobalData.getInstance();
    }

    componentDidMount() {
      if(!this.props.isLogin) {
        this.props.navigation.navigate('Login');
      }
    }
    feedback () {
      this.props.navigation.replace('FeedBack');
    }
    handleSubmit() {
      InteractionManager.runAfterInteractions(() => {
          const { dispatch } = this.props;
          const that = this;
          that.setState({confirmVisible: true});
      });
    }
    close() {

      this.setState({confirmVisible: false});
    }
    render() {
      const { userInfo} = this.props;
      const { imgAvatar, confirmVisible} = this.state;
      const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight;
      return (
          <SafeAreaView style={styles.container}>  
            {/* <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" /> */}
            <Header title='帐号注销' back={true}  {...this.props} />  
            <View style={[styles.content]}> 

              <View style={[styles.content]}> 
                  {
                    imgAvatar ?
                    <Image style={styles.avatar} source={{uri: imgAvatar}}
                  /> : <IcomoonIcon name='center' size={80} style={{color: 'rgb(0, 122, 254)'}}/>
                  }
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.name}</Text>
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>{getPhone(userInfo.phone, '*')}</Text>
               </View>
              <Text style={[styles.messageValue]}>很遗憾收到您的注销申请</Text> 
              <Text style={[styles.messageValue]}>感谢您与律时共度的时光</Text>   
              <Text style={[styles.messageValue]}>真心希望您能留下</Text>   
              <Text style={[styles.messageValue]}>如果有任何意见反馈，请随时告知</Text>  
              <Text style={[styles.messageValue]}>我们竭力为您提供服务与帮助</Text>     
            
              <View style={styles.operate}>
                <MyButton style={styles.loginBtn} onPress={this.feedback.bind(this)}>
                    <Text style={styles.loginText}>律时反馈和帮助</Text>
                </MyButton>
                <MyButton activeOpacity={1} style={styles.removeBtn} onPress={this.handleSubmit.bind(this)}>
                    <Text style={styles.removeText}>提交注销申请</Text>
                </MyButton>
              </View>
              { confirmVisible && <AccountRemoveConfirmModal close={this.close.bind(this)}/>}
            </View>  
          </SafeAreaView>
      )
    }
}
export default connect(AccountRemovePage.mapStateToProps)(AccountRemovePage);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
 },
content: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%'
},
infoContent: {
  width: Common.window.width - 40,
  paddingTop: 20,
  paddingBottom: 20,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottomColor: '#E9E9EB',
  borderBottomWidth: 1,
},
avatar: {
  width: 80,
  height: 80,
  borderRadius: 10,
  marginBottom: 10,
},
infoValue:{
  color: '#303133',
  fontSize: FontSize(17),
  marginBottom: 10,
},

messageValue:{
  color: '#606266',
  fontSize: FontSize(18),
  marginBottom: 10,
},


bottom: {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-end',
},
loadBtn: {
  width: Common.window.width - 40,
  padding: 15,
  alignItems: 'center',
  margin: 20,
},
loadText: {
  color: '#007AFE',
  fontSize: 12,
},
formContent: {
    width: '100%',
    paddingLeft: 25,
    paddingRight: 25,

    //   borderTopWidth: 1,
    //   borderTopColor: '#dfdfdf',
    //   borderBottomWidth: 1,
    //   borderBottomColor: '#dfdfdf',
},
formInput: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    lineHeight: 50,
    paddingLeft: 10,
    color: '#333',
    fontSize: FontSize(16),
    // borderWidth: 1,
    borderRadius: 55,
    // borderColor: '#dfdfdf',
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: '#F2F6FC'
},
loginInput: {
    height: 40,
    paddingLeft: 15,
    flex: 1,
    fontSize: FontSize(16),
    color: '#333',
},
operate: {
    width: '100%',
    paddingTop: 20,
    paddingLeft: 40,
    paddingRight: 40,
    flexDirection: 'column',
    marginBottom: 50,
},
loginBtn: {
    backgroundColor: '#007afe',
    padding: 15,
    alignItems: 'center',
    borderRadius: 30,
},
loginText: {
    color: '#ffffff',
    fontSize: FontSize(16),
},
title: {
  fontSize: FontSize(18),
  color: '#000',
  marginTop: 50,
  marginBottom: 50,
},
removeBtn: {
  padding: 18,
  alignItems: 'center',
},
removeText: {
    color: '#C0C4CC',
    fontSize: FontSize(16),
},
});
