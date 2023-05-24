import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    Overlay,
    ImageBackground, InteractionManager,
    Keyboard,
    StatusBar,
    TouchableOpacity,
    NativeModules,
    PixelRatio,
    Linking,
    Alert
} from 'react-native';
import { SafeAreaInsetsContext, withSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { connect } from 'react-redux';
import actionAuth from '../actions/actionAuth';
import * as Storage from '../common/Storage';
import platform from '../utils/platform';
import Common from '../common/constants';
import MyButton from '../components/MyButton';
import { CheckBox } from 'react-native-elements';
import AntDesign from 'react-native-vector-icons/AntDesign';
import authHelper from '../helpers/authHelper';
import actionCase from '../actions/actionCase';
import IcomoonIcon from "../components/IcomoonIcon";
import PushNotification, { Importance } from 'react-native-push-notification';
import GlobalData from "../utils/GlobalData";
import moment from 'moment';
import { logger, compareVersion,FontSize } from '../utils/utils';
import { SendIdentify } from '../components/SendIdentify';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../components/Header';
const Toast = Overlay.Toast;
class ForgotPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
            name: '',
            phone: '',
            password: '',
            confirm_password: '',
            eyed: false,
            confirm_eyed: false,
            autoLogin: false,
            lastId: 1,
            code: 0,
            indetify: '',
            deviceToken: '0',
            deviceType: Common.devicePushType.WSS,
            opt: ''
        };
        this.version = '';
        this.globalData = GlobalData.getInstance();
        this.nameListener = Keyboard.addListener('keyboardDidHide', this.nameForceLoseFocus);
        // this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    nameForceLoseFocus = () => {
        this.login_name && this.login_name.blur();
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            const { dispatch, isLogin } = this.props;
            if (isLogin) {
                this.props.navigation.navigate('Main');
                return;
            }
        });
    }

    componentWillUnmount() {
        logger('......ForgotPage componentWillUnmount')
        this.nameListener && this.nameListener.remove();
       
    }

    onRegistered = (deviceToken) => {
        const that = this
        logger('.......deviceToken='+deviceToken);
        if(deviceToken) {
            that.setState({deviceToken: deviceToken, deviceType: Common.devicePushType.IOS})
        }
      };

    // 用户名改变
    handlePhoneChanged(text) {
        let name = text.trim();
        this.setState({ phone: name });
    }
    handleNameChanged(text) {
        let name = text.trim();
        this.setState({ name: name });
    }
    // 密码改变
    handlePasswordChanged(text) {
        this.setState({ password: text });
    }
    handleComfirPasswordChanged(text) {
        this.setState({ confirm_password: text });
    }
    // 验证码
    handleIndetifyChanged(text) {
        this.setState({ indetify: text });
    }
    handleOptChanged(text) {
        this.setState({ opt: text });
    }
    // 登录
    handleLogin() {
        this.props.navigation.replace('Main');
    }
    handleRegister() {
        InteractionManager.runAfterInteractions(() => {
            const { dispatch } = this.props;
            const { phone, password, autoLogin, deviceToken, deviceType } = this.state;
            if (phone == null || phone.length <= 0) {
                Toast.show('手机号不能为空!');
                return;
            }

            if (password == null || password.length <= 0) {
                Toast.show('密码不能为空!');
                return;
            }

            if (autoLogin == false) {
                Toast.show('请勾选同意政策和服务协议');
                // Toast.show('请勾选同意政策和服务协议');
                return;
            }
            Toast.show("登录中");
            dispatch(actionAuth.reqLogin(phone, password, deviceToken, deviceType, (res, error) => {
                logger(res)
                if (error) {
                    logger(error)
                    if (error.code === 17004) {
                        this.setState({ code: 2 });
                    }
                    else if (error.code === 17003) {
                        this.setState({ code: 1 });
                    }
                    else {
                        if(error.info){
                            Toast.show(error.info);
                        }
                    }
                } else if (res && res.token) {
                    // if (autoLogin) {
                    Storage.setAutoLogin('1');
                    // }
                    dispatch(actionCase.reqCaseList());
                    this.props.navigation.replace('Main');
                    // Toast.show("登录成功");
                }
            }));
        });
    }

    goService() {
        this.props.navigation.navigate('Service');
    }

    goPrivacy() {
        this.props.navigation.navigate('Privacy');
    }

    send = () => {
    }
    render() {
        let logo = '/logo.png';
        const { insets } = this.props;

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
                <Header title='' close={true}  {...this.props}/>
                <ScrollView style={styles.scorllView} alwaysBounceVertical={false}>
                <View style={styles.body}>
                    <View style={styles.info}>
                        <View style={styles.infoPart}>
                            <Text style={styles.topPartName}>{'验证账号并修改密码'}</Text>
                        </View>
                    </View>
                    <View style={styles.content}>
                        <View style={[styles.formInput]}>
                            <TextInput
                                ref={(ref) => this.login_name = ref}
                                placeholder='手机帐号'
                                placeholderTextColor='#999'
                                style={styles.loginInput}
                                onChangeText={this.handlePhoneChanged.bind(this)}
                                value={this.state.phone}
                            />
                            {
                                this.state.phone !== '' && this.state.phone !== undefined && <MyButton style={styles.eyeButton} onPress={() => {
                                    this.setState({ phone: '' });
                                }}>
                                    <AntDesign name='closecircleo' size={15} color='#C0C4CC' />
                                </MyButton>
                            }
                        </View>
                        <View style={styles.formInput}>
                            <TextInput
                                ref={(ref) => this.login_identify = ref}
                                style={styles.loginInput}
                                placeholder='输入图形验证码'
                                placeholderTextColor='#999'
                                onChangeText={this.handleOptChanged.bind(this)}
                                value={this.state.opt} />
                                <Image style={styles.opt} source={{uri: this.state.imgBase64}}/>
                        </View>
                        <View style={styles.formInput}>
                            <TextInput
                                ref={(ref) => this.login_identify = ref}
                                style={styles.loginInput}
                                placeholder='点击获取动态验证码'
                                placeholderTextColor='#999'
                                onChangeText={this.handleIndetifyChanged.bind(this)}
                                value={this.state.indetify} />
                                <SendIdentify time={90} action={this.send.bind(this)}/>
                        </View>
                        <View style={styles.formInput}>
                            <TextInput
                                ref="login_psw"
                                style={styles.loginInput}
                                secureTextEntry={!this.state.eyed}
                                placeholder='设定密码'
                                placeholderTextColor='#999'
                                onChangeText={this.handlePasswordChanged.bind(this)}
                                value={this.state.password} />
                                <MyButton style={styles.eyeButton} onPress={() => {
                                    this.setState({ eyed: !this.state.eyed });
                                }}>
                                    {this.state.eyed ? <IcomoonIcon name='eye-open' size={15} color='#007afe' /> : <IcomoonIcon name='eye-closed' size={15} color='#007afe' />}
                                </MyButton>
                        </View>
                        <View style={styles.formInput}>
                            <TextInput
                                ref="login_psw"
                                style={styles.loginInput}
                                secureTextEntry={!this.state.confirm_eyed}
                                placeholder='再次输入密码'
                                placeholderTextColor='#999'
                                onChangeText={this.handleComfirPasswordChanged.bind(this)}
                                value={this.state.confirm_password} />
                                <MyButton style={styles.eyeButton} onPress={() => {
                                    this.setState({ confirm_eyed: !this.state.confirm_eyed });
                                }}>
                                    {this.state.confirm_eyed ? <IcomoonIcon name='eye-open' size={15} color='#007afe' /> : <IcomoonIcon name='eye-closed' size={15} color='#007afe' />}
                                </MyButton>
                        </View>
                    </View>
                    <View style={styles.operate}>
                        <MyButton style={styles.loginBtn} onPress={this.handleRegister.bind(this)}>
                            <Text style={styles.loginText}>确认</Text>
                        </MyButton>
                    </View>
                </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}
