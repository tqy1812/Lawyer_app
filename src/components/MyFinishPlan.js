import React, {Component} from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import moment from 'moment';
import Common from '../common/constants';
import {getWeekXi, getFinishBlankHeight} from '../utils/utils';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IcomoonIcon from "../components/IcomoonIcon";

export default class MyFinishPlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: this.props.isVisible || false,
      DATA: [
        {
          date: "2022-06-07",
          total: '00:26’',
          isShowYear: false,
          data: [{
            caseId: 8,
            startTime: '15:00',
            endTime: '15:30',
            totalTime: '00:30',
            title:'任务名称1',
            content:'这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容',
          },
          {
            caseId: 9,
            startTime: '14:00',
            endTime: '14:30',
            totalTime: '00:30',
            title:'任务名称2',
            content:'这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容',
          }]
        },
        {
          date: "2022-06-06",
          total: '00:26’',
          isShowYear: true,
          data: [{
            caseId: 7,
            startTime: '15:00',
            endTime: '',
            title:'2022-06-06任务名称',
            content:'这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容',
          }]
        },
        {
          date: "2021-06-05",
          total: '00:26’',
          isShowYear: false,
          data: [{
            caseId: 6,
            startTime: '15:00',
            endTime: '15:30',
            totalTime: '00:30',
            title:'2021-06-06任务名称',
            content:'这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容',
          }]
        },
        {
          date: "2021-06-04",
          total: '00:26’',
          isShowYear: false,
          data: [{
            caseId: 12,
            startTime: '15:00',
            endTime: '15:30',
            totalTime: '00:30',
            title:'2021-06-06任务名称',
            content:'这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容',
          }]
        },
        {
          date: "2021-06-03",
          total: '00:26’',
          isShowYear: true,
          data: [{
            caseId: 11,
            startTime: '15:00',
            endTime: '15:30',
            totalTime: '00:30',
            title:'2021-06-06任务名称',
            content:'这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容这是一个任务内容',
          }]
        }
      ]
    };
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
  setFinishTimeEnd = () => {
    if(this.props.finishTimeEnd) {
      this.props.finishTimeEnd();
    }
  }
  render() {
    const { DATA } = this.state;
    const Item = ({ item }) => (
      <View style={styles.listItemView}>
        <View style={[styles.listItemTimeSplit, {backgroundColor: this.props.caseList[item.caseId+''][2],}]}></View>
        <View style={styles.listItemContentView}><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemTitle}>{item.title}</Text><Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.listItemContent}>{item.content}</Text></View>
        <View style={styles.listItemTimeView}>
          <Text style={styles.listItemTime}>{item.startTime} ~ {item.endTime}</Text>
          { item.totalTime && <Text style={styles.listItemToatlTime}>{item.totalTime}</Text>}
          { !item.totalTime && <TouchableOpacity style={styles.setTimeView} onLongPress={() => this.setFinishTime(item)} onPressOut={this.setFinishTimeEnd}><IcomoonIcon name='clock-edit' size={20} color='#fff' /></TouchableOpacity>} 
        </View>
      </View>
    );

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.isVisible}
        onRequestClose={() => {
          this.setModalVisiable(false);
        }}
      >
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.mask}
              onPress={() => {
                this.setModalVisiable(false);
              }}
            />
             <View style={styles.content}>
              <View style={styles.head}><Text style={styles.headFont}>计时</Text></View>
               { getFinishBlankHeight(DATA) >= 100  &&  <View style={styles.empty}><Text style={styles.emptyFont}>您的过去清清白白~</Text></View> }
               {JSON.stringify(this.props.caseList)!='{}' && DATA && DATA.length > 0 && <SectionList
                  ref={ (ref) => { this.myListRef = ref } }
                  ListHeaderComponent={null}
                  ListFooterComponent={null}
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
                  />
                  }
                <View style={styles.footer}>
                  <Text style={styles.totalTimeFont} onLongPress={this.scollToTop}>01:59:00</Text>
                  <Text style={styles.totalTimeDesFont}>本月  |   {moment(moment().month(moment().month()).startOf('month').valueOf()).format('YYYY.MM.DD')}~{moment(moment().month(moment().month() + 1).startOf('month').valueOf()).format('YYYY.MM.DD')}  计时总计</Text>
                </View>
              </View >  
          </View>
      </Modal>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: Common.window.width,
    height: Common.window.height
  },
  mask: {
    marginTop: -50,
    flex: 1,
    width: Common.window.width,
    height: Common.window.height,
    backgroundColor: "#000",
    opacity: 0.4,
    position: 'absolute',
    bottom: 0,
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
    display: 'flex',
    flexDirection: "row",
    backgroundColor: '#F5F7FA',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
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
    fontSize: 26,
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
});