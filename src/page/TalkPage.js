import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Overlay,
    NativeEventEmitter,
    AppState,
    PanResponder,
    TextInput,
    DeviceEventEmitter,
    TouchableHighlight,
    ActivityIndicator,
    Button,
    ScrollView,
    Image,
    Keyboard,
    ImageBackground,
    StatusBar,
    Modal,
    Alert,
    NativeModules,
} from 'react-native';
import {
    WebView
} from 'react-native-webview';
import { Recognizer } from 'react-native-speech-iflytek';
// import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from 'react-native-push-notification';
import { connect } from 'react-redux';
import authHelper from '../helpers/authHelper';
import MyModal from '../components/MyModal';
import Common from "../common/constants";
import GlobalData from "../utils/GlobalData";
import { showDrawerModal, DrawerModal, } from '../components/DrawerModal';
import { destroySibling, destroyAllSibling, showLoading, showModal, showRecoding, showPlanModal, showFinishModal } from '../components/ShowModal';
import MyFinishPlanSlider from '../components/MyFinishPlanSlider';
import MyPlanSlider from '../components/MyPlanSlider';
import actionProcess from '../actions/actionProcess';
import * as Storage from '../common/Storage';
import { getWeekXi } from '../utils/utils';
import IcomoonIcon from "../components/IcomoonIcon";
import MyButton from "../components/MyButton";
import actionCase from "../actions/actionCase";
import WebSocketClient from "../utils/WebSocketClient";
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from "react-native-gesture-bottom-sheet";
import MyFinishPlanSheet from "../components/MyFinishPlanSheet";
import moment from 'moment';
import platform from "../utils/platform";
import axios from "axios";

const { width: windowWidth, height: windowHeight } = Common.window;
const Toast = Overlay.Toast;
const distance = 50;
const globalData = GlobalData.getInstance();

var talkArr = [{ "type": 'xnr', 'content': '你好，我是小语，一起聊一聊吧' }];

class TalkPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        props.caseList = state.Case.caseList;
        props.finishList = state.Process.finishList;
        props.planList = state.Process.planList;
        return props;
    }

    constructor(props) {
        super(props);
        const item = props.navigation.getState().routes.find((text) =>
            text.name == "Main"
        )
        console.log("路由参数", item)
        // console.log("路由参数", props.navigation.getState().routes)
        this.state = {
            appState: AppState.currentState,
            webviewUrl: "https://www.kykyai.com/psychology/abstracPage/",
            index: 1,
            talkContent: '',
            isInput: false,//是否输入了内容
            input: '',//输入框的内容
            startBreathe: false,//深呼吸弹框
            isMic: true,
            goToSAS: false,//SAS弹框
            isShowMic: true,
            recordContent: '',//录音得到的内容,
            keyboardHeight: 0,
            isLoaded: false,
            keyboardDidShow: false,
            goToSCL: false,//SCL弹框
            talkState: 0,
            itemState: 0,
            reFlash: false,
            modalVisible: false//规则弹框
        }
        this.wv = React.createRef();
        if (platform.isAndroid()) {
            Recognizer.init("5f5835be");
        }
        else {
            this.RecognizerIos = NativeModules.SpeechRecognizerModule;
            this.RecognizerIos && this.RecognizerIos.init("5f5835be");
        }
        Recognizer.setParameter('vad_bos', '10000');
        Recognizer.setParameter('vad_eos', '10000');
    }
    componentDidMount() {

        //语音监听事件
        this.recognizerEventEmitter = new NativeEventEmitter(platform.isAndroid() ? Recognizer : this.RecognizerIos);
        this.recognizerEventEmitter.addListener('onRecognizerResult', this.onRecognizerResult);
        this.recognizerEventEmitter.addListener('onRecognizerError', this.onRecognizerError);

        //键盘
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        //监听状态改变事件
        AppState.addEventListener('change', this.handleAppStateChange);

    }

    confirmRules = () => {
        this.setState({ modalVisible: false })
        axios.post('https://xl.kykyai.cn/api/xinli_chat', { ask: "鼓励深呼吸练习" }, {
            headers: {
                'token': '123123123'
            }
        }).then(res => {

            talkArr.push({ "type": 'xnr', "content": res.data.text })
            this.setState({
                reFlash: true
            })
            console.log("&&&&&&&&&&&&&&&&", new Date())

            // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            // await sleep(1000)
            axios.post('https://xl.kykyai.cn/api/to_speak', { text: res.data.text }, {
                headers: {
                    'token': '123123123'
                }
            }).then(_res => {
                setTimeout(() => {
                    console.log(new Date())
                    if (res.data.state == 13) {
                        axios.post('https://xl.kykyai.cn/api/xinli_chat', { ask: "下面，请根据指示做一个缓解焦虑的深呼吸练习。" }, {
                            headers: {
                                'token': '123123123'
                            }
                        }).then(res => {

                            talkArr.push({ "type": 'xnr', "content": res.data.text })
                            this.setState({
                                reFlash: false
                            })
                            if (res.data.state == 14) {
                                setTimeout(() => {
                                    this.setState({ startBreathe: true }, () => {

                                    })
                                }, 3000)
                            }
                        })
                    }
                }, 7000)
            })
        })
    }

    componentWillUnmount() {
        //移除语音监听 
        this.recognizerEventEmitter.removeAllListeners('onRecognizerResult');
        this.recognizerEventEmitter.removeAllListeners('onRecognizerError');

        //移除键盘监听
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.wv && this.wv.current && this.wv.current.reload();
        }
        else if (this.state.appState === 'active' && nextAppState.match(/inactive|background/)) {

        }
        this.setState({ appState: nextAppState });
    };

    _keyboardDidShow(e) {
        // console.log(e)

        //显示最新一句话
        this.refs._scrollView.scrollToEnd()
        this.setState({
            keyboardHeight: e.endCoordinates.height,
            keyboardDidShow: true
        })
    }

    _keyboardDidHide(e) {
        this.setState({
            keyboardHeight: 0,
            keyboardDidShow: false
        })
    }
    async startRecordAndroid() {
        let isHasMic = await NativeModules.NotifyOpen.getRecordPermission();
        console.log(isHasMic)
        if (isHasMic == 0) {
            return;
        }
        else if (isHasMic == 1) {
            Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
                text: '取消',
                onPress: null,
            },
            {
                text: '去设置',
                onPress: () => { NativeModules.NotifyOpen && NativeModules.NotifyOpen.openPermission(); },
            },
            ]);
            return;
        }
        showRecoding();
        Recognizer.start();
    }
    startRecordIOS = () => {
        const isHasMic = NativeModules.OpenNoticeEmitter ? NativeModules.OpenNoticeEmitter.getRecordPermission() : 0;
        if (isHasMic == 0) {
            return;
        }
        else if (isHasMic == 1) {
            Alert.alert('未授权', `访问权限没有开启，请前往设置去开启。`, [{
                text: '取消',
                onPress: null,
            },
            {
                text: '去设置',
                onPress: () => { NativeModules.OpenNoticeEmitter && NativeModules.OpenNoticeEmitter.openSetting(); },
            },
            ]);
            return;
        }
        this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("startRecording");true;');
        showRecoding();
        this.RecognizerIos && this.RecognizerIos.start();
    }
    stopRecord = () => {
        if (platform.isAndroid()) {
            Recognizer.isListening().then(value => {
                console.log('stopRecord..........' + value)
                if (value) {
                    Recognizer.stop();
                }
                destroySibling();
                this.setState({ recordContent: value })
                // that.setState({isRecoding: false});
            });
        }
        else {
            this.RecognizerIos.isListening().then(value => {
                if (value) {
                    this.RecognizerIos.stop();
                }
                this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("stopRecording");true;');
                destroySibling();
                this.setState({ recordContent: value })
                // that.setState({isRecoding: false});
            });
            let cate = NativeModules.OpenNoticeEmitter.getCategory();
            let mode = NativeModules.OpenNoticeEmitter.getMode();
            console.log('.........cate==' + cate, mode)
        }
    }

    handleFinishTime = (item) => {
        console.log(item)
        Recognizer.start();
    }
    handleFinishTimeEnd = () => {
        Recognizer.isListening().then(value => {
            console.log('stopRecord..........' + value)
            if (value) {
                Recognizer.stop();
            }
        });
    }

    onRecognizerResult = (e) => {
        const { index } = this.state
        if (!e.isLast) {
            return;
        }
        if (e.result == '') {
            Toast.show('不好意思，没听清楚');
            return;
        }
        console.log("*********************结果", e.result, index);
        this.sendMessage(e.result);
    }

    onRecognizerError = (result) => {
        if (result.errorCode !== 0) {
            // alert(JSON.stringify(result));
        }
    }

    closeTalk = () => {
        this.setState({ startBreathe: false, goToSAS: false, showRule: false, goToSCL: false });
    }

    goToBreathe = () => {
        this.setState({ startBreathe: false });
        this.props.navigation.replace('Breathe', { webviewURL: 'https://www.kykyai.com/psychology/breathePage/' })
        talkArr.push({ "type": 'tip', "content": '——已完成深呼吸训练——' })
    }

    goToSAS = () => {
        this.setState({ goToSAS: false });
        this.props.navigation.replace('Breathe', { webviewURL: 'https://www.kykyai.com/psychology/sasform/' })
        talkArr.push({ "type": 'tip', "content": '——已完成SAS量表——' })
    }

    goToSCL = () => {
        this.setState({ goToSCL: false });
        this.props.navigation.replace('Breathe', { webviewURL: 'https://www.kykyai.com/psychology/SCLform/' })
        talkArr.push({ "type": 'tip', "content": '——已完成SCL量表——' })
    }

    sendMessage = (Content) => {
        const _this = this
        var lastContent = ""
        this.setState({ isInput: false })
        talkArr.push({ "type": 'me', "content": Content })
        this.setState({ input: '' })

        axios({
            method: 'post',
            url: 'https://lawyer-api-test.kykyai.cn/api/stream_chat',
            responseType: 'stream',
            data: {
                "ask": Content,
            },
            headers: {
                "token": 'lkas_ky_20230509'
            }
        })
            .then(response => {
                console.log("*********************", response)
                talkArr.push({ "type": 'xnr', "content": response.data })
                _this.setState({ reFlash: !_this.state.reFlash })
                // response.data.on('data', (chunk) => {
                //     // 处理流数据的逻辑
                //     console.log("*********************", chunk)
                // });

                // response.data.on('end', () => {
                //     // 数据接收完成的逻辑
                //     console.log("+++++++++++++++++", "end")
                // });

                // response.data.pipe(writer);

            });

        // fetch('https://lawyer-api-test.kykyai.cn/api/stream_chat',

        //     {
        //         reactNative: { textStreaming: true },
        //         method: "POST",
        //         headers: { "Content-Type": "application/json", "token": 'lkas_ky_20230509' },
        //         body: { "ask": Content },
        //     },
        // )
        //     .then(response => console.log("+++++++++++++++++++response", response))
        //     .then(stream => console.log("////////////////stream", stream))


        // fetch('https://lawyer-api-test.kykyai.cn/api/stream_chat', {
        //     method: "POST", // *GET, POST, PUT, DELETE, etc.
        //     // mode: "cors", // no-cors, *cors, same-origin
        //     // cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        //     // credentials: "same-origin", // include, *same-origin, omit
        //     headers: {
        //         "Content-Type": "application/json",
        //         "token": 'lkas_ky_20230509'
        //         // 'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        //     redirect: "follow", // manual, *follow, error
        //     // referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        //     body: JSON.stringify({ "ask": Content }), // body data type must match "Content-Type" header
        // })
        //     .then(response => {
        //         console.log("+++++++++++++++++++", response)
        //         const reader = response.body.getReader();
        //         console.log("////////////////////", reader)
        //         const decoder = new TextDecoder();

        //         function processChunk(chunk) {
        //             let data = decoder.decode(chunk);
        //             console.log("***********************", data)
        //             // console.log(data)
        //             if (!lastContent) {
        //                 lastContent = data
        //             } else {
        //                 lastContent = lastContent + data
        //                 talkArr.pop()
        //             }
        //             talkArr.push({ "type": 'xnr', "content": lastContent })
        //             _this.setState({ reFlash: !_this.state.reFlash })
        //         }

        //         function processDone() {
        //             console.log("done")
        //         }

        //         return reader.read().then(function readChunk({ done, value }) {
        //             if (done) {
        //                 processDone(value);
        //                 return;
        //             }
        //             processChunk(value);
        //             return reader.read().then(readChunk);
        //         });
        //     }).catch(error => {
        //         console.log("+++++++++++++++++++error", error)
        //     });
    }

    backToHome = () => {
        // this.props.navigation.replace('Home')
        console.log("返回")
    }

    chat = () => {
        this.setState({ index: 1 })
        talkArr.splice(0, talkArr.length)
        Toast.show('进入聊天模式');
        this.changeBackground("dark")
        talkArr.push({ "type": 'xnr', "content": "你好，我是小语，一起聊一聊吧" })
        this.setState({ reFlash: !this.state.reFlash })
    }

    consult = () => {
        this.setState({ index: 2 })
        talkArr.splice(0, talkArr.length)
        Toast.show('进入咨询模式');
        this.changeBackground("light")
        axios.post('https://xl.kykyai.cn/api/xinli_chat', { ask: "你好。" }, {
            headers: {
                'token': '123123123'
            }
        }).then(res => {
            talkArr.push({ "type": 'xnr', "content": res.data.text })
            this.setState({ reFlash: !this.state.reFlash })
        })

    }

    handleInput(text) {
        this.setState({ input: text }, () => {
            if (!this.state.input) {
                this.setState({ isInput: false })
            }
        });
    }

    changeBackground = (color) => {
        axios.post('https://xl.kykyai.cn/api/changebg', { id: color }, {
        }).then(res => {
            console.log(res)
        });
    }

    closeLoading = () => {
        this.setState({
            isLoaded: true
        })
    }

    render() {
        const { webviewUrl, index, talkContent, isInput, startBreathe, isMic, goToSAS, isShowMic, recordContent, isLoaded, keyboardDidShow, goToSCL, modalVisible, input } = this.state;
        const STATUS_BAR_HEIGHT = platform.isIOS() ? globalData.getTop() : Common.statusBarHeight;
        return (
            <View style={styles.container}>
                {/* {
                    modalVisible &&
                    <View style={styles.maskStyle}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                {rulesArr.map((text, index) => (
                                    <View key={index} style={[styles.talkStyle]}>
                                        <Text style={(index == 0 || index == 5 || index == 10) ? { fontWeight: "bold", color: "#000", fontSize: 16 } : { fontSize: 16 }}>{text}</Text>
                                    </View>
                                ))}

                                <TouchableHighlight
                                    style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                                    onPress={() => { this.confirmRules() }}
                                >
                                    <Text style={styles.textStyle}>确定</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                } */}
                <StatusBar translucent={true} barStyle="light-content" backgroundColor="transparent" />

                <WebView
                    nativeConfig={{ props: { webContentsDebuggingEnabled: true } }}
                    ref={this.wv}
                    source={{ uri: webviewUrl }}
                    scalesPageToFit={false}
                    bounces={false}
                    style={{ width: windowWidth, height: windowHeight }}
                    javaScriptEnabled={true}
                    // injectedJavaScript={this.INJECTEDJAVASCRIPT}
                    // onMessage={(event) => { this.handleNativeMessage() }}
                    mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
                    userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
                    incognito={true}
                    onLoadEnd={this.closeLoading.bind(this)}
                    allowsInlineMediaPlayback={true}
                />

                {
                    isLoaded &&
                    <ImageBackground source={{ uri: "https://21-pub-dev.oss-cn-hangzhou.aliyuncs.com/psychology/images/talkBg.png" }} style={styles.contentView}>
                        <View style={styles.topMenu}>
                            {/* 首页 */}
                            <MyButton style={styles.menuBtnView} onPress={() => this.backToHome()}>
                                {/* <IcomoonIcon name='info' size={30} style={{ color: '#fff' }} /> */}
                                <Image style={{ width: 45, height: 45 }} source={{ uri: 'https://21-pub-dev.oss-cn-hangzhou.aliyuncs.com/psychology/images/kyLOGO.png' }} />
                            </MyButton>

                        </View>

                        <ScrollView
                            ref='_scrollView'
                            onContentSizeChange={() => { this.refs._scrollView.scrollToEnd() }}
                            style={[styles.talkContent, { marginTop: windowHeight * 0.3 }, keyboardDidShow && { marginTop: windowHeight * 0.2, marginBottom: 5 }]}>
                            {talkArr.map((text, index) => (
                                <View key={index} style={[styles.talkStyle,
                                text.type === 'me' ? { alignItems: 'flex-end', paddingTop: 10 } : { paddingTop: 10 }
                                ]}>
                                    {
                                        text.type === 'xnr' && <View style={{ borderRadius: 20, backgroundColor: 'rgba(0, 122, 254, 1)' }}><Text style={styles.xnrTalk}>{text.content}</Text></View>
                                    }
                                    {
                                        text.type === 'me' && <View style={{ borderRadius: 20, backgroundColor: 'rgba(233, 233, 235, 1)' }}><Text style={styles.meTalk}>{text.content}</Text></View>
                                    }
                                    {
                                        text.type === 'tip' && <Text style={{ width: windowWidth, marginLeft: -20, textAlign: "center", color: "rgba(0, 0, 0,1)" }}>{text.content}</Text>
                                    }
                                </View>

                            ))}
                        </ScrollView>

                        {
                            !isMic &&
                            <View style={[styles.bottom, keyboardDidShow && { marginBottom: 80 + this.state.keyboardHeight }]}>
                                <TextInput
                                    style={{ height: 60, width: windowWidth * 0.9 - 100, marginLeft: 20, fontSize: 20 }}
                                    onChange={() => { this.setState({ isInput: true }) }}
                                    placeholder="请输入内容"
                                    placeholderTextColor={'#b3b3b3'}
                                    value={this.state.input}
                                    onChangeText={newText => this.handleInput(newText)}
                                />

                                {!isInput && <MyButton style={styles.keyboardStyle} onPress={() => { this.setState({ isMic: true }) }}>
                                    <Image style={{ width: 50, height: 50 }} source={{ uri: 'https://21-pub-dev.oss-cn-hangzhou.aliyuncs.com/psychology/images/microphone-00.png' }} />
                                </MyButton>}

                                {isInput && <MyButton style={styles.keyboardStyle} onPress={() => { this.sendMessage(this.state.input) }}>
                                    <Image style={{ width: 50, height: 50 }} source={{ uri: 'https://21-pub-dev.oss-cn-hangzhou.aliyuncs.com/psychology/images/input.png' }} />
                                </MyButton>}
                            </View>
                        }

                        {
                            isMic &&
                            <View style={styles.bottom}>
                                <Text style={[styles.micStyle, { height: 60 }]} onLongPress={platform.isIOS() ? this.startRecordIOS : this.startRecordAndroid} onPressOut={this.stopRecord}>
                                    {recordContent}
                                </Text>

                                {isShowMic && < Image style={{ width: 30, height: 30, marginLeft: -windowWidth * 0.6 }} source={{ uri: 'https://21-pub-dev.oss-cn-hangzhou.aliyuncs.com/psychology/images/microphone-01.png' }} />}

                                <MyButton style={styles.keyboardStyle} onPress={() => { this.setState({ isMic: false }) }}>
                                    <Image style={{ width: 50, height: 50 }} source={{ uri: 'https://21-pub-dev.oss-cn-hangzhou.aliyuncs.com/psychology/images/keyboard.png' }} />
                                </MyButton>
                            </View>
                        }
                    </ImageBackground >
                }
            </View >
        )
    }
}

