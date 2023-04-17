import React from 'react';
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
import {getWeekXi, getFinishBlankHeight, getFeeTimeFormat, logger} from '../utils/utils';
import IcomoonIcon from "./IcomoonIcon";
import BaseComponent from './BaseComponent';
import Wave from "./Wave";

class FinishPlanItem extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      recoding: false,
      item: props.item,
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

  setFinishTimeEnd = (value, callback) => {
    // logger('.....setFinishTimeEnd===='+value.id)
    // if(!item.end_time) {
      if(this.props.finishTimeEnd) {
        this.props.finishTimeEnd(value, (rs)=>{
            logger('....................setFinishTimeEnd change=' + JSON.stringify(rs))
            // if(rs && rs.id){
            //   this.setState({item: {...rs, case: this.state.item.case} })
            // }
        });
      }
      this.setState({recoding: false});
    // }
  }

  render() {
    const {recoding, item} = this.state;
    logger('....immutable', item.id)
    return (
      <TouchableOpacity activeOpacity={!item.end_time ? 0.2 : 1} style={styles.listItemView} onLongPress={() => this.setFinishTime(item)}  onPressOut={()=>this.setFinishTimeEnd(item)}>
          <View style={[styles.listItemTimeSplit, {backgroundColor: this.props.caseList[item.case.id+''] ? this.props.caseList[item.case.id+''][2] : '#ff0000'}]}></View>
          <View style={styles.listItemContentView}><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{item.name}</Text><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{item.case.name}</Text></View>
          <View style={styles.listItemTimeView}>
            <Text style={styles.listItemTime}>{item.start_time ? moment(item.start_time).format('HH:mm') : '--:--'} ~ {item.end_time ? moment(item.end_time).format('HH:mm') : ''}</Text>
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
    flex: 1,
    justifyContent: 'space-between'
  },
  listItemTitle: {
    fontSize: 19,
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
    width: 90,
    justifyContent: 'center',
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
    fontSize: 31,
    color: '#6B6B6B',
    fontWeight: '500',
    marginRight: -2,
    lineHeight: 33,
  },
  listItemToatlTime1: {
    fontSize: 33,
    color: '#6B6B6B',
    fontWeight: '500',
    lineHeight: 42,
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
  emptyFont: {
    fontSize: 15,
    color: '#C0C4CC',
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: '500',
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
