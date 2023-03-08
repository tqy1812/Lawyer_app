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
import { getWeekXi, getHoliday } from '../utils/utils';
import actionProcess from "../actions/actionProcess";
import actionCase from "../actions/actionCase";
import IcomoonIcon from "../components/IcomoonIcon";
import FinishPlanItem from "../components/FinishPlanItem";
import MyButton from "./MyButton";
import { destroySibling, showLoading, destroyConfirmSibling, showToast } from "./ShowModal";
import * as Storage from '../common/Storage';
import platform from "../utils/platform";
import GlobalData from "../utils/GlobalData";

const globalData = GlobalData.getInstance();
const Toast = Overlay.Toast;

export default class ProcessConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.isTouchMaskToClose = !!JSON.stringify(props.isTouchMaskToClose)
      ? this.props.isTouchMaskToClose
      : false;
    this.state = {
      itemNotice: props.item.is_wakeup || false,
      itemName: props.item.name,
    };
  }

  componentDidMount() {
    console.log('.......ProcessConfirmModal componentDidMount')

  }


  handleTalkNameChanged(text) {
    let content = text.trim();
    this.setState({ itemName: content });
  }

  handleSubmit = () => {
    const that = this;
    const { dispatch, item } = this.props;
    const { itemNotice, itemName } = this.state;
    showLoading();
    dispatch(actionProcess.reqSubmitProcess(item.id, itemNotice, itemName, true, (rs, error) => {
      destroySibling();
      if (error) {
        console.log(error.info)
        Toast.show(error.info);
      }
      else {
        destroyConfirmSibling();
        this.props.submint && this.props.submint();
      }
    }));
  }


render() {
  const { item, caseList } = this.props;
  const { itemNotice, itemName } = this.state;
  return (
    <View style={styles.modalContainer}>
      
      <View style={styles.container}>
        {caseList && item && item.id && JSON.stringify(caseList) != '{}' && <View style={styles.processInfo}>
          <View style={styles.listTitleView}>
            <View style={styles.titleList}><View style={styles.titleTime}><Text style={styles.listItemTitleFont}>{moment(item.start_time).format('MM月DD日')}</Text><Text style={styles.listItemTitleWeekFont}>{getWeekXi(item.start_time)}</Text></View>{<Text style={styles.titleTodayFont1}>{getHoliday(item.start_time)}</Text>}</View>
          </View>
          <View style={styles.listItemView}>
            <View style={styles.listItemTimeView}><Text style={styles.listItemTimeStart}>{item.start_time ? moment(item.start_time).format('HH:mm') : '-- : --'}</Text><Text style={styles.listItemTimeEnd}>{item.end_time ? moment(item.end_time).format('HH:mm') : '-- : --'}</Text></View>
            <View style={[styles.listItemTimeSplit, { backgroundColor: caseList[item.case.id + ''][2], }]}></View>
            <View style={styles.listItemRightView}>
              {/* <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{item.name}</Text> */}
              <TextInput
                ref={(r) => this.item_name = r}
                placeholder='内容'
                placeholderTextColor='#999'
                style={styles.talkNameInput}
                onChangeText={this.handleTalkNameChanged.bind(this)}
                value={itemName}
              />
              <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{item.case.name}</Text>
            </View>
            <View style={styles.listItemNoticeView}><MyButton style={styles.setNoticeView} onPress={() => { this.setState({ itemNotice: !this.state.itemNotice }) }}><IcomoonIcon name='alert_0' size={30} color={itemNotice ? '#007afe' : '#fff'} /></MyButton></View>
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
                { borderWidth: 0.5, borderColor: "#999" }
              ]}
            >
              <Text
                style={[
                  styles.bottomBtnsText,
                  { color: "#333", fontFamily: "PingFangSC-Light" }
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
                  backgroundColor: "#417EFF",
                  borderWidth: 0.5,
                  borderColor: "#417EFF"
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
  modalContainer: {
    position: 'absolute',
    width: Common.window.width,
    backgroundColor: 'rgba(0,0,0,0.3)',
    height: Common.window.height,
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
  titleTime: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
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
  listItemRightView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    flex: 1,
    justifyContent: 'space-between'
  },
  listItemNoticeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    justifyContent: 'space-between',
  },
  talkNameInput: {
    height: 30,
    flex: 1,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#eee',
    fontSize: 19,
    padding: 0,
    lineHeight: 24,
    color: '#606266',
    fontWeight: 'bold',
    marginRight: 3,
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
