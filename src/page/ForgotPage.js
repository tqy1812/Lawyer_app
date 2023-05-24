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
                                <Image style={styles.opt} source={{uri: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAjCAIAAADQT1mxAAAK50lEQVR4nN2aa1hU1RrH/zMDDM1wcUAugYKo5Q1FJETNTIEMzYcwUCDoqIdJ9BQJ5PV4AlHLS+cgQho8'+
                                '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'}}/>
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
