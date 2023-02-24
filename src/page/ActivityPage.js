import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    StatusBar,
    Overlay,
    DeviceEventEmitter, InteractionManager, ScrollView
} from 'react-native';
import Common from '../common/constants';
import authHelper from '../helpers/authHelper';
import moment from 'moment';
import CalendarStrip from '../components/calendarStrip/CalendarStrip';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MyButton from '../components/MyButton';
import actionProcess from "../actions/actionProcess";
import actionCase from "../actions/actionCase";
import { SafeAreaView } from 'react-native-safe-area-context';
import { connect } from 'react-redux';
import { getWeekXi, getContentView, getContentViewWidth, sortList } from '../utils/utils'
import { showLoading, destroySibling } from "../components/ShowModal"
import platform from '../utils/platform';
import { is } from 'date-fns/locale';
import { isToday } from 'date-fns';
// import {locale} from '../utils/utils'
const Toast = Overlay.Toast;

class ActivityPage extends Component {
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
        this.state = {
            today: moment(new Date()),
            list: [],
            isToday: true
        };
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            const { dispatch, caseList } = this.props;
            const that = this;
            if (!this.props.isLogin) {
                this.props.navigation.navigate('Login');
            }
            destroySibling();
            // if (JSON.stringify(caseList)==='{}') {
            //   dispatch(actionCase.reqCaseList());
            // }
            dispatch(actionProcess.reqDailyProcessList(moment(new Date()).format('YYYY-MM-DD'), (rs) => {
                if (rs.length > 0) {
                    that.setState({ list: getContentViewWidth(rs) });
                }
            }));
            this.eventNoticeReceive = DeviceEventEmitter.addListener('refreshDailyProcess',
                () => { this.handleList(moment(new Date()).format('YYYY-MM-DD')); });
        });
    }

    componentWillUnmount() {
        this.eventNoticeReceive && this.eventNoticeReceive.remove();
    }

    back = () => {
        // if(this.props.back){
        //     this.props.back()
        // }
        this.props.navigation.goBack();
    }

    handleDateSelected = (date) => {
        let currentTime = moment(date).format('YYYY-MM-DD');
        let today = moment(this.state.today).format('YYYY-MM-DD')
        if (currentTime != today) {
            this.setState({ isToday: false })
        } else {
            this.setState({ isToday: true })
        }
        this.handleList(currentTime);
    }
    backToday = () => {
        //console.log('backToday')
        const that = this;
        this.handleList(moment(new Date()).format('YYYY-MM-DD'), () => {
            that.myCalendar && that.myCalendar.setSelectedDate(moment(new Date()));
        });
        // this.setState({today: moment(new Date()) })
    }

    handleList = (time, callback) => {
        const { dispatch } = this.props;
        const that = this;
        showLoading();
        dispatch(actionProcess.reqDailyProcessList(time, (rs) => {
            destroySibling();
            if (rs.length > 0) {
                that.setState({ list: getContentViewWidth(rs) });
            }
            else {
                that.setState({ list: [] });
            }
            if (callback) callback()
        }));
    }
    render() {
        const time = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'];
        const { list, today, isToday } = this.state;
        //   console.log(today)
        // console.log(this.props)
        return (
            <SafeAreaView style={styles.container}>
                {/* <StatusBar translucent={true} barStyle="dark-content" /> */}
                <MyButton style={styles.backBtn}
                    activeOpacity={0.75} onPress={this.back.bind(this)}>
                    <AntDesign name='left' size={23} color='#5c5c5c' />
                </MyButton>
                <CalendarStrip
                    ref={(ref) => { this.myCalendar = ref }}
                    iconLeftShow={false}
                    iconRightShow={false}
                    calendarAnimation={{ type: 'sequence', duration: 30 }}
                    style={{ height: 150, paddingLeft: 10, paddingRight: 10, borderBottomWidth: 1, borderBottomColor: '#C7C7C7' }}
                    calendarHeaderStyle={{ fontSize: 18, marginTop: 20, marginBottom: 20 }}
                    dateNameStyle={{ fontSize: 12 }}
                    highlightDateNameStyle={{ fontSize: 11 }}
                    dateNumberStyle={{ fontSize: 16.5, paddingTop: 3, paddingBottom: 3, color: '#000' }}
                    highlightDateNumberStyle={isToday ? { color: '#fff', fontSize: 16, lineHeight: 20 } : { color: '#000', fontSize: 16, lineHeight: 20 }}
                    highlightDateNumberContainerStyle={isToday ? styles.highlightDateNumberContainerStyleDefault : styles.highlightDateNumberContainerStyle}
                    // highlightDateContainerStyle={{backgroundColor: '#007afe', }}
                    selectedDate={today}
                    scrollerPaging={true}
                    scrollable={true}
                    useIsoWeekday={true}
                    leftSelector={null}
                    rightSelector={null}
                    onDateSelected={this.handleDateSelected}
                // locale={locale}
                />
                <View style={styles.content}>
                    <ScrollView>
                        <View style={styles.agendaContainer}>
                            <View style={styles.timeView}>
                                {
                                    time.map((item, index) => {
                                        return (item == '24:00' ? <View style={styles.timeLastLabel}><Text style={styles.timeFont}>{item}</Text></View> : <View style={styles.timeLabel}><Text style={styles.timeFont}>{item}</Text></View>)
                                    })
                                }
                            </View>
                            <View style={styles.agendaContent}>
                                <View style={styles.agendaView}>
                                    {
                                        time.map((item, index) => {
                                            return (item == '24:00' ? <View style={styles.agendaLastLabel}><View style={styles.agendaLine}></View></View> : <View style={styles.agendaLabel}><View style={styles.agendaLine}></View></View>)
                                        })
                                    }
                                </View>
                            </View>
                        </View>
                        {isToday && <View style={styles.currentTimeView}>
                            <View style={styles.currentTimeDot}></View>
                            <View style={styles.currentTimeLine}></View>
                        </View>}
                        {
                            list && JSON.stringify(this.props.caseList) != '{}' && list.map((item, index) => {
                                let startTime = item.start_time ? moment(item.start_time).format('HH:mm') : moment(item.wakeup_time).format('HH:mm');
                                let endTime = item.end_time ? moment(item.end_time).format('HH:mm') : '';
                                let top = getContentView(startTime, endTime);
                                // console.log(startTime, endTime, top)
                                let color = this.props.caseList[item.case.id + ''];
                                // console.log(color)
                                return (
                                    <View style={[styles.activityView, { backgroundColor: color[0], width: (Common.window.width - 51) / item.wSplit, height: top[1] < 1 ? 50 : top[1] * 50, top: 8 + top[0] * 50, left: 50 + item.lIndex * (Common.window.width - 50) / item.wSplit, borderRadius: 8, }]}>
                                        <View style={styles.activityLeft}><Text style={styles.activityLeftFont} numberOfLines={2} ellipsizeMode={'tail'}>{item.name}</Text>
                                            {top[1] >= 0.5 && <Text style={styles.activityLeftAddressFont} numberOfLines={2} ellipsizeMode={'tail'}>{item.address}</Text>}</View>
                                        <View style={[styles.activityRight, { backgroundColor: color[1], height: top[1] < 1 ? 50 : top[1] * 50, borderRadius: 8 }, item.case && item.case.name ? { flex: 1 } : { width: 20, }]}><Text style={styles.activityRightFont} numberOfLines={2} ellipsizeMode={'tail'}>{item.case.name}</Text></View>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </View>
                <View style={styles.footer}><Text style={styles.footerFont} onLongPress={this.backToday}>{moment(new Date()).format('YYYY年MM月DD日')} {getWeekXi(new Date())}</Text></View>
            </SafeAreaView>
        )
    }
}
export default connect(ActivityPage.mapStateToProps)(ActivityPage);

const STATUS_BAR_HEIGHT = platform.isIOS() ? React.Component.prototype.InsetsTop : Common.statusBarHeight;
const top = platform.isIOS() ?  STATUS_BAR_HEIGHT + 20 : 20; 
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: Common.window.height,
        backgroundColor: '#fff',
        color: '#000',
        justifyContent: 'center',
        // paddingTop: 10,
    },
    backBtn: { height: 25, left: 10, top: top, position: 'absolute', zIndex: 999 },
    content: {
        flex: 1,
        flexDirection: 'row'
    },
    agendaContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    timeView: {
        width: 50,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    timeLabel: {
        height: 50,
        width: 50,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    timeLastLabel: {
        height: 16,
        width: 50,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    timeFont: {
        fontSize: 11,
        color: '#97979B',
        height: 16,
    },
    agendaContent: {
        flex: 1,
        flexDirection: 'row',
    },
    agendaView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    agendaLabel: {
        width: '100%',
        height: 50,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    agendaLastLabel: {
        width: '100%',
        height: 16,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    agendaLine: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#C7C7C7',
        height: 8,
    },
    footer: {
        width: '100%',
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#C7C7C7'
    },
    footerFont: {
        color: '#616161',
        fontWeight: 'bold',
        fontSize: 17,
    },
    currentTimeView: {
        position: 'absolute',
        top: 5 + 50 * moment().hours() + moment().minutes() / 60 * 50,
        height: 6,
        width: Common.window.width - 22,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        left: 22,
        zIndex: 999
    },
    currentTimeDot: {
        height: 6,
        width: 6,
        borderRadius: 6,
        backgroundColor: '#007AFE',
    },
    currentTimeLine: {
        width: Common.window.width - 28,
        height: 2,
        backgroundColor: '#007AFE',
    },
    activityView: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityLeft: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 5,
        paddingRight: 5,
        flex: 1
    },
    activityLeftFont: {
        color: '#000',
        fontSize: 12,
    },
    activityLeftAddressFont: {
        color: '#000',
        fontSize: 10,
    },
    activityRight: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 1,
    },
    activityRightFont: {
        color: '#fff',
        fontSize: 10,
    },
    highlightDateNumberContainerStyle: {
        backgroundColor: '#fff',
        width: 32,
        height: 32,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#007afe"
    },
    highlightDateNumberContainerStyleDefault: {
        color: "#fff",
        backgroundColor: '#007afe',
        width: 32,
        height: 32,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    }
});
