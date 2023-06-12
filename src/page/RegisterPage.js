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
    Alert,
    ScrollView,
    Animated
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
import { getVerifyPic } from '../actions/actionRequest';
const Toast = Overlay.Toast;
class RegisterPage extends Component {

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
            indetify: '',
            opt: '',
            imgBase64: '',
            inivate: '',
            editStep: 1,
            tabValue: 1,
            tabAniX: new Animated.ValueXY({x:-Common.window.width/4 + 15, y:0}),
        };
        logger('......RegisterPage Auth.user',props.user)
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
                if(this.props.user.type === 2) {
                    this.props.navigation.navigate('CustomMain');
                }
                else 
                    this.props.navigation.navigate('Main');
                return;
            }
            this.getVerifyPic();
        });
    }

    componentWillUnmount() {
        logger('......RegisterPage componentWillUnmount')
        this.nameListener && this.nameListener.remove();
       
    }

    getVerifyPic() {
        const { dispatch } = this.props;
        dispatch(actionAuth.reqGetVerifyPic((rs)=>{
            if(rs.image){
                this.setState({imgBase64: rs.image})
            }
        }));
    }

    
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
    // 登录
    handleLogin() {
        this.props.navigation.replace('Login');
    }
    handleRegister() {
            const { dispatch } = this.props;
            const { phone, name, password, confirm_password, autoLogin,  editStep, indetify, tabValue, inivate } = this.state;
            
            if (phone == null || phone.length <= 0) {
                Toast.show('手机号不能为空!');
                return;
            }

            if (phone.length !== 11) {
                Toast.show('请输入正确的手机号!');
                if(callback) callback(false);
                return;
            }
            
            if (tabValue==1 && (name == null || name.length <= 0)) {
                Toast.show('昵称不能为空!');
                return;
            }
            if (tabValue==2 && (inivate == null || inivate.length <= 0)) {
                Toast.show('邀请码不能为空!');
                return;
            }
            if (indetify == null || indetify.length <= 0) {
                Toast.show('手机验证码不能为空!');
                return;
            }
            if (password == null || password.length <= 0) {
                Toast.show('密码不能为空!');
                return;
            }
            if (confirm_password == null || confirm_password.length <= 0) {
                Toast.show('再次输入密码不能为空!');
                return;
            }
            if (autoLogin == false) {
                Toast.show('请勾选同意政策和服务协议');
                // Toast.show('请勾选同意政策和服务协议');
                return;
            }
            
            if(password != confirm_password) {
                Toast.show('两次密码输入不一致！');
                return;
            }
            if(tabValue==1) {
                dispatch(actionAuth.reqRegister(name, phone, password, indetify, (res, error) => {
                    logger(res)
                    if (error) {
                        Toast.show(error.info);   
                        this.getVerifyPic();        
                        this.setState({opt: '', indetify: ''});                 
                    } else if (res) {
                        Toast.show("完成注册,去登录！");
                        this.props.navigation.replace('Login');
                    }
                }));
            }
            else {
                dispatch(actionAuth.reqClientRegister(phone, password, indetify, inivate, (res, error) => {
                    logger(res)
                    if (error) {
                        Toast.show(error.info);  
                        this.getVerifyPic();      
                        this.setState({opt: '', indetify: ''});                     
                    } else if (res) {
                        Toast.show("完成注册,去登录！");
                        this.props.navigation.replace('Login', { type: 2 });
                    }
                }));
            }
    }

    goService() {
        this.props.navigation.navigate('Service');
    }

    goPrivacy() {
        this.props.navigation.navigate('Privacy');
    }

    send = (callback) => {
            const { dispatch } = this.props;
            const { phone, password, autoLogin,  editStep, opt, indetify } = this.state;
            if (phone == null || phone.length <= 0) {
                Toast.show('手机号不能为空!');
                if(callback) callback(false);
                return;
            }
            if (phone.length !== 11) {
                Toast.show('请输入正确的手机号!');
                if(callback) callback(false);
                return;
            }
            if (opt == null || opt.length <= 0) {
                Toast.show('图形验证码不能为空!');
                if(callback) callback(false);
                return;
            }

            if (autoLogin == false) {
                Toast.show('请勾选同意政策和服务协议');
                if(callback) callback(false);
                return;
            }
            dispatch(actionAuth.reqSendVerifySms(phone, opt, (res, error) => {
                logger(res)
                if (error) {
                    Toast.show(error.info);
                    this.getVerifyPic();        
                    this.setState({opt: '', indetify: ''});     
                    if(callback) callback(false);
                } 
                else {
                    this.setState({editStep: 2})
                    if(callback) callback(true);
                }
            }));
    }
    handleOptChanged(text) {
        this.setState({ opt: text });
    }
    changeTab = (value) => {
        const {tabAniX} = this.state;
        if(value === 2) {
            Animated.timing(tabAniX, {
                toValue: {x: Common.window.width/4 - 15, y:0},
                duration: 300,
                useNativeDriver: false,
              }).start();
        } 
        else {
            Animated.timing(tabAniX, {
                toValue: {x: -Common.window.width/4 + 15, y:0},
                duration: 300,
                useNativeDriver: false,
              }).start();
        }
        this.setState({tabValue: value});
    }
    handleInivateChanged(text) {
        this.setState({ inivate: text });
    }
    render() {
        const { editStep, tabValue, tabAniX } = this.state;
        const aniStyle = {
            transform: tabAniX.getTranslateTransform(),
        };

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" />
                <ScrollView style={styles.scorllView} alwaysBounceVertical={false}>
                <View style={styles.body}>
                    <View style={styles.top}>
                    <View style={styles.topPart}>
                        <Text style={styles.topPartTitle}>{'律时'}</Text>
                        <View style={styles.topPartRight}>
                            <Text style={styles.topPartName}>{'言语之间'}</Text>
                            <Text  style={styles.topPartName}>{'管理时间'}</Text>
                        </View>
                    </View>
                    </View>
                <View style={styles.info}>
                    <View style={styles.infoPart}>
                        <Text style={styles.topPartName}>{'使用手机号码注册律时账号'}</Text>
                        <View style={styles.register}>
                            <View style={[styles.registerLine,{marginRight: 10}]}></View>
                            <Text style={[styles.registerText, {color: '#606266'}]}>已有律时账号？</Text>
                            <MyButton style={styles.registerBtn} onPress={this.handleLogin.bind(this)}>
                                <Text style={[styles.registerText, {color: '#007afe'}]}>去登录</Text>
                            </MyButton>
                            <View style={[styles.registerLine, {marginLeft: 10}]}></View>
                        </View>
                    </View>
                </View>
                <View style={styles.content}>
                    <View style={[styles.tabSwitch]}>
                        <Animated.View style={[aniStyle, styles.tabSwitchItemSelect]}></Animated.View>
                        <View style={[styles.tabSwitchBody]}>
                            <MyButton style={[styles.tabSwitchItem]} onPress={()=>this.changeTab(1)}>
                                <Text style={[styles.tabSwitchText, { color: tabValue==1 ? '#ffffff': '#909399'}]}>个人/企业用户</Text>
                            </MyButton>
                            <MyButton style={[styles.tabSwitchItem]} onPress={()=>this.changeTab(2)}>
                                <Text style={[styles.tabSwitchText, { color: tabValue==2 ? '#ffffff': '#909399'}]}>企业客户</Text>
                            </MyButton>
                        </View>
                    </View>
                    <View style={[styles.formInput]}>
                        <TextInput
                            ref={(ref) => this.login_name = ref}
                            placeholder='手机号码'
                            placeholderTextColor='#999'
                            style={styles.loginInput}
                            onChangeText={this.handlePhoneChanged.bind(this)}
                            value={this.state.phone}
                            maxLength={11}
                            keyboardType={'numeric'}
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
                            <MyButton onPress={this.getVerifyPic.bind(this)}><Image style={styles.opt} source={{uri: this.state.imgBase64}} /></MyButton>
                    </View>
                    <View style={styles.formInput}>
                        <TextInput
                            ref={(ref) => this.login_identify = ref}
                            style={styles.loginInput}
                            placeholder='点击获取动态验证码'
                            placeholderTextColor='#999'
                            onChangeText={this.handleIndetifyChanged.bind(this)}
                            value={this.state.indetify} />
                            <SendIdentify time={90} action={(callback)=> this.send(callback)}/>
                    </View> 
                    { tabValue ===2 && editStep === 2 && <View style={styles.formInput}>
                        <TextInput
                            ref={(ref) => this.login_inivate = ref}
                            style={styles.loginInput}
                            placeholder='邀请码'
                            placeholderTextColor='#999'
                            onChangeText={this.handleInivateChanged.bind(this)}
                            value={this.state.inivate} />
                            {
                                this.state.inivate !== '' && this.state.inivate !== undefined && <MyButton style={styles.eyeButton} onPress={() => {
                                    this.setState({ inivate: '' });
                                }}>
                                    <AntDesign name='closecircleo' size={15} color='#C0C4CC' />
                                </MyButton>
                            }
                    </View> }
                    { tabValue ===1 && editStep === 2 && <View style={[styles.formInput]}>
                        <TextInput
                            ref={(ref) => this.login_name = ref}
                            placeholder='昵称'
                            placeholderTextColor='#999'
                            style={styles.loginInput}
                            onChangeText={this.handleNameChanged.bind(this)}
                            value={this.state.name}
                        />
                        {
                            this.state.name !== '' && this.state.name !== undefined && <MyButton style={styles.eyeButton} onPress={() => {
                                this.setState({ name: '' });
                            }}>
                                <AntDesign name='closecircleo' size={15} color='#C0C4CC' />
                            </MyButton>
                        }
                    </View> }
                    { editStep === 2 && <View style={styles.formInput}>
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
                    </View> }
                    { editStep === 2 && <View style={styles.formInput}>
                        <TextInput
                            ref="login_psw"
                            style={styles.loginInput}
                            secureTextEntry={!this.state.confirm_eyed}
                            placeholder='再次输入密码'
                            placeholderTextColor='#999'
                            onChangeText={this.handleComfirPasswordChanged.bind(this)}
                            value={this.state.confirm_password}/>
                            <MyButton style={styles.eyeButton} onPress={() => {
                                this.setState({ confirm_eyed: !this.state.confirm_eyed });
                            }}>
                                {this.state.confirm_eyed ? <IcomoonIcon name='eye-open' size={15} color='#007afe' /> : <IcomoonIcon name='eye-closed' size={15} color='#007afe' />}
                            </MyButton>
                    </View>
                    }
                </View>
                <View style={styles.operate}>
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
                            <Text style={styles.lawText}>已经阅读并同意</Text>
                        </TouchableOpacity>
                        <View style={styles.lawStr}><Text style={styles.lawText1} onPress={this.goPrivacy.bind(this)}>律时隐私保护指引</Text><Text style={styles.lawText2}>和</Text><Text style={styles.lawText1} onPress={this.goService.bind(this)}>律时用户服务协议</Text></View>
                    </View>
                    <MyButton disabled={this.state.editStep===1} style={styles.loginBtn} onPress={this.handleRegister.bind(this)}>
                        <Text style={styles.loginText}>注册</Text>
                    </MyButton>
                </View>
                </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}
