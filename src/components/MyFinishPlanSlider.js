import React, {Component} from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  SectionList,
  Text,
  InteractionManager,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  DeviceEventEmitter,
  Alert,
  Overlay
} from 'react-native';
import {Swipeable, GestureHandlerRootView, RectButton, ScrollView} from 'react-native-gesture-handler';
import moment from 'moment';
import Common from '../common/constants';
import {getWeekXi, getFinishBlankHeight, getFeeTimeFormat, removeFinishItem, updateFinish, FontSize} from '../utils/utils';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import actionProcess from "../actions/actionProcess";
import actionCase from "../actions/actionCase";
import IcomoonIcon from "../components/IcomoonIcon";
import FinishPlanItem from "../components/FinishPlanItem";
import MyButton from "./MyButton";
import { destroySibling, showLoading, showToast } from "./ShowModal";
import * as Storage from '../common/Storage';
import platform from "../utils/platform";
import GlobalData from "../utils/GlobalData";
import {logger} from "../utils/utils";
import Immutable from 'immutable';
import ProcessTiemConfirmModal from '../components/ProcessTimeConfirmModal';
import { showConfirmModal } from '../components/ShowModal';

const globalData = GlobalData.getInstance();
const Toast = Overlay.Toast;
export default class MyFinishPlanSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalTime: '00:00’',
      refreshing: false,
      loadFinish: false,
      DATA: props.finishList ?  props.finishList : [],
      caseList: props.caseList
    };
    this.page = 1;
    this.loading = false;
    this.loadMoreDataThrottled = _.throttle(this.loadModeData, 1000, {trailing: false});
    this.loadDataThrottled = _.throttle(this.initList, 1000, {trailing: false});
  }

  componentDidMount () {
    logger('.......MyFinishPlanSlider componentDidMount')
    InteractionManager.runAfterInteractions(() => {
      const {dispatch, user} = this.props;
      const {caseList} = this.state;
      const that = this;
      if (JSON.stringify(caseList)==='{}') {
        Storage.getCaseList(user.phone).then((list) => {
          if(list){
            that.setState({ caseList: JSON.parse(list)});
          }
        });
      }
      this.loadDataThrottled();
       // if (JSON.stringify(caseList)==='{}') {
    //   dispatch(actionCase.reqCaseList());
    // }
      // dispatch(actionProcess.reqProcessFinishList(1, undefined, (data, t, isFinish)=>{
      //   const rs = data.rs;
      //   if(rs.length > 0) {
      //     that.setState({page: 2, DATA: rs, totalTime: t, refreshing: false, loadFinish: isFinish });
      //   } else {
      //     that.setState({totalTime: t, DATA: [], refreshing: false, loadFinish: isFinish});
      //   }
      // }));
      this.eventRefreshReceive = DeviceEventEmitter.addListener('refreshProcessFinish',
   		        () => { this.loadDataThrottled(); });

      this.eventRefreshCase = DeviceEventEmitter.addListener('refreshCaseFinish',
            (caseList) => { this.refreshCase(caseList); });
    });
  }


  shouldComponentUpdate(nextProps, nextState) {
    let mapState = Immutable.fromJS(this.state);
    let mapNextState = Immutable.fromJS(nextState);
    let mapProps = Immutable.fromJS(this.props.caseList);
    let mapNextProps = Immutable.fromJS(nextProps.caseList);
    if (!Immutable.is(mapState, mapNextState)) {
      return true;
    }
    return false;
  }

  refreshCase = (caseList) => {
    this.setState({caseList})
  }
  initList = () => {
    const {dispatch} = this.props;
    const that = this;
    // showLoading();
    // that.setState({refreshing: true});
    // that.scollToTopNoAni();
    this.myScrollRef && this.myScrollRef.scrollTo(0);
    dispatch(actionProcess.reqProcessFinishList(1, undefined, (data, t, isFinish)=>{
      const rs = data.rs;
      if(rs.length > 0) {
        this.page = 2;
        that.setState({DATA: rs, totalTime: t, loadFinish: isFinish },()=>{
          setTimeout(()=>{
            // destroySibling();
            that.setState({refreshing: false})
          }, 800)
        });
      } else {
        that.setState({totalTime: t, DATA: [], refreshing: false, loadFinish: isFinish},()=>{
          setTimeout(()=>{
            // destroySibling();
            that.setState({refreshing: false})
          }, 800)
        });
      }
    }));
  }
  componentWillUnmount() {
    this.loadMoreDataThrottled.cancel();
    this.loadDataThrottled.cancel();
    this.eventRefreshReceive && this.eventRefreshReceive.remove();
    this.eventRefreshCase && this.eventRefreshCase.remove();
  }

  setFinishTime = (item) => {
    if(this.props.finishTime) {
      this.props.finishTime(item);
    }
  }

  scollToEnd = () => {
    let sectionIndex = (this.state.DATA.length - 1);
    let itemIndex = this.state.DATA[sectionIndex].data.length - 1;

    this.myListRef&&this.myListRef.scrollToLocation({
        itemIndex,
        sectionIndex,
        animated: false,
    });
  }

  scollToTop = () => {
    // let sectionIndex = 0;
    // let itemIndex = 0;

    // this.myListRef&&this.myListRef.scrollToLocation({
    //     itemIndex,
    //     sectionIndex,
    //     animated: true,
    // });
    this.myScrollRef && this.myScrollRef.scrollTo(0);
  }

  scollToTopNoAni = () => {
    let sectionIndex = 0;
    let itemIndex = 0;

    this.myListRef&&this.myListRef.scrollToLocation({
        itemIndex,
        sectionIndex,
        animated: false,
    });
  }
  sendProcessTimeConfirm = (preItem, item, callback) => {
    if(moment(item.end_time).diff(moment(new Date())) < 0 && moment(item.start_time).format('YYYY-MM-DD') === moment(preItem.start_time).format('YYYY-MM-DD')) {
      let temp = updateFinish(this.state.DATA, item);
      let totalTime = this.state.totalTime;
      if(moment(item.start_time).diff(moment(moment().month(moment().month()).startOf('month').valueOf())) >= 0) {
        totalTime = this.state.totalTime - preItem.fee_time + item.fee_time
      }
      this.setState({DATA: temp, totalTime}, ()=>{
        setTimeout(()=>{
          destroySibling();
        },800);
      });
      if(callback) callback(item);
    }
    else {
      this.loadDataThrottled();
    }
  }
  setFinishTimeEnd = (value, callback) => {
    if(this.props.finishTimeEnd) {
      this.props.finishTimeEnd(value, (preItem, content) => {
        // logger('.......updateProcess'+ id+ '....' + content)
        this.updateProcess(preItem.id, content, (item)=>{
          logger('.......updateProcess'+ JSON.stringify(item))
          destroySibling();
          let nowItem = JSON.parse(JSON.stringify(preItem));
          nowItem.start_time = item.start_time;
          nowItem.end_time = item.end_time;
          nowItem.wakeup_time = item.wakeup_time;
          nowItem.fee_time = item.fee_time;
          showConfirmModal(<ProcessTiemConfirmModal dispatch={this.props.dispatch}  submint={(preItem, item)=>this.sendProcessTimeConfirm(preItem, item, callback)} item={nowItem} preItem={preItem}/>);

        })
      });
    }
  }

  updateProcess = (id, content, callback) => {
    const { dispatch } = this.props;
    const that = this;
    // that.setState({refreshing: true});
    // showLoading();
    dispatch(actionProcess.reqChangeTimesProcess(id, content, (rs, error)=>{
      // destroySibling();
      // logger(rs)
      if(error) {
        destroySibling();
        Toast.show(error.info);
      } else if(rs) {
        destroySibling();
         if(callback) callback(rs)
      }
      // that.setState({refreshing: false});
    }));
  }

  loadModeData = () => {
    const { DATA, loadFinish, refreshing } = this.state;
    const {dispatch} = this.props;
    const that = this;
    logger('.......loadModeData')
    if (loadFinish || this.page === 1 || refreshing) {
      return;
    }
    that.setState({refreshing: true});
    this.myScrollRef && this.myScrollRef.scrollToEnd();
    // showLoading();
    dispatch(actionProcess.reqProcessFinishList(this.page, DATA[DATA.length-1], (rs, t, isFinish)=>{
      let flag = false;
      let newDate = DATA;
      if(!loadFinish) {
        if(rs.last){
          newDate[newDate.length - 1] = rs.last;
          flag = true;
        }
        if(rs.rs.length > 0) {
          newDate =  newDate.concat(rs.rs)
          flag = true;
        }
      }
      if (flag) {
        this.page = this.page + 1;
        that.setState({DATA: newDate, totalTime: t, refreshing: false, loadFinish: isFinish}, ()=>{
          setTimeout(()=>{
            // destroySibling();
            // that.setState({refreshing: false});
          }, 800)
        });
      }
      else {
        that.setState({totalTime: t, refreshing: false, loadFinish: isFinish }, ()=>{
          setTimeout(()=>{
            // destroySibling();
            // that.setState({refreshing: false})
          }, 800)
        });
      }
    }));
  }

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

  deleteItem = (item) => {
    const {dispatch} = this.props;
    const {DATA} = this.state;
    const that = this;
    Alert.alert(
      "删除活动",
      "确定要删除["+item.name+"]活动么？删除后将不能恢复!",
      [
        {
          text: "取消",
          onPress: () => logger("Cancel Pressed"),
          style: "cancel"
        },
        { text: "确定", onPress: () => {
            showLoading();
            // that.setState({refreshing: true});
            dispatch(actionProcess.reqDeleteProcess(item.id, (rs, error)=>{
              InteractionManager.runAfterInteractions(() => {
                if(error) {
                  destroySibling();
                  Toast.show(error.info);
                  that.setState({refreshing: false})
                }
                else {
                  let temp = removeFinishItem(DATA, item);
                  let totalTime = this.state.totalTime;
                  if(moment(item.start_time).diff(moment(moment().month(moment().month()).startOf('month').valueOf())) >= 0) {
                    totalTime = this.state.totalTime - item.fee_time ;
                  }
                  that.setState({DATA: temp, totalTime}, ()=>{
                    setTimeout(()=>{
                      destroySibling();
                      that.setState({refreshing: false})
                    }, 800)
                  });
                }
              });
            }));
          }
        }
      ]
    );

  }

  renderItem = ({ item }) => {
    return (
      <Swipeable
        key={item.id}
        friction={1}
        rightThreshold={40}
        renderRightActions={(progressAnimatedValue) => this.renderRightActions(progressAnimatedValue, item)}>
          <FinishPlanItem item={item}  finishTime={(item) => this.setFinishTime(item)} finishTimeEnd={(value, callback)=>this.setFinishTimeEnd(value, callback)} caseList={this.state.caseList} />
      </Swipeable>
    );
  }
  renderFoot= () => {
    logger('.......finish renderFoot', this.state.refreshing)
    if(this.state.loadFinish) {
      return (
        <View key={'finish_finish'} style={styles.empty}>
          <Text style={styles.emptyFont}>您的过去清清白白~</Text>
        </View>
      );
    }
    else if(this.state.refreshing) {
      return (
        <View key={'finish_refresh'} style={styles.loading}>
          <ActivityIndicator size="small" color="black" />
        </View>
      );
    }
    else {
      return null
    }
  }
  renderSectionFooter = ({ section: { date,  total, isShowYear} }) => {
    return (
      <View style={styles.listTitleView}>
        {isShowYear && <Text style={styles.listTitleYearFont}>{moment(date).format('YYYY年')}</Text>}
      <View style={styles.titleList}><View style={styles.titleTime}><Text style={styles.listItemTitleFont}>{moment(date).format('MM月DD日')}</Text>
      <Text style={styles.listItemTitleWeekFont}>{getWeekXi(date)}</Text>
      </View>
      <Text style={styles.titleTimeFont}>共 {total > 0 ? getFeeTimeFormat(total) : '00:00'}{'’'}</Text>
      </View>
      </View>
    );
  }
  _contentViewScroll = (e) => {
    var offsetY = e.nativeEvent.contentOffset.y; //滑动距离
    var contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
    var oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
    if (offsetY + oriageScrollHeight+1 >= contentSizeHeight){
      this.loadMoreDataThrottled();
    }
  }
  render() {
    const { DATA, totalTime, caseList, loadFinish, refreshing } = this.state;
    // const Item = ({ item }) => (
    //   <Swipeable
    //     friction={1}
    //     rightThreshold={40}
    //     renderRightActions={(progressAnimatedValue) => this.renderRightActions(progressAnimatedValue, item)}>
    //       <FinishPlanItem item={item}  finishTime={(item) => this.setFinishTime(item)} finishTimeEnd={(value, callback)=>this.setFinishTimeEnd(value, callback)} caseList={caseList} />
    //   </Swipeable>
    // );
    const headHeight = platform.isIOS() ? globalData.getTop() : Common.statusBarHeight;
    return (
          <View style={styles.container}>
            {/* {refreshing && <View style={styles.mask}>
              <ActivityIndicator size="large" color="black" />
            </View>} */}
             <View style={styles.content}>
              <View style={[styles.head, {height: 45, marginTop: headHeight}]}><Text style={styles.headFont}>计时</Text></View>
               { DATA && DATA.length == 0  &&  <View style={[styles.empty, {flex: 1,}]}><Text style={styles.emptyFont}>您的过去清清白白~</Text></View> }

               {JSON.stringify(caseList)!='{}' && DATA && DATA.length > 0 && <GestureHandlerRootView style={styles.gestureStyle}>
                <ScrollView 
                  ref={(ref) => { this.myScrollRef = ref }}
                  style={{transform: [
                    { scaleY: -1 },
                  ]}}
                  onMomentumScrollEnd={this._contentViewScroll} 
                  >
                  {DATA && DATA.map(item=>{
                  return (<View style={[styles.listTitleView, {transform: [{ scaleY: -1 },]}]}>
                  <View style={styles.listTitleView} key={'finish_'+moment(item.date).format('YYYY年')}>
                    {item.isShowYear && <Text style={styles.listTitleYearFont}>{moment(item.date).format('YYYY年')}</Text>}
                    <View style={styles.titleList}>
                      <View style={styles.titleTime}>
                        <Text style={styles.listItemTitleFont}>{moment(item.date).format('MM月DD日')}</Text>
                        <Text style={styles.listItemTitleWeekFont}>{getWeekXi(item.date)}</Text>
                      </View>
                      <Text style={styles.titleTimeFont}>共 {item.total > 0 ? getFeeTimeFormat(item.total) : '00:00'}{'’'}</Text>
                    </View>
                  </View>
                  {
                    item.data && item.data.map(pro=>{
                      return (<Swipeable
                        key={pro.id}
                        friction={1}
                        rightThreshold={40}
                        renderRightActions={(progressAnimatedValue) => this.renderRightActions(progressAnimatedValue, pro)}>
                          <FinishPlanItem item={pro}  finishTime={(pro) => this.setFinishTime(pro)} finishTimeEnd={(value, callback)=>this.setFinishTimeEnd(value, callback)} caseList={this.state.caseList} />
                      </Swipeable>)
                    })
                  }
                  </View>)
                  }
                )}
                { refreshing ? <View key={'finish_refresh'} style={[styles.loading, {transform: [
                        { scaleY: -1 },
                      ]}]}>
                        <ActivityIndicator size="small" color="black" />
                      </View> : loadFinish ?  <View key={'finish_finish'} style={[styles.empty, {transform: [
                            { scaleY: -1 },
                          ]}]}>
                            <Text style={styles.emptyFont}>您的过去清清白白~</Text>
                          </View> : null
                }
                </ScrollView>
                {/* <SectionList
                  ref={ (ref) => { this.myListRef = ref } }
                  ListHeaderComponent={null}
                  ListFooterComponent={this.renderFoot}
                  sections={DATA}
                  inverted={true}
                  keyExtractor={(item, index) => item + index}
                  renderItem={this.renderItem}
                  renderSectionFooter={({ section: { date,  total, isShowYear} }) => (
                    <View style={styles.listTitleView} key={'finish_'+moment(date).format('YYYY年')}>
                      {isShowYear && <Text style={styles.listTitleYearFont}>{moment(date).format('YYYY年')}</Text>}
                      <View style={styles.titleList}>
                        <View style={styles.titleTime}>
                          <Text style={styles.listItemTitleFont}>{moment(date).format('MM月DD日')}</Text>
                          <Text style={styles.listItemTitleWeekFont}>{getWeekXi(date)}</Text>
                        </View>
                        <Text style={styles.titleTimeFont}>共 {total > 0 ? getFeeTimeFormat(total) : '00:00'}{'’'}</Text>
                      </View>
                    </View>
                  )}
                  invertStickyHeaders={true}
                  stickySectionHeadersEnabled={true}
                  onEndReachedThreshold={0.3}
                  onEndReached={()=>this.loadMoreDataThrottled()}
                  maxToRenderPerBatch={Common.PAGE_SIZE}
                  // getItemLayout={(data, index) => ( {length: 35, offset: 35 * index, index} )}
                  /> */}
                  </GestureHandlerRootView>
                  }

                <View style={styles.footer}>
                  <Text style={styles.totalTimeFont} onLongPress={this.scollToTop}>{getFeeTimeFormat(totalTime)}{'’'}</Text>
                  <Text style={styles.totalTimeDesFont}>本月  |   {moment(moment().month(moment().month()).startOf('month').valueOf()).format('YYYY.MM.DD')}~{moment(moment().month(moment().month() + 1).startOf('month').valueOf()).format('YYYY.MM.DD')}  计时总计</Text>
                </View>
              </View >
          </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: Common.window.width,
    height: '100%',
    // marginTop: Common.statusBarHeight,
  },
  mask: {
    flex: 1,
    width: Common.window.width,
    height: '100%',
    top: 0,
    backgroundColor: "#fff",
    opacity: 0.4,
    position: 'absolute',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: Common.window.width,
    height: '100%',
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  head: {
    width: Common.window.width,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center",
  },
  gestureStyle: {
    flex: 1,
    width: Common.window.width,
  },
  headFont: {
    fontSize: FontSize(18),
    fontWeight: '500',
    color: '#303133',
  },
  footer: {
    width: Common.window.width,
    height: 75,
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'column',
    alignSelf:'flex-end'
  },
  totalTimeFont: {
    fontSize: FontSize(30),
    fontWeight: '500',
    color: '#606266',
  },
  totalTimeDesFont: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 5,
    color: '#909399'
  },
  listTitleView: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  listTitleYearFont: {
    fontSize: FontSize(18),
    color: '#C0C4CC',
    marginTop: 15,
    marginLeft: 12,
    fontWeight: '500',
  },
  titleList: {
    // marginTop: 15,
    marginLeft: 10,
    display: 'flex',
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleTime:{
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  listItemTitleFont: {
    fontSize: FontSize(18),
    color: '#C0C4CC',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: '500',
    textAlign: 'right'
  },
  listItemTitleWeekFont: {
    fontSize: FontSize(18),
    color: '#C0C4CC',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: '500',
    marginLeft: 10,
  },
  titleTimeFont: {
    fontSize: FontSize(18),
    color: '#C0C4CC',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: '500',
  },
  listItemView: {
    display: 'flex',
    flexDirection: "row",
    backgroundColor: '#F5F7FA',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 1,
    marginBottom: 2,
  },
  waveView: {
    height: 63,
    width: Common.window.width - 20,
    backgroundColor: '#007afe',
    borderRadius: 50,
    position: "absolute",
    top: 0,
  },
  listItemTimeSplit: {
    width: 8,
    height: 25,
    borderRadius: 6,
    marginRight: 10,
  },
  listItemContentView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    flex: 1,
    justifyContent: 'space-between'
  },
  listItemTitle: {
    fontSize: FontSize(19),
    color: '#545454',
    fontWeight: '500',
  },
  listItemContent: {
    fontSize: 15,
    color: '#9C9C9C',
    fontWeight: '500',
  },
  listItemTimeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    width: 70,
    justifyContent: 'space-between'
  },
  listItemTime: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  listItemToatlTime: {
    fontSize: FontSize(25),
    color: '#6B6B6B',
    fontWeight: '500',
  },
  setTimeView: {
    position: 'absolute',
    backgroundColor: '#FE3D2F',
    width: 40,
    height: 40,
    borderRadius: 50,
    right: -3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFont: {
    fontSize: 15,
    color: '#C0C4CC',
    paddingTop: 10,
    paddingBottom: 10,
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
  }
});
