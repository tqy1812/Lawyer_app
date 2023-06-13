import React, { Component } from 'react';
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
import { connect } from 'react-redux';
import actionAuth from '../actions/actionAuth';
import * as Storage from '../common/Storage';
import platform from '../utils/platform';
import { logger, getPhone,FontSize } from '../utils/utils';
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
const Toast = Overlay.Toast;

class ExportInfoPage extends Component {

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
      email: '',
      btnEnable: false,
      code: 0
    };
    this.globalDate = GlobalData.getInstance();
    this.nameListener = Keyboard.addListener('keyboardDidHide', this.nameForceLoseFocus);
  }

  componentDidMount() {
    if (!this.props.isLogin) {
      this.props.navigation.navigate('Login');
    }
  }
  componentWillUnmount() {
    this.nameListener && this.nameListener.remove();
  }
  nameForceLoseFocus = () => {
    this.ref_email && this.ref_email.blur();
  }
  handleChanged(text) {
    let name = text.trim();
    this.setState({ email: name, btnEnable: !!name });
  }
  handSubmit() {
    const { dispatch } = this.props;
    const { email, btnEnable } = this.state;
    if (!btnEnable) {
      return;
    }
    // this.props.navigation.dispatch(state => {
    //   logger('.......logOut', state)
    //   return CommonActions.reset({
    //     ...state,
    //     routes: [{name: 'Login'}],
    //     index:0,
    //   });
    // });
  }
  handBack () {
    this.props.navigation.goBack();
  }
  render() {
    const { email, btnEnable, code } = this.state;
    const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight
    // logger('..onBackButtonPressAndroid', this.props.navigation)
    // logger(caseList)
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle="dark-content" />
        <Header title='' close={true} {...this.props} />
        {
          code === 2 ?
            <View style={[styles.content, { minHeight: platform.isIOS() ? Common.window.height - 105 - STATUS_BAR_HEIGHT - 76 - 20 : Common.window.height - 105 - STATUS_BAR_HEIGHT - 76 - 10, }]}>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle1} numberOfLines={1} ellipsizeMode={'tail'}>已提交</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoName}>个人信息文件将会在72小时内发送至你的邮箱</Text>
              </View>
            </View>
            : <View style={[styles.content, { minHeight: platform.isIOS() ? Common.window.height - 105 - STATUS_BAR_HEIGHT - 76 - 20 : Common.window.height - 105 - STATUS_BAR_HEIGHT - 76 - 10, }]}>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle} numberOfLines={1} ellipsizeMode={'tail'}>个人信息导出</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoName}>头像、账号名等信息将信息将整理为文件 并发送到你的邮箱</Text>
              </View>
              <View style={styles.infoContent1}>
                <Text style={styles.emailName} numberOfLines={1} ellipsizeMode={'tail'}>邮箱地址</Text>
                <TextInput
                  ref={(ref) => this.ref_email = ref}
                  placeholder='此处填写邮箱地址'
                  placeholderTextColor='#C0C4CC'
                  style={styles.emailInput}
                  onChangeText={this.handleChanged.bind(this)}
                  value={email}
                />
              </View>
              <View style={styles.infoContent}>
                {
                  code === 1 &&
                  (<View style={styles.topPartNotice}>
                    <IcomoonIcon name='warning' size={30} style={{ color: 'rgb(254, 149, 0)', marginBottom: 20 }} />
                    <Text style={styles.topPartNoticeText}>{'提交前请确认邮箱地址正确'}</Text>
                  </View>)
                }
              </View>
            </View>
        }
        <View style={styles.bottom}>
        {
          code === 2 ?
          <MyButton style={[styles.loadBtn, { borderWidth: 1, borderColor: '#E9E9EB', backgroundColor: '#E9E9EB' } ]} onPress={this.handBack.bind(this)}>
            <Text style={[styles.loadText, { color: '##909399' }]}>好的</Text>
          </MyButton> :
          <MyButton style={[styles.loadBtn, btnEnable ? { borderWidth: 1, borderColor: '#007AFE', backgroundColor: '#007AFE' } : { borderWidth: 1, borderColor: '#BFBFBF' }]} onPress={this.handSubmit.bind(this)}>
            <Text style={[styles.loadText, btnEnable ? { color: '#fff' } : { color: '#BFBFBF' }]}>提交</Text>
          </MyButton>
        }
        </View>
      </SafeAreaView>
    )
  }
}
export default connect(ExportInfoPage.mapStateToProps)(ExportInfoPage);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  infoContent: {
    width: Common.window.width - 60,
    marginTop: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  infoContent1: {
    width: Common.window.width - 40,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'center',
    borderBottomColor: '#000000',
    borderBottomWidth: 0.5,
    borderTopColor: '#000',
    borderTopWidth: 0.5
  },

  topPartNotice: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topPartNoticeText: {
    fontSize: FontSize(17),
    color: '##909399',
    lineHeight: 20,
  },
  infoTitle1: {
    color: '#000000',
    fontSize: FontSize(23),
  },
  infoTitle: {
    color: '#000000',
    fontSize: FontSize(17),
  },
  infoName: {
    color: '#606266',
    fontSize: FontSize(17),
    textAlign: 'center',
  },
  emailName: {
    color: '#606266',
    fontSize: FontSize(17),
    textAlignVertical: 'center'
  },
  infoValue: {
    color: '#909399',
    fontSize: FontSize(17),
  },
  emailInput: {
    paddingLeft: 15,
    marginLeft: 5,
    paddingTop: 5,
    paddingBottom: 5,
    flex: 1,
    fontSize: FontSize(17),
    color: '#333',
  },
  bottom: {
    height: 105,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
  },
  loadBtn: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 30,
    paddingRight: 30,
    alignItems: 'center',
    borderRadius: 50
  },
  loadText: {
    color: '#007AFE',
    fontSize: 15,
  },

});
