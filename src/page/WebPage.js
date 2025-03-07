import React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    Overlay,
    StatusBar,
    Platform,
    DeviceEventEmitter,
    ImageBackground, ActivityIndicator
} from 'react-native';
import Header from '../components/Header';
import {connect} from 'react-redux';
import * as Storage from '../common/Storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';
import platform from '../utils/platform';
import {
  WebView
} from 'react-native-webview';
import { caseSetting, logger } from '../utils/utils';
import actionCase from "../actions/actionCase";
import actionAuth from '../actions/actionAuth';
const Toast = Overlay.Toast;
const { width: windowWidth, height: windowHeight } = Common.window;

class WebPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.caseList = state.Case.caseList;
        props.userInfo = state.Auth.userInfo;
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
          loading: true,
          backButtonEnabled: false,
          webviewUrl: props.route.params.url,
          title: props.route.params.title,
          type: props.route.params.type,
          caseSet: caseSetting(props.caseList),
          userType: props.user.type ? props.user.type : 1,
        };
        this.INJECTEDJAVASCRIPT = `
        const meta = document.createElement('meta'); 
        meta.setAttribute('content', 'initial-scale=1, maximum-scale=1, user-scalable=0'); 
        meta.setAttribute('name', 'viewport'); 
        document.getElementsByTagName('head')[0].appendChild(meta);`
        this.wv = React.createRef();
        this.token = '';
    }

    componentDidMount() {
    }

    closeLoading = () => {
      this.setState({loading: false});
      Storage.getUserRecord().then((user) => {
        if (user) {
          let obj = Object.assign({}, JSON.parse(user));
          // this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + obj.token + '");true;');
          this.token = obj.token;
          if(this.state.type && this.state.type==='role') {
            logger('voice_type====='+this.props.userInfo.voice_type)
            this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + obj.token + '", "' +  this.props.userInfo.voice_type + '");true;');
          }
          else if(this.state.type && this.state.type==='manageCase') {
            let reg = new RegExp('"',"g");  
            this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + obj.token + '", "' + JSON.stringify(this.state.caseSet).replace(reg, "'") + '");true;');
          } 
          else if(this.state.type && this.state.type==='logOff') {
            this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + obj.token + '", "' + this.state.userType + '");true;');
          } 
          else {
            this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + obj.token + '");true;');
          }
        }
      });

    }
    handleBack = () => {
      if (this.state.backButtonEnabled) {
        this.wv && this.wv.current && this.wv.current.goBack();
      } else {//否则返回到上一个页面
        if(this.state.type==='ClientComment') {
          DeviceEventEmitter.emit('refreshClientList')
        }
        this.props.navigation.goBack();
      }
    }
    onNavigationStateChange = (navState) => {
      this.setState({
        backButtonEnabled: navState.canGoBack
      });
    }

    handleNativeMessage = (event) => {
      const content = event.nativeEvent.data;
      if(content==='addProjectSuccess' || content==='closeProjectSuccess' 
      || content==='openProjectSuccess' || content==='editProjectSuccess' || content==='deleteProjectSuccess'){
        this.props.dispatch(actionCase.reqCaseList((list, infoList)=>{
          // logger(list)
          if(list) {
            DeviceEventEmitter.emit('refreshCaseFinish', list);
            DeviceEventEmitter.emit('refreshCasePlan', list);
            if(content==='addProjectSuccess'){
              Toast.show('添加成功');
              let reg = new RegExp('"',"g");  
              let caseList = caseSetting(list);
              this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + this.token + '", "' + JSON.stringify(caseList).replace(reg, "'") + '");true;');
            } else if(content==='closeProjectSuccess'){
              Toast.show('封存项目成功');
            } else if(content==='openProjectSuccess'){
              Toast.show('解封项目成功');
            } else if(content==='editProjectSuccess'){
              Toast.show('修改项目成功');
            } else if(content==='deleteProjectSuccess'){
              Toast.show('删除项目成功');
            }
          }
        }));
        
      }
      else if(content.indexOf('addProjectFail:') === 0) {
        const errorMesg = content.replace('addProjectFail:', '');
        Toast.show(errorMesg);
      }
      else if(content.indexOf('editProjectFail:') === 0) {
        const errorMesg = content.replace('editProjectFail:', '');
        Toast.show(errorMesg);
      }
      else if(content.indexOf('editRole:') ===0){
        const role = content.replace('editRole:', '');
        if(this.props.userInfo.voice_type !==role){
          this.props.dispatch(actionAuth.reqUserInfo());
        }
      }
      else if(content.indexOf('gotoNext') ===0){
        this.props.navigation.replace('Security');
      }
      else if(content.indexOf('unchecked') ===0){       
        Toast.show('请勾选同意用户注销协议');
      }
    }
    render() {
      const {webviewUrl,  title} = this.state;
      return (
          <SafeAreaView style={styles.container}>  
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            <Header title={title} back={true} cancelFunc={this.handleBack.bind(this)} {...this.props}/>                              
            { this.state.loading && <View style={styles.mask}>
                      <ActivityIndicator size="large" color="black" />
                    </View>}                                                   
                    <View style={styles.container}>                    
                      <WebView
                      ref={this.wv}
                      source={{ uri: Common.webUrl + webviewUrl }}
                      scalesPageToFit={false}
                      bounces={false}
                      style={{width:windowWidth,height:'100%'}}
                      javaScriptEnabled={true}
                      injectedJavaScript={this.INJECTEDJAVASCRIPT }
                      onMessage={this.handleNativeMessage.bind(this)}
                      mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
                      userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
                      incognito={true}
                      onLoadEnd={this.closeLoading.bind(this)}
                      onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                      allowsInlineMediaPlayback={true}
                    />
                    </View>
          </SafeAreaView>
      )
    }
}
export default connect(WebPage.mapStateToProps)(WebPage);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: Common.window.height,
    backgroundColor: '#fff',
    color: '#000',
    justifyContent: 'center'
 },
  mask: {
    flex: 1,
    width: '100%',
    height: Common.window.height,
    top: 0,
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
  },
});
