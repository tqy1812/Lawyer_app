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
import { logger, FontSize } from '../utils/utils';
import actionProcess from "../actions/actionProcess";
import MyButton from "./MyButton";
import { destroySibling, showLoading, destroyConfirmSibling } from "./ShowModal";
import * as Storage from '../common/Storage';
import GlobalData from "../utils/GlobalData";
const globalData = GlobalData.getInstance();
const Toast = Overlay.Toast;

export default class ProcessTimeConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    logger('.......ProcessTimeConfirmModal componentDidMount')

  }
  componentWillUnmount() {
    // this.loadMoreDataThrottled.cancel();
  }

  handleSubmit = () => {
    const that = this;
    const { dispatch, preItem, item } = this.props;
    showLoading();
    dispatch(actionProcess.updateProcessTime(item.id, item.start_time, item.end_time, (rs, error) => {
      destroySibling();
      if (error) {
        logger(error.info)
        Toast.show(error.info);
      }
      else {
        destroyConfirmSibling();
        this.props.submint && this.props.submint(preItem, item);
      }
    }));
  }
render() {
  const { preItem, item} = this.props;
  return (
    <View style={[styles.modalContainer,{height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}>
      <View style={styles.container}>
       <View style={styles.processInfo}>
          <View style={styles.listTitleView}>
            <View style={styles.titleList1}>
              <Text style={styles.listItemTimeStart1}>时间修改</Text>
            </View>
          </View>
          <View style={styles.listItemView1}>
            <Text style={styles.listItemTimeStart1}>{`活动[${preItem.name}]的时间将改为：`}</Text>
            <Text style={styles.listItemTimeStart1}>{item.start_time ? moment(item.start_time).format('MM-DD HH:mm') : '-- : --'}{' ~ '}{item.end_time ? moment(item.end_time).format('MM-DD HH:mm') : '-- : --'}</Text>
          </View>
        </View>
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
    fontSize: FontSize(16),
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
    flexDirection: 'row',
    // position: 'absolute',
    // zIndex: 1,
    // left: 0
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
    // width: 78,
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
    fontSize: FontSize(17),
    color: '#606266',
    fontWeight: '500',
    textAlign: 'left',
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
  },
  talkNameInput: {
    height: 30,
    width: Common.window.width - 70,
    borderColor: '#DDD',
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor: '#eee',
    fontSize: FontSize(19),
    textAlign: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 5,
    paddingLeft: 5,
    lineHeight: 24,
    color: '#606266',
    fontWeight: '500',
    marginRight: 3,
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
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    marginBottom: 0,
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
    fontSize: FontSize(16)
  },
});
