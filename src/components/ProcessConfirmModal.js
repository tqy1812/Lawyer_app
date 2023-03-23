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
  TouchableWithoutFeedback
} from 'react-native';
import moment from 'moment';
import Common from '../common/constants';
import { getWeekXi, getHoliday, logger } from '../utils/utils';
import actionProcess from "../actions/actionProcess";
import actionCase from "../actions/actionCase";
import IcomoonIcon from "../components/IcomoonIcon";
import FinishPlanItem from "../components/FinishPlanItem";
import MyButton from "./MyButton";
import { destroySibling, showLoading, destroyConfirmSibling, showToast } from "./ShowModal";
import * as Storage from '../common/Storage';
import platform from "../utils/platform";
import GlobalData from "../utils/GlobalData";
import ModalDropdown from "./ModalDropdown";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { he } from "date-fns/locale";
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
      isIcon: false
    };
  }

  componentDidMount() {
    logger('.......ProcessConfirmModal componentDidMount')

  }


  handleTalkNameChanged(text) {
    let content = text.trim();
    this.setState({ itemName: content });
  }

  handleSubmit = () => {
    const that = this;
    const { dispatch, item } = this.props;
    const { itemNotice, itemName, caseId } = this.state;
    showLoading();
    dispatch(actionProcess.reqSubmitProcess(item.id, itemNotice, itemName, true, caseId, (rs, error) => {
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
render() {
  const { item, caseLists, caseListInfo} = this.props;
  const { itemNotice, itemName, open, isIcon } = this.state;
  logger(caseLists)
  const renderItem = (item) => {
    // logger(item)
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
              <View style={styles.titleTime1}>
                <Text style={styles.listItemTitleFont1}>{moment(item.start_time).format('YYYY年MM月DD日')}</Text>
              </View>
              <View style={styles.listItemTimeView1}>
                <Text style={styles.listItemTimeStart1}>{item.start_time ? moment(item.start_time).format('HH:mm') : '-- : --'}</Text>
                <Text style={styles.listItemTimeStart1}> ~ </Text>
                <Text style={styles.listItemTimeEnd1}>{item.end_time ? moment(item.end_time).format('HH:mm') : '-- : --'}</Text>
              </View>
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
                style={styles.drop}
                textStyle={styles.dropText}
                dropdownStyle={styles.dropdown}
                // dropdownTextStyle={styles.dropdownText}
                // dropdownTextHighlightStyle={styles.dropdownTextHighlight}
                renderRow={(item, index, highlighted) => renderItem(item)}
                renderButtonText={(item) => item.name}
                renderRowText={(item) => item.name}
                renderRightComponent={() => (
                  <View style={styles.iconStyle}>
                  <MaterialCommunityIcons
                    name={isIcon ? 'chevron-down' : 'chevron-up'}
                    color="#606266"
                    size={30}
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
                  { color: "#fff", fontWeight: "bold" }
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
    borderRadius: 5,
    width: Common.window.width - 70,
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
    width: Common.window.width - 95,
    height: 40,
    textAlignVertical: 'center',
  },
  dropdown: {
    width: Common.window.width - 70,
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
    width: Common.window.width - 80,
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
  width: Common.window.width - 80,
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
  fontSize: 16,
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
    right: 0,
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
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    justifyContent: "center",
    alignItems: "center"
  },
  processInfo: {
    width: Common.window.width - 40,
    fontSize: 16,
    color: '#333',
  },
  listTitleView: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 15,
    marginRight: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
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
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    // position: 'absolute',
    // zIndex: 1,
    // left: 0
  },
  listItemTitleFont: {
    fontSize: 18,
    color: '#909399',
    paddingTop: 5,
    paddingBottom: 5,
    // width: 78,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  
  listItemTitleFont1: {
    fontSize: 14,
    color: '#909399',
    // width: 78,
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
  listItemView1: {
    display: 'flex',
    flexDirection: "column",
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
    marginLeft: 15,
    marginRight: 15,
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
    fontSize: 17,
    color: '#606266',
    fontWeight: 'bold',
  },
  listItemTimeStart1: {
    fontSize: 20,
    color: '#606266',
    fontWeight: 'bold',
  },
  listItemTimeEnd: {
    fontSize: 17,
    color: '#909399',
    fontWeight: 'bold',
  },
  listItemTimeEnd1: {
    fontSize: 20,
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
    // position: 'absolute',
    // right: 0
  },
  talkNameInput: {
    height: 30,
    width: Common.window.width - 70,
    borderColor: '#DDD',
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor: '#eee',
    fontSize: 19,
    paddingLeft: 5,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    lineHeight: 24,
    color: '#606266',
    fontWeight: 'bold',
    marginRight: 3,
    marginBottom: 5
  },
  listItemContent: {
    fontSize: 15,
    color: '#909399',
    fontWeight: 'bold',
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
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    marginBottom: 0,
    // shadowColor: "#000000",
    // shadowOpacity: 0.3,
    // shadowOffset: { width: 0, height: -9 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 10,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    zIndex: -1,
  },
  bottomBtnsView: {
    width: Common.window.width / 2 - 50,
    height: 38,
    borderRadius: 100,
    marginTop: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBtnsText: {
    fontSize: 16
  },
});
