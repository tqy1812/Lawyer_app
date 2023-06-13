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
    NativeModules,
    Keyboard
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
// import { CheckBox } from 'react-native-elements';
import AntDesign from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
import authHelper from '../helpers/authHelper';
import actionCase from '../actions/actionCase';
import IcomoonIcon from "../components/IcomoonIcon";
import ImagePicker from 'react-native-image-crop-picker';
import GlobalData from '../utils/GlobalData';
import { showToast } from '../components/ShowModal';
import BaseComponent from '../components/BaseComponent';
import { SendIdentify } from '../components/SendIdentify';
const Toast = Overlay.Toast;

class SecurityPage extends BaseComponent {

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
            indetify: '',
            type: props.user.type ? props.user.type : 1,
        };
        this.globalDate = GlobalData.getInstance();
        this.nameListener = Keyboard.addListener('keyboardDidHide', this.nameForceLoseFocus);
    }

    componentDidMount() {
      if(!this.props.isLogin) {
        this.props.navigation.navigate('Login');
      }
    }
    componentWillUnmount() {
      this.nameListener && this.nameListener.remove();
    }
    nameForceLoseFocus = () => {
      this.login_identify && this.login_identify.blur();
    }
    // 验证码
    handleIndetifyChanged(text) {
        this.setState({ indetify: text });
    }
    send = (callback) => {
          const { dispatch } = this.props;
          if(this.state.type==1){
            dispatch(actionAuth.reqSendVerifyCode((res, error) => {
                logger(res)
                if (error) {
                    Toast.show(error.info);
                    if(callback) callback(false);
                } 
                else {
                    // this.setState({editStep: 2})
                    if(callback) callback(true);
                }
            }));
          }
          else {
            dispatch(actionAuth.reqSendClientVerifyCode((res, error) => {
              logger(res)
              if (error) {
                  Toast.show(error.info);
                  if(callback) callback(false);
              } 
              else {
                  // this.setState({editStep: 2})
                  if(callback) callback(true);
              }
            }));
          }
    }

    handleSubmit() {
      
          const { dispatch } = this.props;
          const { indetify } = this.state;
          const that = this;
          if (indetify == null || indetify.length <= 0) {
              Toast.show('手机验证码不能为空!');
              return;
          }
          
          this.props.navigation.replace('AccountRemove', {indetify: indetify});
      
    }
    render() {
      const { userInfo} = this.props;
      const { imgAvatar} = this.state;
      const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight 
      logger('..onBackButtonPressAndroid', this.props.user)
      return (
          <SafeAreaView style={styles.container}>  
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            <Header title='帐号安全校验' back={true} {...this.props}/>  
            <View style={[styles.content]}> 
              <View style={styles.infoContent}> 
                <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>头像</Text>
                  {
                    imgAvatar ?
                    <Image style={styles.avatar} source={{uri: imgAvatar}}
                  /> : <IcomoonIcon name='center' size={80} style={{color: 'rgb(0, 122, 254)'}}/>
                  }
              </View>
              <View style={styles.infoContent}> 
                <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>账号名</Text>
                  <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.name}</Text>
              </View>
              <View style={styles.infoContent}> 
                <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>工作单位</Text>
                  <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.org_name}</Text>
              </View>
            </View>      
            <Text style={[styles.title]}>{'帐号安全校验'}</Text>    
            <View style={styles.formContent}>
              <View style={styles.formInput}>
                <TextInput
                    ref={(ref) => this.login_identify = ref}
                    style={styles.loginInput}
                    placeholder='点击获取动态验证码'
                    placeholderTextColor='#999'
                    onChangeText={this.handleIndetifyChanged.bind(this)}
                    value={this.state.indetify} />
                    <SendIdentify time={90} action={(callback)=> this.send(callback)}/>
              </View> 
            </View>
            <View style={styles.operate}>
              <MyButton style={styles.loginBtn} onPress={this.handleSubmit.bind(this)}>
                  <Text style={styles.loginText}>提交帐号验证信息</Text>
              </MyButton>
            </View>
          </SafeAreaView>
      )
    }
}
export default connect(SecurityPage.mapStateToProps)(SecurityPage);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
 },
content: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
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
},
infoName:{
  color: '#606266',
  fontSize: FontSize(17),
},
infoValue:{
  color: '#909399',
  fontSize: FontSize(17),
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
    paddingLeft: 30,
    paddingRight: 30,
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
    paddingLeft: 30,
    paddingRight: 30,
    flexDirection: 'column',
},
loginBtn: {
    backgroundColor: '#007afe',
    padding: 15,
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 50,
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

});
