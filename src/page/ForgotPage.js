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
            phone: '',
            password: '',
            confirm_password: '',
            eyed: false,
            confirm_eyed: false,
            code: 0,
            indetify: '',
            opt: '',
            imgBase64: '',
            editStep: 1,
        };
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

    getVerifyPic() {
        const { dispatch } = this.props;
        dispatch(actionAuth.reqGetVerifyPic((rs)=>{
            if(rs.image){
                this.setState({imgBase64: rs.image})
            }
        }));
    }

    componentWillUnmount() {
        logger('......ForgotPage componentWillUnmount')
        this.nameListener && this.nameListener.remove();
       
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
    handleSubmit() {
        InteractionManager.runAfterInteractions(() => {
            const { dispatch } = this.props;
            const { phone, password, confirm_password, indetify } = this.state;
            
            if (phone == null || phone.length <= 0) {
                Toast.show('手机号不能为空!');
                return;
            }

            if (phone.length !== 11) {
                Toast.show('请输入正确的手机号!');
                if(callback) callback(false);
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
            
            if(password != confirm_password) {
                Toast.show('两次密码输入不一致！');
                return;
            }
            dispatch(actionAuth.reqRegister(name, phone, password, indetify, (res, error) => {
                logger(res)
                if (error) {
                    Toast.show(error.info);                      
                } else if (res) {
                    Toast.show("修改完成,去登录！");
                    this.props.navigation.replace('Login');
                }
            }));
        });
    }

    send = (callback) => {
        InteractionManager.runAfterInteractions(() => {
            const { dispatch } = this.props;
            const { phone, password, opt } = this.state;
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

            dispatch(actionAuth.reqSendVerifySms(phone, opt, (res, error) => {
                logger(res)
                if (error) {
                    Toast.show(error.info);
                    if(callback) callback(false);
                } 
                else {
                    this.setState({editStep: 2})
                    if(callback) callback(true);
                }
            }));
        });
    }
    render() {
        const { editStep } = this.state;
        return (
            <SafeAreaView style={styles.container}>
                {/* <StatusBar translucent={true}  backgroundColor='transparent' barStyle="dark-content" /> */}
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
                                <MyButton onPress={this.getVerifyPic.bind(this)}><Image style={styles.opt} source={{uri: this.state.imgBase64}}/></MyButton>
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
                                value={this.state.confirm_password} />
                                <MyButton style={styles.eyeButton} onPress={() => {
                                    this.setState({ confirm_eyed: !this.state.confirm_eyed });
                                }}>
                                    {this.state.confirm_eyed ? <IcomoonIcon name='eye-open' size={15} color='#007afe' /> : <IcomoonIcon name='eye-closed' size={15} color='#007afe' />}
                                </MyButton>
                        </View>}
                    </View>
                    <View style={styles.operate}>
                        <MyButton style={styles.loginBtn} onPress={this.handleSubmit.bind(this)}>
                            <Text style={styles.loginText}>确认</Text>
                        </MyButton>
                    </View>
                </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}
export default connect(ForgotPage.mapStateToProps)(ForgotPage);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
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
    topPartName: {
        fontSize: 18,
        color: '#606266',
        lineHeight: 22
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
    operate: {
        width: '100%',
        paddingTop: 20,
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
    opt: {
        width: 120,
        height: 44,
        marginRight: 10,
        resizeMode: 'contain'
    }
});
