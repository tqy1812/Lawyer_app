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
    ImageBackground, InteractionManager, ActivityIndicator
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
import actionCase from '../actions/actionCase';
import { caseSetting, logger } from '../utils/utils';
import SearchBar from '../components/contact-component/SearchBar';
import ContactList from '../components/contact-component/ContactList';
const Toast = Overlay.Toast;
const { width: windowWidth, height: windowHeight } = Common.window;

class ReportPage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        props.caseList = state.Case.caseList;
        return props;
    }


    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            caseSet: caseSetting(props.caseList),
            filteredContacts: [
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
                { name: '张三', number: '1234567890' },
                { name: '李四', number: '0987654321' },
            ]
        };
    }

    componentDidMount() {
        if (!this.props.isLogin) {
            this.props.navigation.navigate('Login');
        }
    }

    //
    // handSubmit() {
    //     const { dispatch } = this.props;
    //     this.props.navigation.goBack();
    // }
    // closeLoading = () => {
    //     this.setState({ loading: false });
    //     Storage.getUserRecord().then((user) => {
    //         if (user) {
    //             let obj = Object.assign({}, JSON.parse(user));
    //             let reg = new RegExp('"', "g");
    //             // logger(obj.token, JSON.stringify(this.state.caseSet).replace(reg, "'"))
    //             this.wv && this.wv.current && this.wv.current.injectJavaScript('receiveMessage("' + obj.token + '", "' + JSON.stringify(this.state.caseSet).replace(reg, "'") + '");true;');
    //         }
    //     });

    // }

    handleSearch = (text) => {
        let filteredContacts = this.state.filteredContacts;
        const filtered = filteredContacts.filter((contact) =>
            contact.name.toLowerCase().includes(text.toLowerCase()));
        this.setState({ filteredContacts: filtered });
    };
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle="dark-content" />
                <Header title='联系人列表' back={true} {...this.props} />
                {/* {this.state.loading && <View style={styles.mask}>
                    <ActivityIndicator size="large" color="black" />
                </View>} */}
                <View style={styles.container}>
                    <SearchBar onChangeText={this.handleSearch} />
                    <ContactList contacts={this.state.filteredContacts} />
                    {/* <WebView
                      ref={this.wv}
                      source={{ uri: Common.webUrl + 'report/report.html' }}
                      // source={{ uri: 'https://human.kykyai.cn' }}
                      scalesPageToFit={false}
                      bounces={false}
                      style={{width:windowWidth,height:'100%'}}
                      javaScriptEnabled={true}
                      injectedJavaScript={this.INJECTEDJAVASCRIPT }
                      // onMessage={(event) => {this.handleNativeMessage(event.nativeEvent.data)}}
                      mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
                      userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
                      incognito={true}
                      onLoadEnd={this.closeLoading.bind(this)}
                    /> */}
                </View>
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
        top: 0,
        position: 'absolute',
        zIndex: 2,
        display: 'flex',
        justifyContent: "center",
        alignItems: "center",
    },
});