export default connect(RegisterPage.mapStateToProps)(RegisterPage);

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
    },
    body: {
        width: '100%',
        minHeight:  Common.window.height - Common.statusBarHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    top: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    topPart: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 70,
    },
    topPartTitle: {
        fontSize:50,
        color: '#007afe',
        includeFontPadding: false
    },
    info: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 70,
        marginBottom: 70,
    },
    infoPart: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 221,
    },
    topPartRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    topPartName: {
        fontSize: 18,
        color: '#606266',
        lineHeight: 22
    },
    content: {
        width: '100%',
        paddingLeft: 25,
        paddingRight: 25,

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
        fontSize: FontSize(16),
        // borderWidth: 1,
        borderRadius: 55,
        // borderColor: '#dfdfdf',
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: '#F2F6FC'
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
        marginTop: 20,
        paddingLeft: 25,
        paddingRight: 25,
        flexDirection: 'column',
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
    },
    tabSwitch: {
        width: Common.window.width - 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        borderRadius: 55,
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: '#EBEEF5',
        position:'relative',
    },
    tabSwitchBody: {
        width: Common.window.width - 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderRadius: 40,
        position:'absolute',
        zIndex: 2,
        top: 5,
        left: 5,
    },
    tabSwitchItem: {
        width: Common.window.width /2 - 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderRadius: 40,
    },
    tabSwitchItemSelect: {
        width: Common.window.width /2 - 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        borderRadius: 40,
        position:'absolute',
        backgroundColor: '#007AFE',
        zIndex: 1,
    },
    tabSwitchText: {
        height: 40,
        lineHeight: 40,
        fontSize: 18,
    },
});
