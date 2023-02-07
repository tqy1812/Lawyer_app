import React,{Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  StatusBar,
  AppRegistry
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import MainPage from './MainPage';
import authHelper from '../helpers/authHelper';
import {connect} from 'react-redux';
import ActivityPage from './ActivityPage';
import platform from '../utils/platform';
import Common from "../common/constants";
import actionCase from "../actions/actionCase";
import WebSocketClient from "../utils/WebSocketClient";

const {width: windowWidth,height: windowHeight} = Common.window

class MainContainer extends Component {
  static mapStateToProps(state) {
    let props = {};
    props.user = state.Auth.user;
    props.isLogin = authHelper.logined(state.Auth.user);
    props.caseList = state.Case.caseList;
    props.finishList = state.Process.finishList;
    props.planList = state.Process.planList;
    return props;
  }
  constructor(props){
    super(props);
    // 设置初始值
    this.state={
      page: 0,
      scrollEnabled: false,
    }
    this.refPagerView=React.createRef();
    DeviceEventEmitter.removeAllListeners();
  }
  componentDidMount(){
    if(!this.props.isLogin) {
      this.props.navigation.navigate('Login');
    }
    this.props.dispatch(actionCase.reqCaseList()); 
    WebSocketClient.getInstance().initWebSocket();
    // AppRegistry.registerHeadlessTask('WebSocketConnect', () =>
    //   require('WebSocketConnect')
    // );
  }
  componentWillUnmount(){
    DeviceEventEmitter.removeAllListeners();
    // WebSocketClient.getInstance().onDisconnectWS();
  }
  
  onChangePage = () => {
    requestAnimationFrame(() => this.refPagerView.current?.setPage(0));
  }

  onActivityPage = () => {
    requestAnimationFrame(() => this.refPagerView.current?.setPage(1));
  }
  render() {
      const { scrollEnabled } = this.state;
     return (
      <SafeAreaView style={[styles.container]}>
        <StatusBar translucent={true} barStyle="dark-content" />
        <PagerView style={styles.pagerView} ref={this.refPagerView} initialPage={this.state.page} scrollEnabled={scrollEnabled}>
          {/* <View key="1">
            <Text>First page</Text>
            <Button 
              onPress={() => this.props.navigation.navigate('Login')} 
              title="登录">
            </Button>
          </View> */}
          <View key="2">
            <MainPage {...this.props} changePage={this.onActivityPage}/>
          </View>
          <View key="3">
            <ActivityPage {...this.props} back={this.onChangePage}/>
          </View>
      </PagerView>
    </SafeAreaView>)
    }
}
const STATUS_BAR_HEIGHT = platform.isIOS() ? (platform.isiPhoneX() ? 34 : 20) : Common.statusBarHeight   //StatusBar.currentHeight
console.log("****STATUS_BAR_HEIGHT"+STATUS_BAR_HEIGHT)
const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    width: windowWidth,
  },
  pagerView: {
    height: windowHeight - STATUS_BAR_HEIGHT,
    width: windowWidth,
  },
});


export default connect(MainContainer.mapStateToProps)(MainContainer);
