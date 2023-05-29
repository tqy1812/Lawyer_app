import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  Text,
  InteractionManager,
  ActivityIndicator,
  Animated,
  TouchableOpacity
} from 'react-native';
import moment from 'moment';
import Common from '../common/constants';
import {getWeekXi, getFinishBlankHeight, getFeeTimeFormat, logger, FontSize, formatZeroTime} from '../utils/utils';
import IcomoonIcon from "./IcomoonIcon";
import Wave from "./Wave";
import Immutable from 'immutable';

class FinishPlanItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recoding: false,
    };
    this.lastClickTime=0;
  }

  setFinishTime = (item) => {
    this.setState({recoding: true});
    // if(!item.end_time) {
      if(this.props.finishTime) {
        this.props.finishTime(item);
      }
    // }
  }
  shouldComponentUpdate(nextProps, nextState) {
    let mapState = Immutable.fromJS(this.state);
    let mapNextState = Immutable.fromJS(nextState);
    let mapProps = Immutable.fromJS(this.props.item);
    let mapNextProps = Immutable.fromJS(nextProps.item);
    // logger('props='+!Immutable.is(mapProps, mapNextProps), 'state='+!Immutable.is(mapState, mapNextState))
    if (!Immutable.is(mapProps, mapNextProps) || !Immutable.is(mapState, mapNextState)) {
      return true;
    }
    return false;
  }
  setFinishTimeEnd = (value, callback) => {
    // logger('.....setFinishTimeEnd===='+value.id)
    // if(!item.end_time) {
      if(this.props.finishTimeEnd) {
        this.props.finishTimeEnd(value, (rs)=>{
            logger('....................setFinishTimeEnd change=' + JSON.stringify(rs))
            // let item = JSON.parse(JSON.stringify(this.state.item));
            // item.wakeup_time = rs.wakeup_time;
            // item.start_time = rs.start_time;
            // item.end_time = rs.end_time;
            // item.fee_time = rs.fee_time;
            // this.setState({item: item})
        });
      }
      this.setState({recoding: false});
    // }
  }

  render() {
    const {recoding} = this.state;
    const {item} = this.props;
    logger('....immutable', item.id)
    return (
      <TouchableOpacity activeOpacity={!item.end_time ? 0.2 : 1} style={[styles.listItemView, {transform: [
        { scaleY: -1 },
      ]}]} onLongPress={() => this.setFinishTime(item)}  onPressOut={()=>this.setFinishTimeEnd(item)}>
          <View style={[styles.listItemTimeSplit, {backgroundColor: this.props.caseList[item.case.id+''] ? this.props.caseList[item.case.id+''][2] : '#ff0000'}]}></View>
          <View style={styles.listItemContentView}><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{item.name}</Text><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{item.case.name}</Text></View>
          <View style={styles.listItemTimeView}>
            <Text style={styles.listItemTime}>{item.start_time ? moment(item.start_time).format('HH:mm') : '--:--'} ~ {item.end_time ? formatZeroTime(item.start_time, item.end_time) : '--:--'}</Text>
            { item.end_time && <Text style={styles.listItemToatlTime}>{getFeeTimeFormat(item.fee_time)}</Text>}
            { !item.end_time && <TouchableOpacity style={styles.setTimeView} onLongPress={() => this.setFinishTime(item)} onPressOut={()=>this.setFinishTimeEnd(item)}><IcomoonIcon name='clock-edit' size={20} color='#fff' /></TouchableOpacity>}
          </View>
          <View style={styles.listItemTimeView1}>
            <Text style={styles.listItemTime1}></Text>
            { item.end_time && <Text style={styles.listItemToatlTime1}>{'’'}</Text>}
          </View>
          { recoding && <View style={styles.waveView}><Wave height={35} width={6} lineColor={'#fff'}></Wave></View> }
        </TouchableOpacity >
      )
  }
}
const styles = StyleSheet.create({
  mask: {
    flex: 1,
    width: Common.window.width,
    height: Common.window.height - 100,
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
    height: Common.window.height-100,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    display: 'flex',
    flexDirection: 'column'
  },
  listTitleView: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff'
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
  listItemView: {
    width: Common.window.width - 20,
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
    height: 65,
    width: Common.window.width - 20,
    backgroundColor: '#007afe',
    borderRadius: 50,
    position: "absolute",
    zIndex: 3,
    top: 0,
  },
  listItemTimeSplit: {
    width: 8,
    height: 28,
    borderRadius: 6,
    marginRight: 10,
  },
  listItemContentView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    flex: 1,
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  listItemTitle: {
    fontSize: FontSize(19),
    lineHeight: 22,
    color: '#545454',
    fontWeight: '500',
  },
  listItemContent: {
    fontSize: FontSize(15),
    color: '#9C9C9C',
    fontWeight: '500',
  },
  listItemTimeView: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    width: 90,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  listItemTimeView1: {
    display: 'flex',
    flexDirection: 'column',
    height: 45,
    width: 15,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  listItemTime: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  
  listItemTime1: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  listItemToatlTime: {
    fontSize: FontSize(29),
    color: '#6B6B6B',
    fontWeight: '500',
    marginRight: -2,
    lineHeight: 33,
  },
  listItemToatlTime1: {
    fontSize: FontSize(30),
    color: '#6B6B6B',
    fontWeight: '500',
    lineHeight: 39,
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
    flex: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
export default FinishPlanItem;
