import React, {Component} from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  Text,
  SectionList,
  InteractionManager,
  Animated,
  ActivityIndicator,
  TouchableHighlight,
  Overlay,
  Alert,
  DeviceEventEmitter
} from 'react-native';
import {Swipeable, GestureHandlerRootView, RectButton} from 'react-native-gesture-handler';
import moment from 'moment';
import Common from '../common/constants';
import {getWeek, getWeekXi, produce, removeItem, getHoliday, logger} from '../utils/utils';
import actionProcess from "../actions/actionProcess";
import actionCase from "../actions/actionCase";
import IcomoonIcon from "../components/IcomoonIcon";
import MyPlanItem from "../components/MyPlanItem";
import MyButton from "./MyButton";
import { destroySibling, showLoading, showToast } from "./ShowModal";
import * as Storage from '../common/Storage';
import GlobalData from "../utils/GlobalData";
const globalData = GlobalData.getInstance();
const Toast = Overlay.Toast;
export default class MyPlanSlider extends Component {
  renderRightAction = (text, color, x, progress, item) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <MyButton
          style={[styles.rightAction, { width: x, backgroundColor: color }]}
          onPress={() => this.deleteItem(item)}>
            <IcomoonIcon name='delete' color='#fff' size={20}/>
          {/* <Text style={styles.actionText}>{text}</Text> */}
        </MyButton>
      </Animated.View>
    );
  };

  renderRightActions = (progress, item) => (
    <View
      style={{
        width: 100,
        flexDirection: 'row',
      }}>
      {this.renderRightAction('删除', '#5e5e5e', 100, progress, item)}
    </View>
  );

  close = () => {
    this.swipeableRow?.close();
  };
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      refreshing: false,
      loadFinish: false,
      DATA: props.planList ?  props.planList : [],
      caseList: props.caseList
    };
    this.loadMoreDataThrottled = _.throttle(this.loadModeData, 1000, {trailing: false});
    this.loadDataThrottled = _.throttle(this.initList, 1000, {trailing: false});
  }

  componentDidMount () {
    logger('.........MyPlanSlider .componentDidMount')
    InteractionManager.runAfterInteractions(() => {
      const {dispatch, user} = this.props;
      const { caseList } = this.state;
      const that = this;
      if (JSON.stringify(caseList)==='{}') {
        Storage.getCaseList(user.phone).then((list) => {
          if(list){
            that.setState({ caseList: JSON.parse(list)});
          }
        });
      }
      this.loadDataThrottled();
      // that.setState({refreshing: true});
      // dispatch(actionProcess.reqProcessPlanList(1,  undefined,(data, isFinish)=>{
      //   const rs = data.rs;
      //   if(rs.length > 0) {
      //     that.setState({page: 2,  DATA: rs, refreshing: false, loadFinish: isFinish},()=>{
      //     });
      //   }
      //   else {
      //     that.setState({refreshing: false, DATA: [], loadFinish: isFinish},()=>{
      //     })
      //   }
      // })); 
      // if (JSON.stringify(caseList)==='{}') {
      //   dispatch(actionCase.reqCaseList()); 
      // }
      this.eventRefreshReceive = DeviceEventEmitter.addListener('refreshProcessPlan', 
   		        () => { this.loadDataThrottled(); });
    });
  }

  initList = () => {
    logger('.........MyPlanSlider .initList')
    const {dispatch, } = this.props;
    const { caseList } = this.state;
    const that = this;
    showLoading();
    that.scollToTopNoAni();
      // that.setState({refreshing: true})
    dispatch(actionProcess.reqProcessPlanList(1,  undefined,(data, isFinish)=>{
      const rs = data.rs;
      if(rs.length > 0) {
        that.setState({page: 2,  DATA: rs, refreshing: false, loadFinish: isFinish}, ()=>{
          setTimeout(() => {   
            destroySibling();
          }, 800);
        });
      }
      else {
        that.setState({refreshing: false, DATA: [], loadFinish: isFinish}, ()=>{
          setTimeout(() => {   
            destroySibling();
          }, 800);
        })
      }
    })); 
  }
  componentWillUnmount() {
    this.loadMoreDataThrottled.cancel();
    this.loadDataThrottled.cancel();
    this.eventRefreshReceive && this.eventRefreshReceive.remove();
  }

  scollToEnd = () => {
    let sectionIndex = (this.state.DATA.length - 1);
    let itemIndex = this.state.DATA[sectionIndex].data.length - 1;

    this.myPlanListRef&&this.myPlanListRef.scrollToLocation({
        itemIndex,
        sectionIndex,
        animated: false,
    });
  }

  scollToTop = () => {
    let sectionIndex = 0;
    let itemIndex = 0;

    this.myPlanListRef&&this.myPlanListRef.scrollToLocation({
        itemIndex,
        sectionIndex,
        animated: true,
    });
  }
  scollToTopNoAni = () => {
    let sectionIndex = 0;
    let itemIndex = 0;

    this.myPlanListRef&&this.myPlanListRef.scrollToLocation({
        itemIndex,
        sectionIndex,
        animated: false,
    });
  }

  loadModeData = () => {
    const { DATA, page, loadFinish } = this.state;
    const {dispatch} = this.props;
    const that = this;
    if(loadFinish || page ===1) {
      return;
    }
    // that.setState({refreshing: true})
    showLoading();
    dispatch(actionProcess.reqProcessPlanList(page, DATA[DATA.length - 1], (rs, isFinish)=>{
      let flag = false;
      let newDate = DATA;
      if(rs.last){
        newDate[newDate.length - 1] = rs.last;
        flag = true;
      }
      if(rs.rs.length > 0) {
        newDate =  newDate.concat(rs.rs)
        flag = true;
      } 
      if (flag) {
        that.setState({page: page + 1, DATA: newDate, refreshing: false, loadFinish: isFinish}, ()=>{
          setTimeout(() => {   
            destroySibling();
          }, 800);
        });
      }
      else {
        that.setState({refreshing: false, loadFinish: isFinish}, ()=>{
          setTimeout(() => {   
            destroySibling();
          }, 800);
        });
      }
    })); 
  }
  changeEnable = (item) => {
    const {dispatch} = this.props;
    const {DATA} = this.state;
    const that = this;
    // that.setState({refreshing: true});
    showLoading();
    dispatch(actionProcess.reqWakeUpProcess(item.id, !item.is_wakeup, (rs, error)=>{
      if(error) {
        destroySibling();
        Toast.show(error.info);
        that.setState({ refreshing: false});
      }
      else {
        let temp = produce(DATA, item);
        that.setState({DATA: temp}, ()=>{
          setTimeout(()=>{
            destroySibling();
          },800);
          // that.setState({ refreshing: false});
        });
      }
    })); 
  }

  deleteItem = (item) => {
    const {dispatch} = this.props;
    const {DATA} = this.state;
    const that = this;
    Alert.alert(
      "删除计划",
      "确定要删除["+item.name+"]计划么？删除后将不能恢复!",
      [
        {
          text: "取消",
          onPress: () => logger("Cancel Pressed"),
          style: "cancel"
        },
        { text: "确定", onPress: () => {
            showLoading();
            // that.setState({refreshing: true})
            dispatch(actionProcess.reqDeleteProcess(item.id, (rs, error)=>{
              if(error) {
                destroySibling();
                Toast.show(error.info);
                that.setState({refreshing: false})
              }
              else {
                InteractionManager.runAfterInteractions(() => {
                  let temp = removeItem(DATA, item);
                  that.setState({DATA: temp}, ()=>{
                    setTimeout(()=>{
                      destroySibling();
                      that.setState({refreshing: false})
                    }, 800) 
                  });
                });
              }
            }));  
          }
        }
      ]
    );
    
  }
  render() {
    const {DATA, caseList, loadFinish, refreshing} = this.state;
    logger(loadFinish)
    const Item = ({ item }) => (
      <Swipeable
        friction={1}
        rightThreshold={40}
        renderRightActions={(progressAnimatedValue) => this.renderRightActions(progressAnimatedValue, item)}>
          <MyPlanItem item={item} changeEnable={(item) => this.changeEnable(item)}  caseList={caseList} />
      </Swipeable>
    );
    
    const screenHeight = globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height
    return ( 
        <View style={styles.bottomModalContainer}>
            {refreshing && <View style={[styles.bottomMask, {height: screenHeight - 100,}]}>
              <ActivityIndicator size="large" color="black" />
            </View>}
            <View style={styles.bottomContent}>  
                <View style={styles.title}><Text style={styles.titleFont} onLongPress={this.scollToTop}>计划</Text></View>      
                <View style={styles.subTitle}><Text style={styles.subTitleFont}>{moment(new Date()).format('YYYY年MM月DD日')} {getWeek(new Date())}</Text></View>      
                {JSON.stringify(caseList)!='{}' && DATA && DATA.length > 0 && <GestureHandlerRootView style={{flex: 1}}><SectionList
                  ref={ (ref) => { this.myPlanListRef = ref } }
                  ListHeaderComponent={null}
                  ListFooterComponent={loadFinish && <View style={styles.empty}><Text style={styles.emptyFont}>未来的日子只有假期~</Text></View>}
                  sections={DATA}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({ item }) => <Item item={item} />}
                  renderSectionHeader={({ section: { date,  isFestival, isShowYear} }) => moment(date).isSame(moment(), "day") ? 
                  (<View style={styles.titleToday}><View style={styles.titleTime}><Text style={styles.titleTodayFont}>今天</Text><Text style={styles.titleTodayWeekFont}>{getWeekXi(new Date())}</Text></View><Text style={styles.titleTodayFont1}>{getHoliday(date)}</Text></View>)
                  :
                  (
                    <View style={styles.listTitleView}>
                      {isShowYear && <Text style={styles.listTitleYearFont}>{moment(date).format('YYYY年')}</Text>}
                    <View style={styles.titleList}><View style={styles.titleTime}><Text style={styles.listItemTitleFont}>{moment(date).format('MM月DD日')}</Text><Text style={styles.listItemTitleWeekFont}>{getWeekXi(date)}</Text></View>{ isFestival && <Text style={styles.titleTodayFont1}>{getHoliday(date)}</Text>}</View>
                    </View>)}
                  stickySectionHeadersEnabled={true}
                  onEndReachedThreshold={0.2}
                  onEndReached={this.loadMoreDataThrottled}
                  // refreshing={true}
                /></GestureHandlerRootView>
                }
            </View>
                {/* <Text style={styles.subTitleFont}>{moment(new Date()).format('YYYY年MM月DD日')} {getWeek(new Date())}</Text> */}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  bottomModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: Common.window.width,
    height: '100%',
  },
  bottomMask: {
    flex: 1,
    bottom: 0,
    width: Common.window.width,
    backgroundColor: "#fff",
    opacity: 0.4,
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center"
  },
  bottomContent: {
    width: Common.window.width,
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 5,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    width: Common.window.width,
    height: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  titleFont: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#303133'
  },
  subTitle: {
    width: Common.window.width,
    height: 15,
    justifyContent: "center",
    alignItems: "center"
  },
  subTitleFont: {
    fontSize: 13,
    color: '#909399'
  },
  titleToday: {
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
    display: 'flex',
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  titleTime:{
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  titleTodayFont: {
    fontSize: 18,
    color: '#007afe',
    paddingTop: 5,
    paddingBottom: 5,
    width: 78,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  listTitleYearFont: {
    fontSize: 18,
    color: '#C0C4CC',
    marginTop: 15,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  listItemTitleFont: {
    fontSize: 18,
    color: '#909399',
    paddingTop: 5,
    paddingBottom: 5,
    width: 100,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  titleTodayWeekFont: {
    fontSize: 18,
    color: '#007afe',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  listItemTitleWeekFont: {
    fontSize: 18,
    color: '#909399',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  titleTodayFont1: {
    fontSize: 15,
    color: '#007afe',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
  },
  empty: {
    // height: 80,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5
  },
  emptyFont: {
    fontSize: 15,
    color: '#C0C4CC',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
  },
  listTitleView: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff'
  },
  titleList: {
    marginTop: 15,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
    display: 'flex',
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listItemView: {
    display: 'flex',
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
    marginLeft: 15,
    marginRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  listItemTimeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    justifyContent: 'space-between'
  },
  listItemTimeStart: {
    fontSize: 17,
    color: '#606266',
    fontWeight: 'bold',
  },
  listItemTimeEnd: {
    fontSize: 17,
    color: '#909399',
    fontWeight: 'bold',
  },
  listItemTimeSplit: {
    width: 6,
    height: 43,
    borderRadius: 6,
    marginLeft: 10,
    marginRight: 10,
  },
  listItemTitle: {
    fontSize: 19,
    color: '#606266',
    fontWeight: 'bold',
  },
  listItemContent: {
    fontSize: 15,
    color: '#909399',
    fontWeight: 'bold',
  },
  listItemRightView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    flex: 1,
    justifyContent: 'space-between'
  },
  rightAction: {
    height: 65,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center"
  },
  actionText: {
    color: '#fff',
    fontSize: 12
  },
  listItemNoticeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    justifyContent: 'space-between'
  },
  setNoticeView: {
    backgroundColor: '#eee',
    width: 40,
    height: 40,
    borderRadius: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
