import React, { Component } from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  Text,
  InteractionManager,
  Alert,
  Overlay,
  TextInput,
  TouchableWithoutFeedback,
  Image
} from 'react-native';
import moment from 'moment';
import Common from '../common/constants';
import { getWeekXi, getHoliday, logger, FontSize } from '../utils/utils';
import actionProcess from "../actions/actionProcess";
import actionCase from "../actions/actionCase";
import IcomoonIcon from "../components/IcomoonIcon";
import FinishPlanItem from "../components/FinishPlanItem";
import MyButton from "./MyButton";
import { destroySibling, showModal, showLoading, destroyConfirmSibling, showToast } from "./ShowModal";
import * as Storage from '../common/Storage';
import platform from "../utils/platform";
import GlobalData from "../utils/GlobalData";
import ModalDropdown from "./ModalDropdown";
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcons from 'react-native-vector-icons/Feather';
import { he } from "date-fns/locale";
import {DatePicker} from "react-native-common-date-picker";
import TimePicker from '../components/TimePicker/timePicker/TimePicker';
import ImageArr from '../common/ImageArr';
const globalData = GlobalData.getInstance();
const Toast = Overlay.Toast;

export default class ProcessConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemNotice: props.item.is_wakeup || true,
      itemName: props.item.name,
      caseId: props.item.case && props.item.case.id,
      open: false,
      isIcon: false,
      caseListInfo: props.caseListInfo,
      itemDate: moment(props.item.start_time).format('YYYY-MM-DD'),
      itemDateStr: moment(props.item.start_time).format('YYYY年MM月DD日'),
      itemStartTimeStr: props.item.start_time ? moment(props.item.start_time).format('HH:mm') : '-- : --',
      itemEndTimeStr: props.item.end_time ? moment(moment(props.item.end_time).format('YYYY-MM-DD 00:00:00')).diff(moment(moment(props.item.start_time).format('YYYY-MM-DD 00:00:00')), "days")==1 ? '24:00' : moment(props.item.end_time).format('HH:mm') : '-- : --',
      // page: 1,
      // totalSize:  props.caseListInfo ? props.caseListInfo.length : 0
    };
    // this.loadMoreDataThrottled = _.throttle(this.getMoreData, 1000, {trailing: false});
  }

  componentDidMount() {
    logger('.......ProcessConfirmModal componentDidMount')

  }
  componentWillUnmount() {
    // this.loadMoreDataThrottled.cancel();
  }
  // getMoreData = () => {
  //   const {page, totalSize} = this.state;
  //   let totalPage = Math.ceil(totalSize /10);
  //   logger('start caselist getMoreData', page)
  //   if(totalPage > 1 && page + 1 <= totalPage) {
  //     let size = page + 1;
  //     logger('start caselist getMoreData', 10 * size)
  //     this.setState({caseListInfo: this.props.caseListInfo.slice(0, 10 * size), page: size});
  //   }
  //   else{
  //     logger('load finish')
  //   }
  // }

  handleTalkNameChanged(text) {
    let content = text.trim();
    this.setState({ itemName: content });
  }

  handleSubmit = () => {
    const that = this;
    const { dispatch, item } = this.props;
    const { itemNotice, itemName, caseId, itemDate, itemStartTimeStr, itemEndTimeStr } = this.state;
    let endTime = '';
    if(itemEndTimeStr=='24:00'){
      endTime = moment(itemDate).add(1, "days").format("YYYY-MM-DD 00:00:00")
    }
    else{
      endTime = itemDate + " " +itemEndTimeStr+":00";
    }
    showLoading();
    dispatch(actionProcess.reqSubmitProcess(item.id, itemNotice, itemName, true, caseId, itemDate + " " +itemStartTimeStr+":00", endTime, (rs, error) => {
      destroySibling();
      if (error) {
        logger(error.info)
        Toast.show(error.info);
      }
      else {
        destroyConfirmSibling();
        this.props.submint && this.props.submint(item);
      }
    }));
  }
  setIsIcon = (value) => {
    this.setState({isIcon: value})
  }

  handleSelect = (id, item) => {
    logger(item)
    if(item && item.id) {
      this.setState({caseId: item.id})
    }
  }

  showConfirm = () => {
    const {itemDate} = this.state;
    showModal(<View style={[styles.modalContainer,{height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}>
    <View style={[styles.container,{paddingBottom: 9,paddingTop: 3}]}>
    <DatePicker
      width={Common.window.width - 30}
      titleText='更改日期'
      confirmText='应用'
      cancelText='取消'
      titleStyle={{color:'#000', fontSize: 18}}
      toolBarStyle={{borderTopRightRadius: 18, borderTopLeftRadius: 18, borderBottomColor: '#d3d3d3', borderBottomWidth: 1}}
      toolBarConfirmStyle={{color:'#007afe', fontSize: 16}}
      toolBarCancelStyle={{fontSize: 16}}
      yearSuffix='年'
      monthSuffix='月'
      daySuffix='日'
      confirm={date => {
          this.setState({itemDate: date, itemDateStr: moment(date).format('YYYY年MM月DD日')}, ()=>{
            destroySibling();
          });
      }}
      cancel={
        ()=>{
          destroySibling();
        }
      }
      selectedTextFontSize={18}
      maxDate={(moment().year()+3)+'-12-31'}
      defaultDate={itemDate}
      unselectedRowBackgroundColor='transparent'
  /></View></View>);
  }


  showTimeConfirm = () => {
    const {itemStartTimeStr, itemEndTimeStr} = this.state;
    showModal(<View style={[styles.modalContainer,{height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}>
    <View style={[styles.container,{paddingBottom: 9,paddingTop: 3}]}>
    <TimePicker
          width={Common.window.width - 30}
          titleText='更改时刻'
          confirmText='应用'
          cancelText='取消'
          titleStyle={{color:'#000', fontSize: 18}}
          toolBarStyle={{borderTopRightRadius: 18, borderTopLeftRadius: 18, borderBottomColor: '#d3d3d3', borderBottomWidth: 1}}
          toolBarConfirmStyle={{color:'#007afe', fontSize: 16}}
          toolBarCancelStyle={{fontSize: 16}}
          hourSuffix='时'
          minuteSuffix='分'
          confirm={date => {
              this.setState({itemStartTimeStr: date[0], itemEndTimeStr: date[1]}, ()=>{
                destroySibling();
              });
          }}
          cancel={
            ()=>{
              destroySibling();
            }
          }
          defaultStartTime={itemStartTimeStr}
          defaultEndTime={itemEndTimeStr=='24:00'? '23:59' : itemEndTimeStr}
          selectedTextFontSize={18}
          unselectedRowBackgroundColor='transparent'
        /></View></View>);
  }
render() {
  const { item, caseLists} = this.props;
  const { itemNotice, itemName, open, isIcon, caseListInfo, itemDateStr, itemStartTimeStr, itemEndTimeStr } = this.state;
  // logger('caseListInfo......', caseListInfo)
  const renderItem = (item) => {
    // logger('....renderItem',item)
    return (
    <View style={styles.caseItem}>
      <View style={[styles.caseItemBadge, {backgroundColor: caseLists[item.id+''] ? caseLists[item.id+''][2]: '#ff0000'}]}></View>
      <Text style={styles.caseItemName} numberOfLines={1} ellipsizeMode={'tail'}>{item.name}</Text>
    </View>
  )};
  return (
    <View style={[styles.modalContainer,{height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}>
      <View style={styles.container}>
        {caseLists && JSON.stringify(caseLists) != '{}' && <View style={styles.processInfo}>
          <View style={styles.listTitleView}>
            <View style={styles.titleList1}>
              <MyButton style={styles.titleTime1} onPress={this.showConfirm.bind(this)}>
                <Text style={styles.listItemTitleFont1}>{itemDateStr.substring(0, 5)}</Text>
                <Text style={styles.listItemTitleFont1}>{itemDateStr.substring(5, itemDateStr.length)}</Text>
              </MyButton>
              <MyButton style={styles.listItemTimeView1} onPress={this.showTimeConfirm.bind(this)}>
                <Text style={styles.listItemTimeStart1}>{itemStartTimeStr}</Text>
                <Text style={styles.listItemTimeStart1}> ~ </Text>
                <Text style={styles.listItemTimeEnd1}>{itemEndTimeStr}</Text>
              </MyButton>
              <View style={styles.listItemNoticeView1}><MyButton style={styles.setNoticeView} onPress={() => { this.setState({ itemNotice: !this.state.itemNotice }) }}><IcomoonIcon name='alert_0' size={30} color={itemNotice ? '#007afe' : '#fff'} /></MyButton></View>
            </View>
          </View>
            {/*<View style={styles.listTitleView}>*/}
            {/*  <View style={styles.titleList}><View style={styles.titleTime}><Text style={styles.listItemTitleFont}>{moment(item.start_time).format('MM月DD日')}</Text><Text style={styles.listItemTitleWeekFont}>{getWeekXi(item.start_time)}</Text></View>{<Text style={styles.titleTodayFont1}>{getHoliday(item.start_time)}</Text>}</View>*/}
            {/*</View>*/}
          <View style={styles.listItemView1}>
            {/* <View style={styles.listItemTimeView}><Text style={styles.listItemTimeStart}>{item.start_time ? moment(item.start_time).format('HH:mm') : '-- : --'}</Text><Text style={styles.listItemTimeEnd}>{item.end_time ? moment(item.end_time).format('HH:mm') : '-- : --'}</Text></View>
            <View style={[styles.listItemTimeSplit, { backgroundColor: caseLists[item.case.id + ''][2], }]}></View> */}
            {/* <View style={styles.listItemRightView}> */}
              {/* <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{item.name}</Text> */}
              <TextInput
                ref={(r) => this.item_name = r}
                placeholder='内容'
                placeholderTextColor='#999'
                style={styles.talkNameInput}
                onChangeText={this.handleTalkNameChanged.bind(this)}
                value={itemName}
              />
              <ModalDropdown
                style={[styles.drop, isIcon ? {borderBottomRightRadius: 0,borderBottomLeftRadius: 0,} :  {borderBottomRightRadius: 5,borderBottomLeftRadius: 5,}]}
                textStyle={styles.dropText}
                dropdownStyle={styles.dropdown}
                // dropdownTextStyle={styles.dropdownText}
                // dropdownTextHighlightStyle={styles.dropdownTextHighlight}
                renderRow={(item, index, highlighted) => renderItem(item)}
                renderButtonText={(item) => item.name}
                caseLists={caseLists}
                renderRowText={(item) => item.name}
                renderRightComponent={() => (
                  <View style={styles.iconStyle}>
                    <FeatherIcons
                      name={isIcon ? 'chevron-down' : 'chevron-up'}
                      color="#606266"
                      size={27}
                    />
                  </View>
                )}
                options={caseListInfo ? caseListInfo : []}
                defaultValue={item.case && item.case.name}
                onSelect={(id, item)=> this.handleSelect(id, item)}
                onDropdownWillShow={() => {
                  this.setIsIcon(true);
                  // dataInit && dataInit();
                }}
                onDropdownWillHide={() => this.setIsIcon(false)}
                renderRowProps={{activeOpacity: 1, underlayColor: '#ffffff00'}}
                // dropdownListProps = {{
                //   onEndReachedThreshold: 0.2,
                //   onEndReached: this.loadMoreDataThrottled
                // }}
              />
              {/* <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{item.case.name}</Text> */}
            {/* </View> */}
            {/* <View style={styles.listItemNoticeView}><MyButton style={styles.setNoticeView} onPress={() => { this.setState({ itemNotice: !this.state.itemNotice }) }}><IcomoonIcon name='alert_0' size={30} color={itemNotice ? '#007afe' : '#fff'} /></MyButton></View> */}
          </View>
        </View>
        }
        <View style={styles.centerBtns}>
          <MyButton
            onPress={() => {
              destroyConfirmSibling();
              this.props.close && this.props.close();
            }}
          >
            <View
              style={[
                styles.bottomBtnsView,
                { borderWidth: 0, backgroundColor: "#BFBFBF" }
              ]}
            >
              <Text
                style={[
                  styles.bottomBtnsText,
                  { color: "#fff", fontFamily: "PingFangSC-Light" }
                ]}
              >
                取消
              </Text>
            </View>
          </MyButton>
          <MyButton onPress={this.handleSubmit.bind(this)}>
            <View
              style={[
                styles.bottomBtnsView,
                {
                  backgroundColor: "#007AFE",
                  borderWidth: 0,
                  borderColor: "#007AFE"
                }
              ]}
            >
              <Text
                style={[
                  styles.bottomBtnsText,
                  { color: "#fff", fontWeight: "500" }
                ]}
              >
                确认
              </Text>
            </View>
          </MyButton>
        </View>
      </View>
    </View>
  );
}
}
const styles = StyleSheet.create({
  dropView: {
    width: Common.window.width - 70,
    height: 40,
    position: 'relative'
  },
  drop: {
    justifyContent: 'center',
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    width: Common.window.width - 54,
    borderWidth: 0,
    height: 40,
    paddingLeft: 5,
    backgroundColor: '#E9E9EB',
    position:'relative',
    // backgroundColor: '#ff0000'
  },
  dropText: {
    fontSize: 15,
    lineHeight: 40,
    color: '#606266',
    width: Common.window.width - 79,
    height: 40,
    textAlignVertical: 'center',
  },
  dropdown: {
    width: Common.window.width - 54,
    minHeight: 100,
    alignItems: 'center',
    backgroundColor: '#E9E9EB',
    paddingBottom: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 0
  },
  dropdownText: {
    fontSize: 15,
    width: Common.window.width - 64,
    textAlign: 'center',
    color: '#606266',
    borderRadius: 5,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: '#fff',
    textAlign: 'left'
  },
  
caseItem: {
  width: Common.window.width - 64,
  padding: 5,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignContent: 'center',
  borderRadius: 5,
  marginTop: 5,
  marginLeft: 5,
  marginRight: 5,
  backgroundColor: '#fff',
},
caseItemBadge: {
  width: 25,
  height: 25,
  borderRadius: 5,
  alignSelf: 'center'
},
caseItemName:{
  color: '#606266',
  fontSize: FontSize(16),
  lineHeight: 25,
  marginLeft: 5,
  marginRight: 15,
},
  dropdownTextHighlight: {
    flex: 1,
    backgroundColor: '#E9E9EB',
    color: '#606266',
  },
  iconStyle: {
    position: 'absolute',
    right: 2,
  },
  modalContainer: {
    position: 'absolute',
    width: Common.window.width,
    backgroundColor: 'rgba(0,0,0,0.3)',
    top: 0,
    zIndex: 4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: Common.window.width - 30,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 31,
    borderTopRightRadius: 31,
    borderBottomLeftRadius: 31,
    borderBottomRightRadius: 31,
    justifyContent: "center",
    alignItems: "center"
  },
  processInfo: {
    width: Common.window.width - 54,
    fontSize: FontSize(16),
    color: '#333',
  },
  listTitleView: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 5,
    marginRight: 5,
    paddingTop: 5,
    // paddingBottom: 5,
    // borderBottomWidth: 1,
    // borderBottomColor: '#C7C7C7',
  },
  titleList: {
    marginTop: 5,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
    display: 'flex',
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleList1: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45
  },
  titleTime: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  titleTime1: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent:'center',
    alignItems:'flex-start',
    position: 'absolute',
    zIndex: 1,
    left: 0
  },
  listItemTitleFont: {
    fontSize: FontSize(18),
    color: '#909399',
    paddingTop: 5,
    paddingBottom: 5,
    // width: 78,
    fontWeight: '500',
    textAlign: 'right'
  },
  
  listItemTitleFont1: {
    fontSize: 14,
    color: '#909399',
    lineHeight: 19
  },
  listItemTitleWeekFont: {
    fontSize: FontSize(18),
    color: '#909399',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: '500',
    marginLeft: 10,
  },
  titleTodayFont1: {
    fontSize: 15,
    color: '#007afe',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: '500',
  },
  listItemView1: {
    display: 'flex',
    flexDirection: "column",
    // borderBottomWidth: 1,
    // borderBottomColor: '#C7C7C7',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    height: 95,
  },
  listItemTimeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    justifyContent: 'space-between'
  },
  listItemTimeView1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  listItemTimeStart: {
    fontSize: FontSize(17),
    color: '#606266',
    fontWeight: '500',
  },
  listItemTimeStart1: {
    fontSize: FontSize(20),
    color: '#606266',
    fontWeight: '500',
  },
  listItemTimeEnd: {
    fontSize: FontSize(17),
    color: '#909399',
    fontWeight: '500',
  },
  listItemTimeEnd1: {
    fontSize: FontSize(20),
    color: '#909399',
    fontWeight: '500',
  },
  listItemTimeSplit: {
    width: 6,
    height: 43,
    borderRadius: 6,
    marginLeft: 10,
    marginRight: 10,
  },
  listItemRightView: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between'
  },
  listItemNoticeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    justifyContent: 'space-between',
  },
  
  listItemNoticeView1: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    position: 'absolute',
    right: 0
  },
  talkNameInput: {
    // height: 30,
    padding: 5,
    width: Common.window.width - 54,
    // borderColor: '#DDD',
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor: '#eee',
    fontSize: FontSize(19),
    textAlign: 'center',
    lineHeight: 24,
    color: '#606266',
    fontWeight: '500',
    marginBottom: 5
  },
  listItemContent: {
    fontSize: 15,
    color: '#909399',
    fontWeight: '500',
    marginTop: 2,
  },
  setNoticeView: {
    backgroundColor: '#eee',
    width: 40,
    height: 40,
    borderRadius: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  centerBtns: {
    width: Common.window.width - 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginBottom: 0,
    // shadowColor: "#000000",
    // shadowOpacity: 0.3,
    // shadowOffset: { width: 0, height: -9 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 10,
    borderBottomLeftRadius: 31,
    borderBottomRightRadius: 31,
    zIndex: -1,
  },
  bottomBtnsView: {
    width: Common.window.width / 2 - 50,
    height: 38,
    borderRadius: 38,
    marginTop: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBtnsText: {
    fontSize: FontSize(16)
  },
  avatar: {
    width: 20,
    height: 20,
  }
});
