import React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    Overlay,
    ScrollView,
    ImageBackground, InteractionManager, TouchableOpacity,
    NativeModules
} from 'react-native';
import Header from '../components/Header';
import { CommonActions, StackActions } from '@react-navigation/native';
import {connect} from 'react-redux';
import actionAuth from '../actions/actionAuth';
import * as Storage from '../common/Storage';
import platform from '../utils/platform';
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
const Toast = Overlay.Toast;

class CenterPage extends Component {

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
            imgAvatar: props.userInfo.avatar
        };
    }

    componentDidMount() {
      if(!this.props.isLogin) {
        this.props.navigation.navigate('Login');
      }
      // console.log('....................' , this.props.navigation.getState());
      // this.setState({ routes: this.props.navigation.getState().routes});
      this.props.dispatch(actionAuth.reqUserInfo()); 
    }

  
    handSubmit() {
      const {dispatch} = this.props;
      const {routes} = this.state;
      dispatch({type: TYPE_AUTH_USER, data: {}});
      // console.log('.....#################',routes)
      // const route = routes.find(r=> r.name == 'Center');
      // console.log('.....',route)
      // if(route && route.params.key) {
      //   this.props.navigation.goBack(route.params.key);
      // }
      
      this.props.navigation.dispatch(state => {
        console.log('.......logOut', state)
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
          console.log('received image', image);
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

    handlePromiseSelectPhoto = () => {
      const that = this;
      const {dispatch} = this.props;
      ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
      }).then(image => {
        console.log('....handlePromiseSelectPhoto'+ JSON.stringify(image));
        const file = {
          uri: image.path,      
          name: image.modificationDate +'.jpg',           
          type: image.mime          
        }
        dispatch(actionAuth.reqUpload(file, (rs, error)=>{
          if(error){
            Toast.show(error.info)
          }
          else {
            dispatch(actionAuth.reqUserUpdate(rs.url, (result, error)=>{
              if(error){
                Toast.show(error.info)
              }
              else {
                that.setState({imgAvatar: rs.url})
              }
            }));
          }
        }));
      });
    };
    cleanupImages() {
      ImagePicker.clean()
        .then(() => {
          console.log('removed tmp images from tmp directory');
        })
        .catch((e) => {
          alert(e);
        });
    }
    render() {
      const {caseList, caseListInfo, userInfo} = this.props;
      const { imgAvatar} = this.state;
      // console.log('..onBackButtonPressAndroid', this.props.navigation)
      // console.log(caseList)
      return (
          <SafeAreaView style={styles.container}>  
            <Header title='个人中心' close={true}  {...this.props}/>  
            <ScrollView style={styles.scrollView}>  
            <View style={styles.content}> 
              <View style={styles.infoContent}> 
                <TouchableOpacity onPress={this.handlePromiseSelectPhoto} >
                  {
                    imgAvatar ?
                    <Image style={styles.avatar} source={{uri: imgAvatar}}
                  /> : <IcomoonIcon name='center' size={80} style={{color: 'rgb(0, 122, 254)'}}/>
                  }
                  
                </TouchableOpacity>
                <View style={styles.infoView}> 
                  <Text style={styles.infoName} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.name}</Text>
                  <Text style={styles.infoCompany} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.org_name}</Text>
                  <Text style={styles.infoPhone} numberOfLines={1} ellipsizeMode={'tail'}>{userInfo.phone}</Text>
                </View>
              </View>
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={() => {}}>
                  <Text style={styles.menuText}>项目类别</Text>
                </MyButton>
                <View style={styles.splitLine}></View>
                <View style={styles.caseView}>
                  {
                    JSON.stringify(caseList)!='{}' && caseListInfo && caseListInfo.length > 0 && caseListInfo.map((item)=>{
                        return <View style={styles.caseItem}><View style={[styles.caseItemBadge, {backgroundColor: caseList[item.id+''] ? caseList[item.id+''][2]: '#ff0000'}]}></View><Text style={styles.caseItemName} numberOfLines={1} ellipsizeMode={'tail'}>{item.name}</Text></View>
                    })
                  }
                </View>
              </View> 
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={() => {}}>
                  <Text style={styles.menuText}>统计报告</Text>
                </MyButton>
              </View> 
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={() => {NativeModules.NotifyOpen && NativeModules.NotifyOpen.open();}}>
                  <Text style={styles.menuText}>通知提醒</Text>
                  <AntDesign size={15} name='right' color='#606266'/>
                </MyButton>
                
              </View>  
              <View style={styles.menuView}> 
                <MyButton style={styles.menuButton} onPress={() => {}}>
                  <Text style={styles.menuText}>隐私条款</Text>
                </MyButton>
              </View>  
            </View>          
            <View style={styles.bottom}>                    
                <MyButton style={styles.logoutBtn} onPress={this.handSubmit.bind(this)}>
                    <Text style={styles.loginText}>退出账号</Text>
                </MyButton>
            </View>
            </ScrollView>
          </SafeAreaView>
      )
    }
}
export default connect(CenterPage.mapStateToProps)(CenterPage);
const STATUS_BAR_HEIGHT = platform.isIOS() ? (platform.isiPhoneX() ? 34 : 20) : Common.statusBarHeight 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: Common.window.height,
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
  minHeight: Common.window.height - 45 - STATUS_BAR_HEIGHT - 76 - 10,
},
infoContent: {
  width: Common.window.width - 40,
  backgroundColor: '#ffffff',
  padding: 10,
  borderRadius: 8,
  marginTop: 20,
  marginLeft: 20,
  marginRight: 20,
  marginBottom: 40,
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
  fontSize: 19,
},
infoCompany:{
  color: '#606266',
  fontSize: 15,
},
infoPhone:{
  color: '#909399',
  fontSize: 16,
},
menuView: {
  width: Common.window.width - 40,
  backgroundColor: '#ffffff',
  padding: 10,
  borderRadius: 8,
  marginTop: 5,
  marginLeft: 20,
  marginRight: 20
},
splitLine: {
  height: 1,
  width: Common.window.width - 60,
  backgroundColor: '#D9D9D9',
  marginTop: 10,
},
menuButton: {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
},
menuText: {
  flex: 1,
  color: '#606266',
  fontSize: 17,
  marginLeft: 5,
},
caseView: {
  width: Common.window.width - 70,
  paddingTop: 5,
  paddingLeft: 5,
  paddingRight: 5,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignContent: 'center',
},
caseItem: {
  width: Common.window.width - 80,
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
  fontSize: 14,
  marginLeft: 5,
},
bottom: {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-end',
},
logoutBtn: {
  width: Common.window.width - 40,
  backgroundColor: '#ffffff',
  padding: 10,
  alignItems: 'center',
  borderRadius: 30,
  margin: 20,
},
logoutText: {
  color: '#D9D9D9',
  fontSize: 16,
},

});
