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
const Toast = Overlay.Toast;

class AboutPage extends Component {

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
          version: ''
        };
        this.globalDate = GlobalData.getInstance();
        if(platform.isAndroid()) {
          NativeModules.ScreenAdaptation.getAppVersion((event) =>{
            this.setState({
                version:event
            })
          });
        }
        else {
          const version = NativeModules.SplashScreen && NativeModules.SplashScreen.getAppVersion();
          logger('version222==='+version)
          this.state.version = version;
        }
    }

    componentDidMount() {
      if(!this.props.isLogin) {
        this.props.navigation.navigate('Login');
      }
    
    }

    render() {
      const { version} = this.state;
      const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight 
      // logger('..onBackButtonPressAndroid', this.props.navigation)
      logger('version11==='+version)
      return (
          <SafeAreaView style={styles.container}>  
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            <Header title='关于律时与帮助' back={true}  {...this.props}/>  
            <View style={[styles.content, { minHeight: platform.isIOS() ?  Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 20 : Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 10,}]}> 
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={() => {}}>
                  <Text style={styles.menuText}>版本与更新</Text>
                  <Text >{version}</Text>
                </MyButton>
              </View>  
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={() => {this.props.navigation.navigate('FeedBack')}}>
                  <Text style={styles.menuText}>反馈</Text>
                  <AntDesign size={15} name='right' color='#606266'/>
                </MyButton>
              </View>  
            </View>         
          </SafeAreaView>
      )
    }
}
export default connect(AboutPage.mapStateToProps)(AboutPage);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
menuButton: {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 10,
},
menuText: {
  flex: 1,
  color: '#606266',
  fontSize: 17,
  marginLeft: 5,
},
});