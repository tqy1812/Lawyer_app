import React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    Overlay,
    StatusBar,
    ImageBackground, InteractionManager
} from 'react-native';
import Header from '../components/Header';
import {connect} from 'react-redux';
import actionAuth from '../actions/actionAuth';
import * as Storage from '../common/Storage';
import platform from '../utils/platform';
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';
import MyButton from '../components/MyButton';
// import { CheckBox } from 'react-native-elements';
// import AntDesign from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
import authHelper from '../helpers/authHelper';
import actionCase from '../actions/actionCase';
const Toast = Overlay.Toast;

class PrivacyPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    componentDidMount() {
        
    }

    // 登录
    handSubmit() {
        InteractionManager.runAfterInteractions(() => {
            const {dispatch} = this.props;
            this.props.navigation.goBack();
            
        });
    }

    render() {
            return (
                <SafeAreaView style={styles.container}>   
                  <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />  
                    <Header title='律时隐私政策' back={true} {...this.props}/>                                                     
                    <View style={styles.container}>                    
                        <MyButton style={styles.loginBtn} onPress={this.handSubmit.bind(this)}>
                            <Text style={styles.loginText}>好的</Text>
                        </MyButton>
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
 topPart: {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexDirection: 'column',
},
logo: {
  width: 100,
  height: 100
},
topPartTitle: {
    alignItems: 'center',
    fontSize: 55,
    color: '#007afe',
    fontWeight: 'bold'
},
topPartName: {
  alignItems: 'center',
  fontSize: 15,
  color: '#606266',
  fontWeight: 'bold',
  lineHeight: 20
},
topPartNotice: {
    marginTop: 50,
    marginBottom: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
topPartNoticeText: {
    fontSize: 10,
    color: '#DCDFE6',
    lineHeight: 20,
    marginLeft: 2,
  },
content: {
  paddingLeft: 15,
  paddingRight: 15,
//   borderTopWidth: 1,
//   borderTopColor: '#dfdfdf',
//   borderBottomWidth: 1,
//   borderBottomColor: '#dfdfdf',
},
formInput: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  height: 50,
  lineHeight: 50,
  paddingLeft: 10,
  color: '#333',
  fontSize: 16,
  borderWidth: 1,
  borderRadius: 55,
  borderColor: '#dfdfdf',
  marginTop: 5,
  marginBottom: 5,
},
formInputSplit: {
  borderBottomWidth: 1,
  borderBottomColor: '#dfdfdf',
},
loginLabel: {
  fontSize: 16,
  color: '#333'
},
loginInput: {
  height: 40,
  paddingLeft: 15,
  flex: 1,
  fontSize: 16,
  color: '#333',
},
law: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#fff000'
  },
  lawStr: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    marginTop: 5,
  },
  lawText: {
    fontSize: 10,
    color: '#C0C4CC',
  },
  lawText1: {
    fontSize: 10,
    color: '#007afe',
  },
operate: {
    marginTop: 20,
  paddingLeft: 15,
  paddingRight: 15,
  flexDirection: 'column',
},
auto: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 5,
  paddingBottom: 5,
},
iconEye: {
  width: 22,
  height: 22,
},
eyeButton: {
    paddingTop: 10,
    paddingRight:  20,
    paddingBottom: 10,
},
loginBtn: {
  backgroundColor: '#007afe',
  padding: 10,
  alignItems: 'center',
  borderRadius: 30,
  marginTop: 5,
},
loginText: {
  color: '#ffffff',
  fontSize: 16,
},
updatePsdWrap: {
  width: '100%',
  flexDirection: 'row',
  marginTop: 15,
  justifyContent: 'flex-end',
},
updatePsd: {
  fontSize: 15,
  color: '#000'
},
checkBoxStyle: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 5,
  paddingBottom: 5,
  backfaceVisibility: 'hidden',
  borderColor: '#007afe',
  borderWidth: 0,
  backgroundColor: '#fff',
},
lawCheck: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 0,
    backgroundColor: '#fff',
    padding: 0,
  }
});
