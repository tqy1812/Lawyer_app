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
import {getWeekXi, getFinishBlankHeight, getFeeTimeFormat} from '../utils/utils';
import IcomoonIcon from "./IcomoonIcon";
import Wave from "./Wave";

class FinishPlanItem extends React.Component {
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
    // console.log('.....setFinishTimeEnd===='+value.id)
    // if(!item.end_time) {
      if(this.props.finishTimeEnd) {
        this.props.finishTimeEnd(value, (rs)=>{
            console.log('....................setFinishTimeEnd change=' + JSON.stringify(rs))
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
    // console.log(item)
    return (
      <TouchableOpacity activeOpacity={!item.end_time ? 0.2 : 1} style={styles.listItemView} onLongPress={() => this.setFinishTime(item)}  onPressOut={()=>this.setFinishTimeEnd(item)}>
          <View style={[styles.listItemTimeSplit, {backgroundColor: this.props.caseList[item.case.id+''] ? this.props.caseList[item.case.id+''][2] : '#ff0000'}]}></View>
          <View style={styles.listItemContentView}><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{item.name}</Text><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{item.case.name}</Text></View>
          <View style={styles.listItemTimeView}>
            <Text style={styles.listItemTime}>{item.start_time ? moment(item.start_time).format('HH:mm') : '--:--'} ~ {item.end_time ? moment(item.end_time).format('HH:mm') : ''}</Text>
            { item.end_time && <Text style={styles.listItemToatlTime}>{item.fee_time > 0 ? getFeeTimeFormat(item.fee_time) : '00:00'}</Text>}
            { !item.end_time && <TouchableOpacity style={styles.setTimeView} onLongPress={() => this.setFinishTime(item)} onPressOut={()=>this.setFinishTimeEnd(item)}><IcomoonIcon name='clock-edit' size={20} color='#fff' /></TouchableOpacity>} 
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
  head: {
    width: Common.window.width,
    height: 45,
    justifyContent: "center",
    alignItems: "center"
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
    height: 63,
    width: Common.window.width - 20,
    backgroundColor: '#007afe',
    borderRadius: 50,
    position: "absolute",
    zIndex: 3,
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
    width: 100,
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
export default FinishPlanItem;
