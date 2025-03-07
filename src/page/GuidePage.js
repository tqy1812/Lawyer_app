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
        props.caseList = state.Case.caseList;
        props.userInfo = state.Auth.userInfo;
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
          loading: true,
          backButtonEnabled: false,
          isFirst: props.route.params && props.route.params.isFirst ? props.route.params.isFirst : 'false',
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
      this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + this.state.isFirst + '");true;');
    }
    
    handleBack = () => {
      if (this.state.backButtonEnabled) {
        this.wv && this.wv.current && this.wv.current.goBack();
      } else {//否则返回到上一个页面
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
      if(content==='gotoMain') {
        Storage.setIsFirshGuide('1');
        this.props.navigation.replace('Main', {openNotice: false});
      }
      else if(content==='jumpToMain') {
        this.props.navigation.replace('Main', {openNotice: true});
      }
    }
    render() {
      const {isFirst} = this.state;
      return (
          <SafeAreaView style={styles.container}>  
            <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
            { isFirst=='false' && <Header title={'教学引导'} back={true} cancelFunc={this.handleBack.bind(this)} {...this.props}/> }                            
            { this.state.loading && <View style={styles.mask}>
                    <ActivityIndicator size="large" color="black" />
                    </View>}                                                   
                    <View style={styles.container}>                    
                      <WebView
                      ref={this.wv}
                      source={{ uri: Common.webUrl + 'guide/' }}
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
