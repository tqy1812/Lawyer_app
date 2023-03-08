import React, {Component} from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  SectionList,
  InteractionManager,
} from 'react-native';
import moment from 'moment';
import Common from '../common/constants';
import {getWeek, getWeekXi, getHoliday, logger} from '../utils/utils';
import actionProcess from "../actions/actionProcess";
import actionCase from "../actions/actionCase";
/**
 * 通用弹出框，包括居中弹出框和底部弹出框
 * @param {Boolean} isVisible 控制是否可见
 */
export default class MyPlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      isVisible: this.props.isVisible || false,
      DATA: []
    };
    this.loadMoreDataThrottled = _.throttle(this.loadModeData, 500, {trailing: false});
  }

  setModalVisiable(state) {
    this.setState({
      isVisible: state
    });
    if(!state && this.props.close){
      this.props.close();
    }
  }

  componentWillReceiveProps(newProps) {
    if (!_.isEmpty(this.props, newProps)) {
      if (this.state.isVisible != newProps.isVisible) {
        this.setState({
          isVisible: newProps.isVisible
        });
      }
    }
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions(() => {
      const {dispatch, caseList} = this.props;
      const { page } = this.state;
      const that = this;
      // if (JSON.stringify(caseList)==='{}') {
      //   dispatch(actionCase.reqCaseList());
      // }
      dispatch(actionProcess.reqProcessPlanList(1, undefined, (data)=>{
        let todayItem = {
          date: moment(new Date()).format('YYYY-MM-DD'),
          isFestival: true,
          isShowYear: false,
          data: [{
            start_time: '',
          }]
        };
        const rs = data.rs;
        if(rs.length > 0) {
          if(!moment(rs[0].date).isSame(moment(), "day")) {
            rs.unshift(todayItem);
          }
          that.setState({page: page + 1,  DATA: rs});
        }
        else {
          that.setState({DATA: [todayItem]});
        }
      }));
    });
  }

  componentWillUnmount() {
    this.loadMoreDataThrottled.cancel();
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

  loadModeData = () => {
    const { DATA, page } = this.state;
    const {dispatch} = this.props;
    const that = this;
    dispatch(actionProcess.reqProcessPlanList(page, DATA[DATA.length - 1], (rs)=>{
      let flag = false;
      if(rs.last){
        DATA[DATA.length - 1] = rs.last;
        flag = true;
      }
      if(rs.rs.length > 0) {
        DATA =  DATA.concat(rs)
        flag = true;
      }
      if (flag) {
        that.setState({page: page + 1, DATA: DATA});
      }

    }));
  }
  render() {
    const {DATA} = this.state;
    logger(DATA)
    const Item = ({ item }) => item.wakeup_time ? (
      <View style={styles.listItemView}>
        <View style={styles.listItemTimeView}><Text style={styles.listItemTimeStart}>{item.start_time ? moment(item.start_time).format('HH:mm') : '-- : --'}</Text><Text style={styles.listItemTimeEnd}>{item.end_time ? moment(item.end_time).format('HH:mm') : '-- : --'}</Text></View>
        <View style={[styles.listItemTimeSplit, {backgroundColor: this.props.caseList[item.case.id+''] ? this.props.caseList[item.case.id+''][2] : '#ff0000'}]}></View>
        <View style={styles.listItemRightView}><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{item.name}</Text><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{item.description}</Text></View>
      </View>
    ) : (<View style={styles.empty}><Text style={styles.emptyFont}>未来的日子只有假期~</Text></View>);


    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.isVisible}
        onRequestClose={() => {
          this.setModalVisiable(false);
        }}
      >
        <View style={styles.bottomModalContainer}>
            <TouchableOpacity
              style={styles.bottomMask}
              onPress={() => {
                this.setModalVisiable(false);
              }}
            />
            <View style={styles.bottomContent}>
                <View style={styles.title}><Text style={styles.titleFont} onLongPress={this.scollToTop}>计划</Text></View>
                <View style={styles.subTitle}><Text style={styles.subTitleFont}>{moment(new Date()).format('YYYY年MM月DD日')} {getWeek(new Date())}</Text></View>
                {JSON.stringify(this.props.caseList)!='{}' && DATA && DATA.length > 0 && <SectionList
                  ref={ (ref) => { this.myPlanListRef = ref } }
                  ListHeaderComponent={null}
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
                />
                }
            </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  bottomModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: Common.window.width,
    height: Common.window.height
  },
  bottomMask: {
    flex: 1,
    width: Common.window.width,
    marginBottom: -9,
    backgroundColor: "#000",
    opacity: 0.4,
  },
  bottomContent: {
    width: Common.window.width,
    height: Common.window.height -100,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 5,
    display: 'flex',
    flexDirection: 'column'
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
    width: 78,
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
    height: 80,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
});
