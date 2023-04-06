import React, {Component} from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  Text,
  Overlay,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import {Swipeable, GestureHandlerRootView, RectButton} from 'react-native-gesture-handler';
import moment from 'moment';
import Common from '../common/constants';
import {getWeek, getWeekXi, produce, logger } from '../utils/utils';
import IcomoonIcon from "../components/IcomoonIcon";
import MyButton from "../components/MyButton";
import { showLoading } from "./ShowModal";
import Wave from "./Wave";
const Toast = Overlay.Toast;
export default class MyPlanItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recoding: false,
      item: props.item,
    };
  }

  componentDidMount () {
  }

  changeEnable = (item) => {
    const that = this;
    showLoading();
    this.props.changeEnable(item);
  }

  setFinishTime = (item) => {
    this.setState({recoding: true});
    // if(!item.end_time) {
      if(this.props.finishTime) {
        this.props.finishTime(item);
      }
    // }
  }

  setFinishTimeEnd = (value, callback) => {
    // logger('.....setFinishTimeEnd===='+value.id)
    // if(!item.end_time) {
      if(this.props.finishTimeEnd) {
        this.props.finishTimeEnd(value, (rs)=>{
            logger('....................setFinishTimeEnd change=' + JSON.stringify(rs))
        });
      }
      this.setState({recoding: false});
    // }
  }

  render() {
    const {recoding, item} = this.state;
    //logger(this.props.caseList, this.props.caseList[item.case.id+''][2])
    return (
      <TouchableOpacity style={styles.listItemView} activeOpacity={1} onLongPress={() => this.setFinishTime(item)}  onPressOut={()=>this.setFinishTimeEnd(item)}>
        <View style={styles.listItemTimeView}><Text style={styles.listItemTimeStart}>{item.start_time ? moment(item.start_time).format('HH:mm') : '-- : --'}</Text><Text style={styles.listItemTimeEnd}>{item.end_time ? moment(item.end_time).format('HH:mm') : '-- : --'}</Text></View>
        <View style={[styles.listItemTimeSplit, {backgroundColor: this.props.caseList[item.case.id+''] ? this.props.caseList[item.case.id+''][2] : '#ff0000',}]}></View>
        <View style={styles.listItemRightView}><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{item.name}</Text><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{item.case.name}</Text></View>
        <View style={styles.listItemNoticeView}><MyButton style={styles.setNoticeView} onPress={() => {this.changeEnable(item)}}><IcomoonIcon name='alert_0' size={30} color={item.is_wakeup ? '#007afe' : '#fff'} /></MyButton></View>
        { recoding && <View style={styles.waveView}><Wave height={35} width={6} lineColor={'#fff'}></Wave></View> }
    </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  listItemView: {
    display: 'flex',
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
    marginLeft: 25,
    marginRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  listItemTimeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    width: 67,
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
    fontWeight: '500'
  },
  listItemTimeSplit: {
    width: 6,
    height: 43,
    borderRadius: 6,
    marginRight: 15,
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
    justifyContent: 'space-between',
    marginLeft: 3,
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
  },
  waveView: {
    height: 65,
    width: Common.window.width - 40,
    backgroundColor: '#007afe',
    borderRadius: 5,
    position: "absolute",
    zIndex: 3,
    top: 0,
  },
});
