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
    ImageBackground, ActivityIndicator
} from 'react-native';
import Header from '../components/Header';
import {connect} from 'react-redux';
import * as Storage from '../common/Storage';
import platform from '../utils/platform';
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';
import MyButton from '../components/MyButton';
import {
  WebView
} from 'react-native-webview';
import { logger } from '../utils/utils';
const Toast = Overlay.Toast;
const { width: windowWidth, height: windowHeight } = Common.window;

class PrivacyPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
          loading: true,
          backButtonEnabled: false
        };
        this.INJECTEDJAVASCRIPT = `
        const meta = document.createElement('meta'); 
        meta.setAttribute('content', 'initial-scale=1, maximum-scale=1, user-scalable=0'); 
        meta.setAttribute('name', 'viewport'); 
        document.getElementsByTagName('head')[0].appendChild(meta);`
        this.wv = React.createRef();
    }

    componentDidMount() {
        
    }

    closeLoading = () => {
      this.setState({loading: false});
    }
    handleBack = () => {
      if (this.state.backButtonEnabled) {
        this.wv && this.wv.current && this.wv.current.goBack();
      } else {//否则返回到上一个页面
        this.props.navigation.goBack();
      }
    }
    onNavigationStateChange = (navState) => {
      logger(navState)
      this.setState({
        backButtonEnabled: navState.canGoBack
      });
    }

    handleNativeMessage = (content) => {
      logger('handleNativeMessage====' + content);
      this.props.navigation.navigate(content);
    }
    render() {
            return (
                <SafeAreaView style={styles.container}>   
                  <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />  
                    <Header title='律时隐私保护指引' back={true} cancelFunc={this.handleBack.bind(this)} {...this.props}/>                                                     
                    { this.state.loading && <View style={styles.mask}>
                      <ActivityIndicator size="large" color="black" />
                    </View>}                                                   
                    <View style={styles.container}> 
                    <WebView
                      ref={this.wv}
                      source={{ uri: Common.webUrl + 'privacy/privacy.html' }}
                      scalesPageToFit={false}
                      bounces={false}
                      style={{width:windowWidth,height:'100%'}}
                      javaScriptEnabled={true}
                      injectedJavaScript={this.INJECTEDJAVASCRIPT }
                      onMessage={(event) => {this.handleNativeMessage(event.nativeEvent.data)}}
                      mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
                      userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
                      incognito={true}
                      onLoadEnd={this.closeLoading.bind(this)}
                      onNavigationStateChange={this.onNavigationStateChange.bind(this)}
                    />
                    </View>
                </SafeAreaView>
            )
    }
}
export default connect(PrivacyPage.mapStateToProps)(PrivacyPage);

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