export default connect(ForgotPage.mapStateToProps)(withSafeAreaInsets(ForgotPage));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    register:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
    },
    registerText: {
        fontSize: 14,
    },
    registerBtn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40, 
    },
    registerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#D9D9D9'
    },
    scorllView: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    body: {
        minHeight: Common.window.height-45-Common.statusBarHeight,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    infoPart: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 221,
        marginTop: 70,
        marginBottom: 70,
    },
    topPartRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    topPartTitle: {
        fontSize:50,
        color: '#007afe',
        includeFontPadding: false
    },
    topPartName: {
        fontSize: 18,
        color: '#606266',
        lineHeight: 22
    },
    topPartNotice: {
        marginTop: 50,
        marginBottom: 50,
        height: 70,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topPartNoticeText: {
        fontSize: 12,
        paddingLeft: 10,
        paddingRight: 10,
        // color: '#DCDFE6',
        color: '#606266',
        lineHeight: 20,
        marginLeft: 2,
    },
    content: {
        paddingLeft: 25,
        paddingRight: 25,
        width: '100%',
        //   borderTopWidth: 1,
        //   borderTopColor: '#dfdfdf',
        //   borderBottomWidth: 1,
        //   borderBottomColor: '#dfdfdf',
    },
    forgot: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
    },
    forgotBtn:{
        paddingRight: 15,
        paddingLeft: 15,
    },
    forgotText: {
        fontSize: 12,
        color: '#007afe',
    },
    formInput: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        lineHeight: 50,
        paddingLeft: 10,
        color: '#333',
        fontSize: FontSize(16),
        // borderWidth: 1,
        borderRadius: 55,
        // borderColor: '#dfdfdf',
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: '#F2F6FC'
    },
    formInputSplit: {
        borderBottomWidth: 1,
        borderBottomColor: '#dfdfdf',
    },
    loginLabel: {
        fontSize: FontSize(16),
        color: '#333'
    },
    loginInput: {
        height: 40,
        paddingLeft: 15,
        flex: 1,
        fontSize: FontSize(16),
        color: '#333',
    },
    law: {
        width: Common.window.width-30,
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        // backgroundColor: '#fff000'
    },
    lawStr: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        textAlign: 'center',
        paddingTop: 4,
        // marginTop: 5,
    },
    argreeView: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    },
    lawText: {
        fontSize: 10,
        color: '#C0C4CC',
        marginTop: 5,
        marginLeft: -10,
    },
    lawText1: {
        fontSize: 10,
        color: '#007afe',
        textAlign: 'center',
    },
    lawText2: {
        fontSize: 10,
        color: '#C0C4CC',
    },
    operate: {
        width: '100%',
        paddingTop: 20,
        paddingLeft: 25,
        paddingRight: 25,
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
        paddingRight: 20,
        paddingBottom: 10,
    },
    loginBtn: {
        backgroundColor: '#007afe',
        padding: 10,
        alignItems: 'center',
        borderRadius: 30,
        marginTop: 5,
        marginBottom: 50,
    },
    loginText: {
        color: '#ffffff',
        fontSize: FontSize(16),
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
    },
    opt: {
        width: 120,
        height: 44,
        marginRight: 10,
        resizeMode: 'contain'
    }
});
