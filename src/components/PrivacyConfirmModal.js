import React, { Component } from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  Text,
  InteractionManager,
  Alert,
  Overlay,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
  Modal
} from 'react-native';
import moment from 'moment';
import Common from '../common/constants';
import { logger, FontSize } from '../utils/utils';
import actionProcess from "../actions/actionProcess";
import MyButton from "./MyButton";
import { destroySibling, showLoading, destroyConfirmSibling } from "./ShowModal";
import * as Storage from '../common/Storage';
import GlobalData from "../utils/GlobalData";
import {
  WebView
} from 'react-native-webview';
const globalData = GlobalData.getInstance();
const Toast = Overlay.Toast;

export default class PrivacyConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backButtonEnabled: false,
    };
    this.INJECTEDJAVASCRIPT = `
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'initial-scale=1, maximum-scale=1, user-scalable=0'); 
    meta.setAttribute('name', 'viewport'); 
    document.getElementsByTagName('head')[0].appendChild(meta);`
    this.wv = React.createRef();
  }

  componentDidMount() {
    logger('.......PrivacyConfirmModal componentDidMount')

  }
  componentWillUnmount() {
    // this.loadMoreDataThrottled.cancel();
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

render() {
  const { preItem, item} = this.props;
  return (
    <View style={[styles.modalContainer,{height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}>
      <View style={styles.container}>
       <View style={styles.processInfo}>
        <Text style={styles.modelTitle}>隐私政策和用户协议</Text>
        <View style={styles.modelContent}>
          <WebView
              ref={this.wv}
              source={{ uri: Common.webUrl + 'privacy/privacy.html' }}
              scalesPageToFit={false}
              bounces={false}
              style={{width:'100%',height:'100%'}}
              javaScriptEnabled={true}
              injectedJavaScript={this.INJECTEDJAVASCRIPT }
              mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
              userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
              incognito={true}
              onNavigationStateChange={this.onNavigationStateChange.bind(this)}
          />
         </View>
         <View style={styles.lawStr}><Text style={styles.lawText2}>阅读完整的</Text><Text style={styles.lawText1} onPress={()=>{this.props.goPrivacy && this.props.goPrivacy()}}>律时隐私保护指引</Text><Text style={styles.lawText2}>和</Text><Text style={styles.lawText1} onPress={this.props.goService}>律时用户服务协议</Text></View>                      
        </View>
        <View style={styles.centerBtns}>
          <MyButton
            onPress={() => {
              // destroyConfirmSibling();
              this.props.handleUnAgree && this.props.handleUnAgree();
            }}
          >
            <View
              style={[
                styles.bottomBtnsView,
                { borderWidth: 0, backgroundColor: "#BFBFBF" }
              ]}
            >
              <Text
                style={[
                  styles.bottomBtnsText,
                  { color: "#fff", fontFamily: "PingFangSC-Light" }
                ]}
              >
                不同意
              </Text>
            </View>
          </MyButton>
          <MyButton onPress={() => {
              // destroyConfirmSibling();
              this.props.handleAgree && this.props.handleAgree();
            }}>
            <View
              style={[
                styles.bottomBtnsView,
                {
                  backgroundColor: "#007AFE",
                  borderWidth: 0,
                  borderColor: "#007AFE"
                }
              ]}
            >
              <Text
                style={[
                  styles.bottomBtnsText,
                  { color: "#fff", fontWeight: "500" }
                ]}
              >
                同意并继续
              </Text>
            </View>
          </MyButton>
        </View>
      </View>
    </View>
  );
}
}
const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    width: Common.window.width,
    backgroundColor: 'rgba(0,0,0,0.8)',
    top: 0,
    zIndex: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: Common.window.width - 30,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    justifyContent: "center",
    alignItems: "center"
  },
  processInfo: {
    width: Common.window.width - 40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center"
  },
  modelTitle: {
    fontSize: FontSize(18),
    color: '#606266',
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  modelContent: {
    width: '100%',
    height: 350,
  },
  centerBtns: {
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    marginBottom: 0,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
  },
  bottomBtnsView: {
    width: Common.window.width / 2 - 50,
    height: 38,
    borderRadius: 100,
    marginTop: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBtnsText: {
    fontSize: FontSize(16)
  },
  lawStr: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    textAlign: 'center',
    marginTop: 10,
    // marginTop: 5,
  },
  lawText1: {
    fontSize: 14,
    color: '#007afe',
    textAlign: 'center',
  },
  lawText2: {
      fontSize: 14,
      color: '#C0C4CC',
  },
});
