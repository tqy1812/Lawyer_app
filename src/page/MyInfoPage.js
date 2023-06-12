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
const Toast = Overlay.Toast;

class MyInfoPage extends BaseComponent {

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
    openRemove = () =>{
      this.props.navigation.navigate('WebPage', { url: 'log_off/', title: '律时', type: 'logOff' })
    }

    render() {
      const { userInfo} = this.props;
      const { imgAvatar, caseList, caseListInfo} = this.state;
      const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight 
      // logger('..onBackButtonPressAndroid', this.props.navigation)
      // logger(caseList)
      return (
          <SafeAreaView style={styles.container}>  
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            <Header title='个人信息' back={true} remove={true} {...this.props} sendFunc={this.openRemove.bind(this)}/>  
            <View style={[styles.content, { minHeight: platform.isIOS() ?  Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 20 : Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 10,}]}> 
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
                <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>手机号</Text>
                  <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>{getPhone(userInfo.phone, '*')}</Text>
              </View>
              <View style={styles.infoContent}> 
                <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>工作单位</Text>
                  <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.org_name}</Text>
              </View>
            </View>          
            <View style={styles.bottom}>                    
                <MyButton style={styles.loadBtn} onPress={()=>{this.props.navigation.navigate('Export')}}>
                    <Text style={styles.loadText}>导出个人信息</Text>
                </MyButton>
            </View>
          </SafeAreaView>
      )
    }
}
export default connect(MyInfoPage.mapStateToProps)(MyInfoPage);
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

});
