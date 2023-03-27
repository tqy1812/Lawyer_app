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
import { logger } from '../utils/utils';
const Toast = Overlay.Toast;
class LoginPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
            phone: '',
            password: '',
            eyed: false,
            autoLogin: false,
            lastId: 1,
            code: 0
        };
        this.globalData = GlobalData.getInstance();
        this.nameListener = Keyboard.addListener('keyboardDidHide', this.nameForceLoseFocus);
        // this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    nameForceLoseFocus = () => {
        this.login_name && this.login_name.blur();
    }

    componentDidMount() {
        if (platform.isIOS()) {
            NativeModules.SplashScreen && NativeModules.SplashScreen.close();
        }
        else{
            // logger('ddddd',NativeModules.SplashScreen)
            NativeModules.SplashScreen && NativeModules.SplashScreen.hide();
            NativeModules.ScreenAdaptation.getHeight().then((height) => {
                logger('height:'+ height/PixelRatio.get()+ '    h:'+Common.window.height);
                if(height){
                    this.globalData.setScreenHeight(height/PixelRatio.get())
                }
            })
            .catch((err) => {
                logger('err:', err);
            });
        }
        InteractionManager.runAfterInteractions(() => {
            const { dispatch, isLogin, navigation, insets } = this.props;
            // logger("isLogin" + isLogin, insets.top)
            this.globalData.setTop(insets.top);
            // logger("isLogin" + isLogin, this.globalData.getTop())
            if (isLogin) {
                this.props.navigation.navigate('Main');
                return;
                // dispatch(actionAuth.reqLogout(() => {
                // }));
            }
            this.autoLoginAction();
            this.viewDidAppear = this.props.navigation.addListener(
                'willFocus',
                (obj) => {
                    this.autoLoginAction();
                }
            )
            PushNotification.createChannel(
                {
                    channelId: 'NEW_MESSAGE_NOTIFICATION', // (required)
                    channelName: `任务通知`, // (required)
                    channelDescription: "任务提醒通知", // (optional) default: undefined.
                    soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
                    importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
                    vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
                },
                (created) => logger(`createChannel '任务通知' returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
            );
        });
    }

    componentWillUnmount() {
        logger('......LoginPage componentWillUnmount')
        if (typeof this.viewDidAppear != 'undefined' && typeof this.viewDidAppear.remove != 'undefined' && this.viewDidAppear.remove instanceof Function)
            this.viewDidAppear && this.viewDidAppear.remove();
        this.nameListener && this.nameListener.remove();
        // this.backHandler && this.backHandler.remove();
    }

    async autoLoginAction() {
        let savedUser = {};
        let user = await Storage.getUserRecord();
        logger("user" + user)
        if (user) {
            savedUser = Object.assign({}, JSON.parse(user));
            if (savedUser.phone && savedUser.password) {
                this.setState({ phone: savedUser.phone, password: savedUser.password });
            }
        }
        let autoLogin = await Storage.getAutoLogin();
        logger("autoLogin" + autoLogin)
        if (autoLogin === '1') {
            this.setState({autoLogin: true});
            if (savedUser.phone && savedUser.password) {
                const that = this;
                requestAnimationFrame(() => that.handleLogin());
            }
        }
    }

    // 用户名改变
    handlePhoneChanged(text) {
        let name = text.trim();
        this.setState({ phone: name });
    }

    // 密码改变
    handlePasswordChanged(text) {
        this.setState({ password: text });
    }

    // 登录
    handleLogin() {
        InteractionManager.runAfterInteractions(() => {
            const { dispatch } = this.props;
            const { phone, password, autoLogin } = this.state;
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
            dispatch(actionAuth.reqLogin(phone, password, (res, error) => {
                logger(res)
                if (error) {
                    logger(error)
                    //   Toast.show(this.validateToastXSS(error.toString()));
                    if (error.code === 17004) {
                        this.setState({ code: 2 });
                    }
                    else if (error.code === 17003) {
                        this.setState({ code: 1 });
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

    test = () => {
        PushNotification.localNotification({
            channelId: 'NEW_MESSAGE_NOTIFICATION',
            title: "任务提醒-",
            message: "test",
            id: this.state.lastId,
        });
        this.setState({ lastId: (this.state.lastId + 1) });
    }

    //   backAction = () => {
    //     return false;
    //   };


    render() {
        let logo = '/logo.png';
        const { insets } = this.props;

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
                 <View style={styles.topPart}>
                    <Text
                        style={styles.topPartTitle}>{'律时'}</Text>
                    <Text
                        style={styles.topPartName}>{'言语之间，管理时间'}</Text>
                    {
                        this.state.code === 1 ?
                            (<View style={styles.topPartNotice}>
                                <IcomoonIcon name='warning' size={22} style={{ color: 'rgb(254, 149, 0)', marginBottom: 10 }} />
                                <Text style={styles.topPartNoticeText}>{'请确认输入了正确的账号'}</Text>
                            </View>) :
                            this.state.code === 2 ?
                                (<View style={styles.topPartNotice}>
                                    <IcomoonIcon name='error' size={22} style={{ color: 'rgb(254, 61, 47)', marginBottom: 10 }} />
                                    <Text style={styles.topPartNoticeText}>{'请确认输入了正确的密码'}</Text>
                                    <Text style={styles.topPartNoticeText}>{'您可以通过联系管理员确认'}</Text>
                                </View>) :
                                (<View style={styles.topPartNotice}>
                                    <IcomoonIcon name='info' size={22} style={{ color: 'rgb(0, 122, 254)', marginBottom: 10 }} />
                                    <Text style={styles.topPartNoticeText}>{'登陆前请确认已使用权限'}</Text>
                                    <Text style={styles.topPartNoticeText}>{'并由管理员处获得账号与密码'}</Text>
                                </View>)
                    }
                    {/* <View style={styles.topPartNotice}> */}
                    {/* <Ionicons name='alert-circle' size={22} color='#FE9500' style={{marginBottom: 10}}/>
                        <Text
                            style={styles.topPartNoticeText}>{'请确认输入了正确的密码'}</Text>
                        <Text
                            style={styles.topPartNoticeText}>{'您可以通过联系管理员确认'}</Text> */}
                    {/* <Ionicons name='close-circle' size={22} color='#FE3D2F' style={{marginBottom: 10}}/>
                        <Text
                            style={styles.topPartNoticeText}>{'请确认输入了正确的账号'}</Text> */}

                    {/* <Text name='info' size={22}  style={{width: 20, height: 20, marginBottom: 10}}>{'\ue909'}</Text> */}
                    {/* <IcomoonIcon name='info' size={22} color={'#ff0000'} />
                           <Text style={styles.topPartNoticeText}>{'登陆前请确认已使用权限'}</Text>
                        <Text
                            style={styles.topPartNoticeText}>{'并由管理员处获得账号与密码'}</Text>
                        </View> */}

                </View>
                <View style={styles.content}>
                    <View style={[styles.formInput]}>
                        {/* <Text style={styles.loginLabel}>用户名</Text> */}
                        <TextInput
                            ref={(ref) => this.login_name = ref}
                            placeholder='轻触此处输入账号'
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
                        {/* <Text style={styles.loginLabel}>密&nbsp;&nbsp;&nbsp;&nbsp;码</Text> */}
                        <TextInput
                            ref="login_psw"
                            style={styles.loginInput}
                            secureTextEntry={!this.state.eyed}
                            placeholder='轻触此处密码'
                            placeholderTextColor='#999'
                            onChangeText={this.handlePasswordChanged.bind(this)}
                            value={this.state.password} />
                        <MyButton style={styles.eyeButton} onPress={() => {
                            this.setState({ eyed: !this.state.eyed });
                        }}>
                            {this.state.eyed ? <IcomoonIcon name='eye-open' size={15} color='#007afe' /> : <IcomoonIcon name='eye-closed' size={15} color='#007afe' />}
                        </MyButton>
                    </View>
                </View>
                <View style={styles.operate}>
                    {/* <View style={styles.auto}>
                            <CheckBox
                                title='自动登录'
                                textStyle={{color: '#007afe'}}
                                checked={this.state.autoLogin}
                                checkedColor='#d81e36'
                                uncheckedColor='#999'
                                containerStyle={styles.checkBoxStyle}
                                onPress={() => this.setState({autoLogin: !this.state.autoLogin})}
                            />
                        </View> */}
                    <View style={styles.law}>
                        <TouchableOpacity style={styles.argreeView}
                            onPress={() => this.setState({ autoLogin: !this.state.autoLogin })}>
                            <CheckBox
                                title={null}
                                checked={this.state.autoLogin}
                                checkedIcon='dot-circle-o'
                                uncheckedIcon='circle-o'
                                size={15}
                                checkedColor='#007afe'
                                uncheckedColor='#C0C4CC'
                                containerStyle={styles.lawCheck}
                                onPress={() => this.setState({ autoLogin: !this.state.autoLogin })}
                            />
                            <Text style={styles.lawText}>我已经阅读并同意 </Text>
                        </TouchableOpacity>
                        <View style={styles.lawStr}><Text style={styles.lawText1} onPress={this.goPrivacy.bind(this)}>《律时隐私保护指引》</Text><Text style={styles.lawText2}> 和 </Text><Text style={styles.lawText1} onPress={this.goService.bind(this)}>《律时用户服务协议》</Text></View>
                    </View>
                    <MyButton style={styles.loginBtn} onPress={this.handleLogin.bind(this)}>
                        <Text style={styles.loginText}>登录</Text>
                    </MyButton>
                    {/* <View style={styles.updatePsdWrap}>
                          <View style={{alignItems: 'flex-end', flexDirection: 'row'}}>
                          <MyButton onPress={() => this.props.navigation.navigate('UpdatePassword')}>
                              <Text style={styles.updatePsd}>修改密码</Text>
                          </MyButton>
                          </View>
                        </View> */}
                </View>

            </SafeAreaView>
        )
    }
}
export default connect(LoginPage.mapStateToProps)(withSafeAreaInsets(LoginPage));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    topPart: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        width: 100,
        height: 100
    },
    topPartTitle: {
        alignItems: 'center',
        fontSize:69,
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
        marginLeft: -5,
        // marginTop: 5,
    },
    argreeView: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50
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
        marginTop: 5,
    },
    lawText2: {
        fontSize: 10,
        color: '#C0C4CC',
        marginTop: 5,
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
        paddingRight: 20,
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
