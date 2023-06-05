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
    Alert
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

class FeedBackPage extends Component {

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
          title: '',
          email: '',
          desc: ''
        };
        this.globalDate = GlobalData.getInstance();
    }

    componentDidMount() {
      if(!this.props.isLogin) {
        this.props.navigation.navigate('Login');
      }
    
    }

    handleSend() {
      const { title, email, desc } = this.state;
      const { dispatch } = this.props;
      if (title == null || title == '' ) {
        Toast.show('主题不能为空!');
        return;
      }
      if (email == null || title == '' ) {
        Toast.show('邮箱不能为空!');
        return;
      }
      const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
      if(!reg.test(email)){
        Toast.show('邮箱格式不正确!');
        return;
      }

      dispatch(actionAuth.reqAddFeedback(title, desc, email, (res, error) => {
        logger(res)
        if (error) {
            logger(error)
            Toast.show(error.info);
        } else {
          Alert.alert('发送成功', `您好，客服会在14天内根据您提供的邮件地址答复您，感谢您的反馈。`, [
          {
            text: '好的',
            onPress: () => {this.props.navigation.goBack();},
          },
          ]);
        }
      }));
    }

    
  handleTitleChanged(text) {
    let name = text.trim();
    this.setState({ title: name});
  }
  handleEmailChanged(text) {
    let name = text.trim();
    this.setState({ email: name});
  }
  handleDescChanged(text) {
    let name = text.trim();
    this.setState({ desc: name});
  }
    render() {
      const { title, email, desc } = this.state;
      const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight 
      // logger('..onBackButtonPressAndroid', this.props.navigation)
      // logger(caseList)
      return (
          <SafeAreaView style={styles.container}>  
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            <Header title='反馈' back={true} send={true}  sendFunc={this.handleSend.bind(this)} {...this.props}/>  
            <View style={[styles.content, { minHeight: platform.isIOS() ?  Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 20 : Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 10,}]}> 
              <TextInput
                  placeholder='主题'
                  placeholderTextColor='#909399'
                  style={styles.singleInput}
                  onChangeText={this.handleTitleChanged.bind(this)}
                  value={title}
              />
              <TextInput
                  placeholder='邮箱'
                  placeholderTextColor='#909399'
                  style={styles.singleInput}
                  onChangeText={this.handleEmailChanged.bind(this)}
                  value={email}
              />
              <TextInput
                  placeholder='输入内容'
                  placeholderTextColor='#909399'
                  style={styles.mutilInput}
                  onChangeText={this.handleDescChanged.bind(this)}
                  value={desc}
                  multiline={true}
                  numberOfLines={12}
              />
            </View>         
          </SafeAreaView>
      )
    }
}
export default connect(FeedBackPage.mapStateToProps)(FeedBackPage);
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
  justifyContent: 'flex-start',
},
menuView: {
  width: Common.window.width - 40,
  backgroundColor: '#ffffff',
  borderRadius: 8,
  marginTop: 5,
  marginLeft: 20,
  marginRight: 20,
  justifyContent: 'center',
  alignItems: 'center'
},
singleInput: {
  width: Common.window.width - 40,
  paddingLeft: 15,
  marginTop: 5,
  paddingTop: 5,
  paddingBottom: 5,
  height: 40,
  fontSize: FontSize(17),
  color: '#333',
  backgroundColor: '#F4F4F5',
  borderRadius: 5
},
mutilInput: {
  width: Common.window.width - 40,
  paddingLeft: 15,
  marginTop: 5,
  paddingTop: 5,
  paddingBottom: 5,
  height: 250,
  fontSize: FontSize(17),
  color: '#333',
  backgroundColor: '#F4F4F5',
  borderRadius: 5,
  textAlignVertical: 'top'
},
});
