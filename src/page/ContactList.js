import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    Overlay,
    StatusBar,
    Platform,
    ImageBackground,
    InteractionManager,
    ActivityIndicator,
    Keyboard,
    TouchableOpacity,
    NativeModules
} from 'react-native';
import Header from '../components/Header';
import { connect } from 'react-redux';
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
import actionChat from '../actions/actionChat';
import { caseSetting, logger } from '../utils/utils';
import SearchBar from '../components/contact-component/SearchBar';
import ContactList from '../components/contact-component/ContactList';
const Toast = Overlay.Toast;
const { width: windowWidth, height: windowHeight } = Common.window;
import FeatherIcons from 'react-native-vector-icons/Feather';
import { FontSize } from '../utils/utils'
const { StatusBarManager } = NativeModules;

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

class ReportPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        props.userInfo = state.Auth.userInfo;
        props.chatMessageList = state.Chat.chatMessageList;
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            contactsList: [
                // { name: '【法律大模型名称】', recentNews: '最近的信息', id: 100, isFixed: 1, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/images/lawyer_logo.png", date: "09:51" },
                // { name: '张三', recentNews: '最近天气怎么样？', id: 1, isFixed: 1, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: '最近天气怎么样？', id: 1, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '明天吧', id: 2, isFixed:0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: 'OK', id: 3, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '0987654321', id: 4, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: '886', id: 5, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '123', id: 6, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: '1234567890', id: 7, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '0987654321', id: 8, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: '1234567890', id: 9, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '0987654321', id: 10, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: '1234567890', id: 11, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '0987654321', id: 12, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: '1234567890', id: 13, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '0987654321', id: 14, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: '1234567890', id: 15, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '0987654321', id: 16, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '张三', recentNews: '1234567890', id: 17, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
                // { name: '李四', recentNews: '0987654321', id: 18, isFixed: 0, avatar: "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/avatar/93fdf849-cd9e-4c7c-880a-68193e9ad75c.jpg", date: "09:51" },
            ],
            type: props.user.type ? props.user.type : 1,
            hasMore: true,
            isSearch: false,
            keywords: ""
        };
    }

    componentDidMount() {
        if (!this.props.isLogin) {
            this.props.navigation.navigate('Login');
        }
        // this.search(1, 10, "", (rs) => {
        //     logger(rs);
        //     this.setState({
        //         hasMore: rs.data.page * rs.data.per_page < rs.data.total
        //     })
        // });
        if (this.state.type === 2) {
            this.props.dispatch(actionChat.getLawEmployeeList(law => {
                let data = [];
                if(law) {
                    for (let i = 0; i < law.length; i++) {
                        //拿到名字后再赋值
                        let obj = {
                            name: law[i].name,
                            recentNews: "最近天气怎么样？",
                            id: law[i].id,
                            isFixed: false,
                            avatar: law[i].avatar ? law[i].avatar : "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/images/init_avatar.png",
                            date: "09:23",
                            type: 'law',
                            url: law[i].url,
                            method: law[i].method,
                            params: law[i].params,
                            headers: law[i].headers,
                        };
                        data.push(obj);
                    }; 
                }
                this.props.dispatch(actionChat.getConversableEmployeeList(1, 10, "", (rs) => {
                    for (let i = 0; i < rs.data.length; i++) {
                        //拿到名字后再赋值
                        let obj = {
                            name: rs.data[i].name,
                            recentNews: "最近天气怎么样？",
                            id: rs.data[i].id,
                            isFixed: false,
                            avatar: rs.data[i].avatar ? rs.data[i].avatar : "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/images/init_avatar.png",
                            date: "09:23"
                        };
                        data.push(obj);
                    };

                    this.setState({
                        contactsList: data
                    })

                    if (rs && rs.data && rs.data.length > 0) {
                        this.setState({ hasMore: rs.page * rs.per_page < rs.total })
                    }
                }));
            }));
        } else {
            this.props.dispatch(actionChat.getLawClientList(law => {
                let data = [];
                if(law) {
                    for (let i = 0; i < law.length; i++) {
                        //拿到名字后再赋值
                        let obj = {
                            name: law[i].name,
                            recentNews: "最近天气怎么样？",
                            id: law[i].id,
                            isFixed: false,
                            avatar: law[i].avatar ? law[i].avatar : "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/images/init_avatar.png",
                            date: "09:23",
                            type: 'law',
                            url: law[i].url,
                            method: law[i].method,
                            params: law[i].params,
                            headers: law[i].headers,
                        };
                        data.push(obj);
                    }; 
                }
                this.props.dispatch(actionChat.getConversableClientList(1, 10, "", (rs) => {
                    for (let i = 0; i < rs.data.length; i++) {
                        //拿到名字后再赋值

                        let obj = {
                            name: rs.data[i].name,
                            recentNews: "最近天气怎么样？",
                            id: rs.data[i].id,
                            isFixed: false,
                            avatar: rs.data[i].avatar ? rs.data[i].avatar : "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/images/init_avatar.png",
                            date: "09:23"
                        };
                        data.push(obj);
                    };
                    this.setState({
                        contactsList: data
                    })

                    if (rs && rs.data && rs.data.length > 0) {
                        this.setState({ hasMore: rs.page * rs.per_page < rs.total })
                    }
                }));
            }));
        }

        if(platform.isIOS()) {
            this.RecognizerIos = this.props.route.params.key
        }
    }

    search = (page, per_page, keywords, callback) => {
        const { dispatch } = this.props;
        const { type } = this.state;
        const that = this;
        if (type === 2) {
            dispatch(actionChat.getConversableEmployeeList(page, per_page, keywords, (rs) => {
                callback(rs);
            }));
        } else {
            dispatch(actionChat.getConversableClientList(page, per_page, keywords, (rs) => {
                callback(rs);
            }));
        }
    }

    handleSearch = (text) => {
        this.setState({
            keywords: text
        });
    };

    onSubmitEditing = () => {
        this.setState({
            isSearch: false
        })
        const { keywords } = this.state;
        this.search(1, 10, keywords, (rs) => {
            let data = [];
            for (let i = 0; i < rs.data.length; i++) {
                //拿到名字后再赋值
                let obj = {
                    name: rs.data[i].name,
                    recentNews: "最近天气怎么样？",
                    id: rs.data[i].id,
                    isFixed: false,
                    avatar: rs.data[i].avatar ? rs.data[i].avatar : "https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/images/init_avatar.png",
                    date: "09:23"
                };
                data.push(obj);
            };

            this.setState({
                contactsList: data,
            })
        });
    }

    handleGoBack() {
        Keyboard.dismiss();
        this.props.navigation.goBack();
    }

    goDetails = (contact) => {
        console.log('goDetails', contact);
        if(contact.type && contact.type=='law') {
            this.props.navigation.navigate('ChatLaw', {contact, key: this.RecognizerIos})
        } else {
            this.props.navigation.navigate('Chat', { contact })
        }
        // 'Chat', { id: 1, name:'zhangsan', avatar: ''}
    };

    contentViewScroll = (e) => {
        var offsetY = e.nativeEvent.contentOffset.y; //滑动距离
        var contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
        var oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
        if (offsetY + oriageScrollHeight >= contentSizeHeight) {
            console.log('上传滑动到底部事件')
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar translucent={true} backgroundColor='#ffffff' barStyle="dark-content" />
                {/* 导航栏 */}
                {
                    !this.state.isSearch &&
                    <View style={styles.navigationBarContainer} >
                        <View style={styles.navigationBar}>
                            <MyButton
                                key={'leftIcon'}
                                activeOpacity={0.75}
                                style={styles.leftIcon}
                                onPress={this.handleGoBack.bind(this)}
                            >
                                <FeatherIcons size={30} name='chevron-left' color='#303133' />
                            </MyButton>

                            <View key={'title'} style={styles.titleWrap}>
                                <Text style={[styles.title, {}]}>会话</Text>
                            </View>

                            <TouchableOpacity style={styles.rightIcon} onPress={() => {
                                this.setState({
                                    isSearch: true
                                })
                            }}>
                                <Image
                                    style={{ width: 25, height: 25 }}
                                    resizeMode='contain'
                                    source={{ uri: 'https://lawyer-dev.oss-cn-hangzhou.aliyuncs.com/images/search-2-line.png' }} />
                            </TouchableOpacity>
                        </View>
                    </View>

                }

                {/* 会话列表 */}
                <View style={styles.container}>
                    <ContactList contacts={this.state.contactsList} onPress={this.goDetails} contentViewScroll={this.contentViewScroll} />
                </View>

                {
                    this.state.isSearch &&
                    <View style={styles.mask}>
                        <View style={styles.searchContainer}>
                            <SearchBar onChangeText={this.handleSearch} onSubmitEditing={this.onSubmitEditing} />
                            <TouchableOpacity style={styles.cancel} onPress={() => {
                                this.setState({
                                    isSearch: false
                                })
                            }}>
                                <Text style={styles.cancelText}>取消</Text>
                            </TouchableOpacity>

                        </View>

                    </View>
                }
            </SafeAreaView>
        )
    }
}
export default connect(ReportPage.mapStateToProps)(ReportPage);

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
        top: STATUSBAR_HEIGHT,
        position: 'absolute',
        zIndex: 2,
        display: 'flex',
        justifyContent: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row'
    },
    navigationBarContainer: {
        height: 45,
        alignItems: 'center',
        color: '#000',
        width: '100%',
        backgroundColor: '#fff'
    },
    navigationBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        width: '100%',
    },
    leftIcon: {
        position: 'absolute',
        zIndex: 1,
        left: 20,
        color: '#000',
        width: 100,
        height: 45,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    titleWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: FontSize(18),
        color: '#000',
    },
    rightIcon: {
        position: 'absolute',
        zIndex: 1,
        right: 20,
        color: '#000',
        width: 100,
        height: 45,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    cancel: {
        marginRight: 15,
        marginLeft: 15,
        marginTop: 15
    },
    cancelText: {
        color: "#22AFFF",
        fontSize: FontSize(16),
    },
    searchContainer: {
        width: '100%',
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
