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
import BaseComponent from '../components/BaseComponent';
import ImageArr from '../common/ImageArr';
import moment from 'moment';
const Toast = Overlay.Toast;

class CenterPage extends BaseComponent {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        props.caseList = state.Case.caseList;
        props.caseListInfo = state.Case.caseListInfo;
        props.userInfo = state.Auth.userInfo;
        props.comment = state.Auth.comment;
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
            imgAvatar: props.userInfo.avatar,
            caseList: props.caseList,
            caseListInfo: props.caseListInfo,
            appType: props.user.app_type,
            type: props.user.type ? props.user.type : 1,
        };
        this.globalDate = GlobalData.getInstance();
    }

    componentDidMount() {
      if(!this.props.isLogin) {
        this.props.navigation.navigate('Login');
      }
      if(this.state.type===2) {
        this.props.dispatch(actionAuth.reqClientUserInfo());
        this.props.dispatch(actionAuth.reqClientComment());
      }
      else {
        this.props.dispatch(actionAuth.reqUserInfo());
        this.props.dispatch(actionCase.reqCaseList((list, infoList)=>{
          // logger(list)
          if(list) {
            this.setState({caseList: list})
          }
          if(infoList) {
            this.setState({caseListInfo: infoList})
          }
        }));
      }
      this.cleanupImages();

      // if(platform.isIOS())
      //   NativeModules.SplashScreen && NativeModules.SplashScreen.IqKeyboardEnable();
    }
    componentWillUnmount () {
      // if(platform.isIOS())
      //   NativeModules.SplashScreen && NativeModules.SplashScreen.IqKeyboardDisable();
    }

    handSubmit() {
      const {dispatch} = this.props;
      const {routes} = this.state;
      dispatch({type: TYPE_AUTH_USER, data: {}});
      Storage.setAutoLogin('0');
      dispatch(actionAuth.logoutRecord());

      this.props.navigation.dispatch(state => {
        logger('.......logOut', state)
        return CommonActions.reset({
          ...state,
          routes: [{name: 'Login'}],
          index:0,
        });
      });
    }

    pickSingleWithCamera(cropping, mediaType = 'photo') {
      ImagePicker.openCamera({
        cropping: cropping,
        width: 500,
        height: 500,
        includeExif: true,
        mediaType,
      })
        .then((image) => {
          logger('received image', image);
          this.setState({
            image: {
              uri: image.path,
              width: image.width,
              height: image.height,
              mime: image.mime,
            },
            images: null,
          });
        })
        .catch((e) => alert(e));
    }

    async handlePromiseSelectPhoto()  {
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
        if(that.state.type==1){
          dispatch(actionAuth.reqUpload(file, (rs, error)=>{
            if(error){
              Toast.show(error.info)
            }
            else {
              dispatch(actionAuth.reqUserUpdate(rs.url, undefined, undefined, (result, error)=>{
                if(error){
                  Toast.show(error.info)
                }
                else {
                  let obj = JSON.parse(JSON.stringify(that.props.userInfo));
                  obj.avatar = rs.url;
                  dispatch(actionAuth.refreshUserInfo(obj));
                  that.setState({imgAvatar: rs.url})
                }
              }));
            }
          }));
        }
        else 
        {
          dispatch(actionAuth.reqClientUpload(file, (rs, error)=>{
            if(error){
              Toast.show(error.info)
            }
            else {
              dispatch(actionAuth.reqClientUserUpdate(rs.url, undefined, (result, error)=>{
                if(error){
                  Toast.show(error.info)
                }
                else {
                  let obj = JSON.parse(JSON.stringify(that.props.userInfo));
                  obj.avatar = rs.url;
                  dispatch(actionAuth.refreshUserInfo(obj));
                  that.setState({imgAvatar: rs.url})
                }
              }));
            }
          }));
        }
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
    };

    handleSetting() {
      if(platform.isAndroid()){
        NativeModules.NotifyOpen && NativeModules.NotifyOpen.openPermission();
      }
      else {
        NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting();
      }
    }

    cleanupImages() {
      ImagePicker.clean()
        .then(() => {
          logger('removed tmp images from tmp directory');
        })
        .catch((e) => {
          alert(e);
        });
    }

    openSetting () {
      if(platform.isAndroid()){
        NativeModules.NotifyOpen && NativeModules.NotifyOpen.open();
      }
      else {
        NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting();
      }
    }

    openTimePage() {
      this.props.navigation.navigate('WebPage', { url: 'time_control/', title: '成功人士如何管理时间' })
    }

    openRole() {
      this.props.navigation.navigate('WebPage', { url: 'changeRole/', title: '选择您的虚拟助理', type: 'role' })
    }

    openManagePage() {
      this.props.navigation.navigate('ManageProject', { url: 'additem/', title: '管理项目', type: 'manageCase' })
    }

    openClientCommentPage() {
      this.props.navigation.navigate('WebPage', { url: 'feedback/', title: '反馈记录' })
    }
    render() {
      const { userInfo, caseList, caseListInfo, comment} = this.props;
      const { imgAvatar, appType, type } = this.state;
      const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalDate.getTop() : Common.statusBarHeight

      // logger('..onBackButtonPressAndroid', this.props)
      // logger('....caseList',this.props.caseList)
      return (
          <SafeAreaView style={[styles.container]}>
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            <Header title='个人中心' close={true}  {...this.props}/>
            <ScrollView style={styles.scrollView}  nestedScrollEnabled={true}>
            <View style={[styles.content, { minHeight: platform.isIOS() ?  Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 20 : Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 10,}]}>
              <View style={styles.infoContent}>
                <TouchableOpacity onPress={this.handlePromiseSelectPhoto.bind(this)} >
                  {
                    imgAvatar ?
                    <Image style={styles.avatar} source={{uri: imgAvatar,method: 'GET',
                    headers: {
                      Pragma: 'no-cache',
                    }}}
                  /> : <IcomoonIcon name='center' size={80} style={{color: 'rgb(0, 122, 254)'}}/>
                  }

                </TouchableOpacity>
                <View style={styles.infoView}>
                  <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.name}</Text>
                  <Text style={styles.infoCompany} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.org_name}</Text>
                  <Text style={styles.infoPhone} numberOfLines={1} ellipsizeMode={'tail'}>{getPhone(userInfo.phone, '*')}</Text>
                </View>
              </View>
              <View style={styles.menuTitleView}><Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode={'tail'}>项目</Text></View>
              { type ==1 && <View style={styles.menuView}>
                <View style={styles.menuButton}>
                  <Text style={styles.menuText}>当前项目</Text>
                  {/* <View style={[styles.menuProject, {justifyContent: appType==3 ? 'center' : 'flex-end'}]}><Text style={styles.menuText1}>共</Text><Text style={styles.menuText2}>{caseListInfo && caseListInfo.length}</Text></View> */}
                  {appType==3 ? <MyButton style={{paddingTop: 5, paddingBottom: 5}} onPress={this.openManagePage.bind(this)}><Text style={styles.manageText}>管理项目</Text></MyButton> : <View style={[styles.menuProject]}><Text style={styles.menuText1}>共</Text><Text style={styles.menuText2}>{caseListInfo && caseListInfo.filter(o=> o.state !==3).length}</Text></View>}
                </View>
                <View style={styles.splitLine}></View>
                <ScrollView style={styles.caseViewScroll} nestedScrollEnabled={true}>
                  <View style={styles.caseView}>
                  {
                    JSON.stringify(caseList)!='{}' && caseListInfo && caseListInfo.length > 0 && caseListInfo.map((item)=>{
                       
                        return item.state !==3 && <View key={item.id} style={styles.caseItem}><View style={[styles.caseItemBadge, {backgroundColor: caseList[item.id+''] ? caseList[item.id+''][2]: '#ff0000'}]}></View><Text style={styles.caseItemName} numberOfLines={1} ellipsizeMode={'tail'}>{item.name}</Text></View>
                       
                      })
                  }
                  </View>
                </ScrollView>
                {appType==3 && <View style={[styles.menuProject1]}><Text style={styles.menuText1}>共</Text><Text style={styles.menuText3}>{caseListInfo && caseListInfo.filter(o=> o.state !==3).length}</Text></View>}
              </View> }
              { type ==2 && <View style={styles.menuView}>
                <View style={styles.menuButton}>
                  <Text style={styles.menuText}>反馈记录</Text>
                  <MyButton style={{paddingTop: 5, paddingBottom: 5}} onPress={this.openClientCommentPage.bind(this)}><Text style={styles.manageText}>详情</Text></MyButton>
                </View>
                <View style={styles.splitLine}></View>
                <ScrollView style={styles.caseViewScroll} nestedScrollEnabled={true}>
                  <View style={styles.caseView}>
                  {
                      comment && comment.length > 0 && comment.map((item)=>{        
                        
                        let content = item.content.replace(/<br>/g, " ").replace(/&#10;/g, " ");              
                        return <View key={item.id} style={styles.caseItem}><Text style={styles.caseItemName} numberOfLines={1} ellipsizeMode={'tail'}>{ `${moment(item.create_time).format('YYYYMMDD')} - ${item.content}` }</Text></View>                    
                      })
                  }
                  </View>
                </ScrollView>
              </View> }
              { type ==1 && <View style={styles.menuView}>
                <MyButton style={styles.menuButton} onPress={() => { this.props.navigation.navigate('Report')}}>
                  <Text style={styles.menuText}>统计报告</Text>
                  {/* <AntDesign size={15} name='right' color='#606266'/> */}
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>}
              <View style={styles.menuTitleView}><Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode={'tail'}>个性化</Text></View>
              { type ==1 && <View style={styles.menuView}>
                <MyButton style={styles.menuButton} onPress={() => {this.openSetting()}}>
                  <Text style={styles.menuText}>通知提醒</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>}
              { type ==1 && <View style={styles.menuView}>
                <MyButton style={styles.menuButton} onPress={() => {this.openRole()}}>
                  <Text style={styles.menuText}>主页形象</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>}
              <View style={styles.menuView}>
                <MyButton style={styles.menuButton} onPress={() => {this.openTimePage()}}>
                  <Text style={styles.menuText}>时间管理指南</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>
              <View style={styles.menuTitleView}><Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode={'tail'}>隐私安全</Text></View>
              <View style={styles.menuView}>
                <MyButton style={styles.menuButton} onPress={() => {this.props.navigation.navigate('Permission')}}>
                  <Text style={styles.menuText}>系统权限管理</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>
              <View style={styles.menuView}>
                <MyButton style={styles.menuButton} onPress={() => {this.props.navigation.navigate('ThirdApiList')}}>
                  <Text style={styles.menuText}>第三方信息共享清单</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>
              <View style={styles.menuView}>
                <MyButton style={styles.menuButton} onPress={() => {this.props.navigation.navigate('MyInfo')}}>
                  <Text style={styles.menuText}>个人信息查看</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>
              <View style={styles.menuView}>
                <MyButton style={styles.menuButton} onPress={() => {this.props.navigation.navigate('UpdatePassword')}}>
                  <Text style={styles.menuText}>修改密码</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>
              <View style={styles.menuView1}>
                <MyButton style={styles.menuButton} onPress={() => {this.props.navigation.navigate('About')}}>
                  <Text style={styles.menuText}>关于律时与反馈</Text>
                  <Image style={[styles.right]} source={ImageArr['arrow_right']}></Image>
                </MyButton>
              </View>
            </View>
            <View style={styles.bottom}>
                <MyButton style={styles.logoutBtn} onPress={this.handSubmit.bind(this)}>
                    <Text style={styles.logoutText}>退出账号</Text>
                </MyButton>
            </View>
            </ScrollView>
          </SafeAreaView>
      )
    }
}
export default connect(CenterPage.mapStateToProps)(CenterPage);
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
 scrollView: {
  flex: 1,
 },
