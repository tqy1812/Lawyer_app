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
import {logger, getPhone} from '../utils/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';
import MyButton from '../components/MyButton';
import {TYPE_AUTH_USER} from '../actions/actionRequest';
// import { CheckBox } from 'react-native-elements';
import AntDesign from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
import authHelper from '../helpers/authHelper';
import actionCase from '../actions/actionCase';
import IcomoonIcon from "../components/IcomoonIcon";
import ImagePicker from 'react-native-image-crop-picker';
import GlobalData from '../utils/GlobalData';
import { showToast } from '../components/ShowModal';
import ImageArr from '../common/ImageArr';
const Toast = Overlay.Toast;

class PermissionPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        props.caseList = state.Case.caseList;
        props.caseListInfo = state.Case.caseListInfo;
        props.userInfo = state.Auth.userInfo;
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
            imgAvatar: props.userInfo.avatar,
            caseList: props.caseList,
            caseListInfo: props.caseListInfo,
        };
        this.globalDate = GlobalData.getInstance();
    }

    componentDidMount() {
      if(!this.props.isLogin) {
        this.props.navigation.navigate('Login');
      }
    }

    handleSetting() {
      if(platform.isAndroid()){
        NativeModules.NotifyOpen && NativeModules.NotifyOpen.openPermission();
      }
      else {
        NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting();
      }
    }

    render() {
      const { userInfo} = this.props;
      const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight 
      // logger('..onBackButtonPressAndroid', this.props.navigation)
      // logger(caseList)
      return (
          <SafeAreaView style={styles.container}>  
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            <Header title='个人信息' back={true} {...this.props}/>  
            <View style={[styles.content, { minHeight: platform.isIOS() ?  Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 20 : Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 10,}]}> 
              <View style={styles.infoContent}> 
                <Image style={styles.avatar} source={ImageArr['pic']}></Image>
                <View style={styles.infoContent1}> 
                  <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>照片</Text>
                  <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>用于图片的上传，以更改头像等功能。</Text>
                </View>
              </View>
              <View style={styles.infoContent}> 
                <Image style={styles.voiceAvatar} source={ImageArr['voice']}></Image>
                <View style={styles.infoContent1}> 
                  <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>麦克风</Text>
                  <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>发送语音信息。</Text>
                </View>
              </View>
              <View style={styles.infoContent}> 
                <Image style={styles.wifiAvatar} source={ImageArr['wifi']}></Image>
                <View style={styles.infoContent1}> 
                  <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>本地网络</Text>
                  <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>判断本地网络情况，以提高音频输入的质量。</Text>
                </View>
              </View>
            </View>          
            <View style={styles.bottom}>                    
                <MyButton style={styles.loadBtn} onPress={this.handleSetting.bind(this)}>
                    <Text style={styles.loadText}>前往系统设置</Text>
                </MyButton>
            </View>
          </SafeAreaView>
      )
    }
}
export default connect(PermissionPage.mapStateToProps)(PermissionPage);
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
avatar: {
  width: 20,
  height: 20,
  marginRight: 10,
},
voiceAvatar: {
  width: 20,
  height: 25,
  marginRight: 10,
},
wifiAvatar: {
  width: 20,
  height: 23,
  marginRight: 10,
},
infoContent: {
  width: Common.window.width - 60,
  paddingTop: 20,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignContent: 'flex-start',
},
infoContent1: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignContent: 'flex-start',
  borderBottomColor: '#E9E9EB',
  borderBottomWidth: 1,
  paddingBottom: 10,
},
infoName:{
  color: '#606266',
  fontSize: 17,
},
infoCompany:{
  color: '#606266',
  fontSize: 15,
},
infoValue:{
  color: '#909399',
  fontSize: 14,
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
  fontSize: 17,
},

});
