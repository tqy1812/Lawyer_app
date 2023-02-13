import React,{Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    Overlay,
    ImageBackground, InteractionManager
} from 'react-native';
import Header from '../components/Header';
import {connect} from 'react-redux';
import actionAuth from '../actions/actionAuth';
import * as Storage from '../common/Storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Common from '../common/constants';
import MyButton from '../components/MyButton';
import MyFinishPlanSheet from '../components/MyFinishPlanSheet';
import {Calendar, Agenda} from 'react-native-calendars';
// import { CheckBox } from 'react-native-elements';
import AntDesign from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
import authHelper from '../helpers/authHelper';
import moment from 'moment';
import {showDrawerModal, DrawerModal, } from '../components/DrawerModal';
import {destroySibling, destroyAllSibling, showLoading, showModal, showRecoding, showPlanModal, showFinishModal} from '../components/ShowModal';
// import {locale} from '../utils/utils'

import CalendarStrip from '../components/calendarStrip/CalendarStrip';
const Toast = Overlay.Toast;
class ServicePage extends Component {

    static mapStateToProps(state) {
        let props = {};
        props.user = state.Auth.user;
        props.isLogin = authHelper.logined(state.Auth.user);
        return props;
    }


    constructor(props) {
        super(props);
        
        this.finishRef = React.createRef();
        this.state = {
            
        };
    }

    componentDidMount() {
      showPlanModal(<DrawerModal
        component={<View style={{width: Common.window.width, flex:1, backgroundColor: '#ff0000'}}><Text>测试</Text></View>}
        ref={e => this.planRef = e}
        height={Common.window.height - 100}
        showType={'bottom'}
      /> );
    }

    // 登录
    handSubmit() {
      
      this.planRef.open('plan')
        // InteractionManager.runAfterInteractions(() => {
        //     const {dispatch} = this.props;
        //     this.props.navigation.goBack();
        // });
    }
    handleDateSelected() {
    }
    render() {
      return (
          <SafeAreaView style={styles.container}>  
            <Header title='律时服务协议' back={true}  {...this.props}/>                              
              <View style={styles.container}>   
              {/* <CalendarStrip
  isChinese
  showWeekNumber = {false}
  showChineseLunar
  selectedDate={this.state.selectedDate}
  onPressDate={(date) => {
    this.setState({ selectedDate: date });
  }}
  onPressGoToday={(today) => {
    this.setState({ selectedDate: new Date() });
  }}
  onSwipeDown={() => {
    alert('onSwipeDown');
  }}
  markedDate={[]}
/> */}
              {/* <CalendarStrip
                    iconLeftShow={false}
                    iconRightShow={false}
                    calendarAnimation={{type: 'sequence', duration: 30}}
                    style={{height:95, paddingLeft: 10, paddingRight: 10, borderBottomWidth: 1, borderBottomColor: '#C7C7C7'}}
                    calendarHeaderStyle={{ fontSize: 16 }}
                    dateNameStyle={{ fontSize: 11 }}
                    highlightDateNameStyle={{fontSize: 11}}
                    dateNumberStyle={{ fontSize: 16, paddingTop: 3, paddingBottom: 3, color: '#000'}}
                    highlightDateNumberStyle={{color: '#fff', fontSize: 16, lineHeight: 20}}
                    highlightDateNumberContainerStyle={{backgroundColor: '#007afe', width: 32, height: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 50}}
                    // highlightDateContainerStyle={{backgroundColor: '#007afe', }}
                    selectedDate={new Date()}
                    scrollerPaging={true}
                    scrollable={true}
                    useIsoWeekday={true}
                    leftSelector={null}
                    rightSelector={null}
                    onDateSelected={this.handleDateSelected}
                    // startingDate={moment(new Date()).day() == 0 ? new Date() : moment(new Date()).endOf('isoWeek').add(-7, 'd')}
                />
                */}
                
          {/* <MyFinishPlanSheet hasDraggableIcon ref={this.finishRef} height={Common.window.height - 100} /> */}
                  <MyButton style={styles.loginBtn} onPress={this.handSubmit.bind(this)}>
                      <Text style={styles.loginText}>好的</Text>
                  </MyButton>
              </View>
          </SafeAreaView>
      )
    }
}
export default connect(ServicePage.mapStateToProps)(ServicePage);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: Common.window.height,
    backgroundColor: '#fff',
    color: '#000',
    justifyContent: 'center',
    display: 'flex',
    flexDirection:'column'
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