content: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
},
infoContent: {
  width: Common.window.width - 40,
  backgroundColor: '#ffffff',
  padding: 10,
  borderRadius: 8,
  marginTop: 20,
  marginLeft: 20,
  marginRight: 20,
  marginBottom: 20,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignContent: 'center',
},
avatar: {
  width: 80,
  height: 80,
  borderRadius: 40,
},
infoView: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignContent: 'center',
  marginLeft: 10,
},
infoName:{
  color: '#606266',
  fontSize: FontSize(24),
  lineHeight: 28
},
infoCompany:{
  color: '#606266',
  fontSize: 13,
  lineHeight: 16,
  marginTop: 3,
  marginBottom: 4,
},
infoPhone:{
  color: '#909399',
  fontSize: 14,
  lineHeight: 16
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
menuTitleView: {
  width: Common.window.width - 40,
  marginTop: 20,
  marginLeft: 20,
  marginRight: 20,
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingLeft: 10,
},
menuView1: {
  width: Common.window.width - 40,
  backgroundColor: '#ffffff',
  borderRadius: 8,
  marginTop: 50,
  marginLeft: 20,
  marginRight: 20
},
splitLine: {
  height: 1,
  width: Common.window.width - 60,
  backgroundColor: '#D9D9D9',
},
menuButton: {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 10,
},
menuProject: {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
},
menuProject1: {
  marginBottom: 5,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
menuText: {
  flex: 1,
  color: '#606266',
  fontSize: FontSize(20),
  marginLeft: 5,
},
manageText: {
  color: '#007afe',
  fontSize: 13,
  marginTop: 3,
  marginRight: 5,
},
menuText1: {
  color: '#909399',
  fontSize: 13,
  marginTop: 3,
},
menuText2: {
  color: '#909399',
  fontSize: FontSize(21),
  marginLeft: 1,
  fontWeight: '600'
},
menuText3: {
  color: '#909399',
  fontSize: 15,
  marginLeft: 2,
  marginTop: 4,
},
caseViewScroll: {
  width: Common.window.width - 60,
  maxHeight: 200,
},
caseView: {
  width: Common.window.width - 60,
  paddingTop: 5,
  paddingLeft: 5,
  paddingRight: 5,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignContent: 'center',
},
caseItem: {
  width: Common.window.width - 70,
  padding: 5,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignContent: 'center',
},
caseItemBadge: {
  width: 15,
  height: 15,
  borderRadius: 15,
  alignSelf: 'center'
},
caseItemName:{
  color: '#979797',
  fontSize: 15,
  lineHeight: 20,
  marginLeft: 10,
},
itemTitle:{
  color: '#979797',
  fontSize: 12,
  marginLeft: 5,
},
bottom: {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-end',
  marginTop: 100,
},
logoutBtn: {
  width: Common.window.width - 40,
  backgroundColor: '#ffffff',
  paddingTop: 15,
  paddingBottom: 15,
  paddingLeft: 30,
  paddingRight: 30,
  alignItems: 'center',
  borderRadius: 30,
  margin: 20,
},
logoutText: {
  color: '#909399',
  fontSize: FontSize(19),
},
right: {
  width: 18,
  height: 22,
}
});