const STATUS_BAR_HEIGHT = platform.isIOS() ? globalData.getTop() : Common.statusBarHeight;
const styles = StyleSheet.create({
    container: {
        height: windowHeight + STATUS_BAR_HEIGHT,
        width: windowWidth,
    },
    contentView: {
        position: 'absolute',
        height: "100%",
        width: windowWidth,
        // top:  windowHeight/4,
        top: 20,
        // left:  windowWidth/4,
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        resizeMode: "cover",
    },
    topMenu: {
        width: windowWidth,
        // height: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 40,
    },
    menuBtnView: {
        // width: 60,
        // height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        // backgroundColor: "rgba(0, 0, 0, 0.20)",
        borderRadius: 20,
    },
    top: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 23,
        // height: 40,
        // width: 170,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    topBtn: {
        height: 40,
        width: 70,
        // backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        borderRadius: 18,
        margin: 5,
        fontSize: 20,
        lineHeight: 40,
        textAlign: "center",
        color: "rgba(255, 255, 255, 0.50)"
    },
    topBtnText: {
        fontSize: 20,
        lineHeight: 40,
        textAlign: "center",
        color: "rgba(255, 255, 255, 0.50)"
    },
    topBtnClicked: {
        backgroundColor: 'rgba(0, 0, 0, 0.20)',
        color: "#fff",
        borderRadius: 18
    },
    talkContent: {
        width: windowWidth,
        marginBottom: 20,
        padding: 20,
    },
    talkStyle: {
        display: 'flex',
        alignItems: 'flex-start',
        // paddingLeft: 20,
        paddingTop: 5,
        width: "100%",
        marginBottom: 20,
        marginTop: -10

    },
    xnrTalk: {
        color: "rgba(233, 233, 235, 1)",
        // marginTop: -10,
        fontSize: 17,
        lineHeight: 30,
        paddingBottom: 4,
        paddingTop: 4,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 20,
        maxWidth: '90%'
    },
    meTalk: {
        color: "rgba(0, 0, 0, 1)",
        // marginTop: -10,
        fontSize: 17,
        lineHeight: 30,
        paddingBottom: 4,
        paddingTop: 4,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 20,
        // marginLeft: 0,
        maxWidth: '90%'
    },
    bottom: {
        backgroundColor: 'rgba(255, 255, 255, 0.80)',
        borderRadius: 40,
        marginBottom: 80,
        width: windowWidth * 0.9,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        // padding: 10
    },
    keyboardStyle: {
        width: 60,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 50,
    },
    micStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        // textAlign: 'center',
        backgroundColor: "rgba(217, 217, 217, 0)",
        borderRadius: 50,
        width: windowWidth * 0.9 - 80,
        zIndex: 2,
        fontSize: 20,
        color: '#b3b3b3',
        padding: 20
    },
    bottomBtnClicked: {
        backgroundColor: 'rgba(0, 0, 0, 0.20)',
        color: "#fff"
    },

    maskStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.60)',
        position: "absolute",
        width: windowWidth,
        left: 0,
        top: 0,
        zIndex: 9999,
        height: windowHeight + STATUS_BAR_HEIGHT
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        // alignItems: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    clickContent: {
        display: 'flex',
        flexDirection: "row",
        justifyContent: 'space-around',
        width: '100%'
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        // elevation: 2,
        marginTop: 20,
        width: '25%',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
});
export default connect(TalkPage.mapStateToProps)(TalkPage);
