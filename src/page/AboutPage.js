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
    NativeModules,Alert,
    Linking,
} from 'react-native';
import Header from '../components/Header';
import { CommonActions, StackActions } from '@react-navigation/native';
import {connect} from 'react-redux';
import actionAuth from '../actions/actionAuth';
import * as Storage from '../common/Storage';
import platform from '../utils/platform';
import {logger, getPhone, FontSize, compareVersion} from '../utils/utils';
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
import ImageArr from '../common/ImageArr';
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


    goService() {
      this.props.navigation.navigate('Service');
    }

    goPrivacy() {
      this.props.navigation.navigate('Privacy');
    }

    upgradeApp() {
      let version = '';
      const {dispatch} = this.props;
      if(platform.isAndroid()) {
        NativeModules.ScreenAdaptation.getAppVersion((event) =>{
            version = event;
            let downloadUrl = 'https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/app/LAWYER.apk';
            dispatch(actionAuth.reqAndroidVersion((rs, error) => {
              if(rs){
                  logger('.........getAppVersion', rs.version)
                  const ver = rs.version;
                  let num = compareVersion(version, ver);
                  if(num < 0) {
                    Alert.alert('App升级', `发现最新新版本[${ver}]，是否升级！。`, [{
                        text: '稍后升级',
                        onPress: () => {Storage.setVersion(ver)},
                        },
                        {
                          text: '下载升级包',
                          onPress: () => {
                            Storage.setVersion(ver);
                            Linking.openURL(downloadUrl).catch(err => {
                                logger('.....error', error)
                            });
                        },
                        },
                    ]);
                }
                else{
                  Toast.show('已经是最新版本！');
                }
              }
            }))
        });
      }
      else {
        version = NativeModules.SplashScreen && NativeModules.SplashScreen.getAppVersion();
        let downloadUrl =  'https://apps.apple.com/cn/app/%E5%BE%8B%E6%97%B6/id6446157793';
        dispatch(actionAuth.reqVersion((ver, error) => {
          if(ver){
              let num = compareVersion(version, ver);
              if(num < 0) {
                Alert.alert('App升级', `发现最新新版本[${ver}]，是否前往升级！。`, [{
                    text: '稍后升级',
                    onPress: () => {Storage.setVersion(ver)},
                    },
                    {
                      text: '去升级',
                      onPress: () => {
                        Storage.setVersion(ver);
                        Linking.openURL(downloadUrl).catch(err => {
                            logger('.....error', error)
                        });
                    },
                    },
                ]);
            }
            else{
              Toast.show('已经是最新版本！');
            }  
          }
        }))
      }
    }

    render() {
      const { version} = this.state;
      const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight 
      // logger('..onBackButtonPressAndroid', this.props.navigation)
      return (
          <SafeAreaView style={styles.container}>  
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            <Header title='关于律时与帮助' back={true}  {...this.props}/>  
            <View style={[styles.content]}> 
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={this.upgradeApp.bind(this)}>
                  <Text style={styles.menuText}>版本与更新</Text>
                  <Text >{version}</Text>
                </MyButton>
              </View>  
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={() => {this.props.navigation.navigate('Guide', { isFirst: 'false' })}}>
                  <Text style={styles.menuText}>使用引导</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>  
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={() => {this.props.navigation.navigate('FeedBack')}}>
                  <Text style={styles.menuText}>反馈</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>  
            </View> 
            <View style={styles.bottom}>         
              <View style={styles.lawStr}><Text style={styles.lawText1} onPress={this.goPrivacy.bind(this)}>《律时隐私保护指引》</Text><Text style={styles.lawText1}> | </Text><Text style={styles.lawText1} onPress={this.goService.bind(this)}>《律时用户服务协议》</Text></View>
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
  fontSize: FontSize(17),
  marginLeft: 5,
},
bottom: {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-end',
  marginBottom: 50,
},
lawText1: {
    fontSize: 13,
    color: '#007afe',
    marginTop: 5,
},
lawStr: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
},
right: {
  width: 18,
  height: 22,
}
});
