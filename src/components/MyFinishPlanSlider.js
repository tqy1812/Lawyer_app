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
import {Swipeable, GestureHandlerRootView, RectButton} from 'react-native-gesture-handler';
import moment from 'moment';
import Common from '../common/constants';
import {getWeekXi, getFinishBlankHeight, getFeeTimeFormat, removeItem, updateFinish} from '../utils/utils';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import actionProcess from "../actions/actionProcess";
import actionCase from "../actions/actionCase";
import IcomoonIcon from "../components/IcomoonIcon";
import FinishPlanItem from "../components/FinishPlanItem";
import MyButton from "./MyButton";
import { destroySibling, showLoading } from "./ShowModal";
import * as Storage from '../common/Storage';

const Toast = Overlay.Toast;
export default class MyFinishPlanSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      totalTime: '00:00’',
      refreshing: false,
      loadFinish: false,
      DATA: props.finishList ?  props.finishList : [],
      caseList: props.caseList
    };
    this.loadMoreDataThrottled = _.throttle(this.loadModeData, 1000, {trailing: false});
    this.loadDataThrottled = _.throttle(this.initList, 1000, {trailing: false});
  }

  componentDidMount () {
    console.log('.......MyFinishPlanSlider componentDidMount')
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
    });
  }

  initList = () => {
    const {dispatch} = this.props;
    const that = this;
    showLoading();
    // that.setState({refreshing: true});
    that.scollToTopNoAni();
    dispatch(actionProcess.reqProcessFinishList(1, undefined, (data, t, isFinish)=>{
      const rs = data.rs;
      if(rs.length > 0) {
        that.setState({page: 2, DATA: rs, totalTime: t, loadFinish: isFinish },()=>{
          setTimeout(()=>{
            destroySibling();
            that.setState({refreshing: false})
          }, 800) 
        });
      } else {
        that.setState({totalTime: t, DATA: [], refreshing: false, loadFinish: isFinish},()=>{
          setTimeout(()=>{
            destroySibling();
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
    let sectionIndex = 0;
    let itemIndex = 0;

    this.myListRef&&this.myListRef.scrollToLocation({
        itemIndex,
        sectionIndex,
        animated: true,
    });
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

  setFinishTimeEnd = (value, callback) => {
    if(this.props.finishTimeEnd) {
      this.props.finishTimeEnd(value, (id, content) => {
        // console.log('.......updateProcess'+ id+ '....' + content)
        this.updateProcess(id, content, (item)=>{
          console.log('.......updateProcess'+ JSON.stringify(item))
          if(moment(item.end_time).diff(moment(new Date())) < 0 && moment(item.start_time).format('YYYY-MM-DD') === moment(value.start_time).format('YYYY-MM-DD')) {
            let temp = updateFinish(this.state.DATA, item);
            let totalTime = this.state.totalTime - value.fee_time + item.fee_time
            this.setState({DATA: temp, totalTime}, ()=>{
              setTimeout(()=>{
                destroySibling();
              },800);
            });
          }
          else {
            this.loadDataThrottled();
          }
          // if(callback) callback(item);
        })
      });
    }
  }

  updateProcess = (id, content, callback) => {
    const { dispatch } = this.props;
    const that = this;
    // that.setState({refreshing: true});
    showLoading();
    dispatch(actionProcess.reqChangeTimesProcess(id, content, (rs, error)=>{
      // destroySibling();
      // console.log(rs)
      if(error) {
        Toast.show(error.info);
      } else if( rs && rs.id) {
         if(callback) callback(rs)
      }
      // that.setState({refreshing: false});
    })); 
  }

  loadModeData = () => {
    const { DATA, page, loadFinish } = this.state;
    const {dispatch} = this.props;
    const that = this;
    console.log('.......loadModeData')
    if (loadFinish || page === 1) {
      return;
    }
    // that.setState({refreshing: true});
    showLoading();
    dispatch(actionProcess.reqProcessFinishList(page, DATA[DATA.length-1], (rs, t, isFinish)=>{
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
        that.setState({page: page + 1, DATA: newDate, totalTime: t, loadFinish: isFinish}, ()=>{
          setTimeout(()=>{
            destroySibling();
            that.setState({refreshing: false});
          }, 800) 
        });
      }
      else {
        that.setState({totalTime: t, refreshing: false, loadFinish: isFinish }, ()=>{
          setTimeout(()=>{
            destroySibling();
            that.setState({refreshing: false})
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
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "确定", onPress: () => {
            showLoading();
            // that.setState({refreshing: true});
            dispatch(actionProcess.reqDeleteProcess(item.id, (rs, error)=>{
              InteractionManager.runAfterInteractions(() => {
                if(error) {
                  Toast.show(error.info);
                  destroySibling();
                  that.setState({refreshing: false})
                }
                else {
                  let temp = removeItem(DATA, item);
                  that.setState({DATA: temp}, ()=>{
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
  render() {
    const { DATA, totalTime, caseList, loadFinish, refreshing } = this.state;
    console.log('................data==='+DATA.length)
    const Item = ({ item }) => (
      <Swipeable
        friction={1}
        rightThreshold={40}
        renderRightActions={(progressAnimatedValue) => this.renderRightActions(progressAnimatedValue, item)}>
          <FinishPlanItem item={item}  finishTime={(item) => this.setFinishTime(item)} finishTimeEnd={(value, callback)=>this.setFinishTimeEnd(value, callback)} caseList={caseList} />
      </Swipeable>
    );

    return (
          <View style={styles.container}>
            {refreshing && <View style={styles.mask}>
              <ActivityIndicator size="large" color="black" />
            </View>}
             <View style={styles.content}>
              <View style={styles.head}><Text style={styles.headFont}>计时</Text></View>
               { DATA && DATA.length == 0  &&  <View style={styles.empty}><Text style={styles.emptyFont}>您的过去清清白白~</Text></View> }
               
               {JSON.stringify(caseList)!='{}' && DATA && DATA.length > 0 && <GestureHandlerRootView style={styles.gestureStyle}><SectionList
                  ref={ (ref) => { this.myListRef = ref } }
                  ListHeaderComponent={null}
                  ListFooterComponent={loadFinish  && <View style={styles.empty}><Text style={styles.emptyFont}>您的过去清清白白~</Text></View>}
                  sections={DATA}
                  inverted={true}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({ item }) => <Item item={item} />}
                  renderSectionFooter={({ section: { date,  total, isShowYear} }) => (
                    <View style={styles.listTitleView}>
                      {isShowYear && <Text style={styles.listTitleYearFont}>{moment(date).format('YYYY年')}</Text>}
                    <View style={styles.titleList}><View style={styles.titleTime}><Text style={styles.listItemTitleFont}>{moment(date).format('MM月DD日')}</Text><Text style={styles.listItemTitleWeekFont}>{getWeekXi(date)}</Text></View><Text style={styles.titleTimeFont}>{total}</Text></View>
                    </View>)}
                  stickySectionHeadersEnabled={true}
                  onEndReachedThreshold={0.2}
                  onEndReached={this.loadMoreDataThrottled}
                  />
                  </GestureHandlerRootView>
                  }
                  
                <View style={styles.footer}>
                  <Text style={styles.totalTimeFont} onLongPress={this.scollToTop}>{getFeeTimeFormat(totalTime)}</Text>
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
    height: 45,
    justifyContent: "center",
    alignItems: "center"
  },
  gestureStyle: {
    flex: 1,
    width: Common.window.width,
  },
  headFont: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#303133'
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
    fontSize: 30,
    fontWeight: 'bold',
    color: '#606266',
  },
  totalTimeDesFont: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#909399'
  },
  listTitleView: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff'
  },
  listTitleYearFont: {
    fontSize: 18,
    color: '#C0C4CC',
    marginTop: 15,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  titleList: {
    marginTop: 15,
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
    fontSize: 18,
    color: '#C0C4CC',
    paddingTop: 5,
    paddingBottom: 5,
    width: 78,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  listItemTitleWeekFont: {
    fontSize: 18,
    color: '#C0C4CC',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  titleTimeFont: {
    fontSize: 18,
    color: '#C0C4CC',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
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
    fontSize: 19,
    color: '#545454',
    fontWeight: 'bold',
  },
  listItemContent: {
    fontSize: 15,
    color: '#9C9C9C',
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
  listItemToatlTime: {
    fontSize: 25,
    color: '#6B6B6B',
    fontWeight: 'bold',
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
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFont: {
    fontSize: 15,
    color: '#C0C4CC',
    paddingTop: 5,
    // paddingBottom: 5,
    fontWeight: 'bold',
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
