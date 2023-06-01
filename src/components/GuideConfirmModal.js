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
import MyButton from "./MyButton";
import * as Storage from '../common/Storage';
import GlobalData from "../utils/GlobalData";
import { destroySibling } from "./ShowModal";
const globalData = GlobalData.getInstance();
const Toast = Overlay.Toast;

export default class GuideConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    logger('.......GuideConfirmModal componentDidMount')
  }
  handleSubmit = () => {
    Storage.setIsFirshGuide('1');
    this.props.close && this.props.close();
  }
render() {
  const { preItem, item} = this.props;
  return (
    <View style={[styles.modalContainer,{height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}>
      <View style={styles.container}>
        <View style={styles.listTitleView}>
          <View style={styles.titleList}>
            <Text style={styles.listItemTimeStart}>教学引导可在以下路径查阅:</Text>
          </View>
          <Text style={styles.listItemTimeStart1}>
            [个人中心]-[关于律时与帮助]-[使用引导]
          </Text>
        </View>
        <View style={styles.centerBtns}>
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
                哦
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
    backgroundColor: 'rgba(0,0,0,0.1)',
    top: 0,
    zIndex: 8,
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
    padding: 15,
    justifyContent: "center",
    alignItems: "center"
  },
  listTitleView: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7C7',
  },
  titleList: {
    marginTop: 10,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemTimeStart: {
    fontSize: FontSize(18),
    color: '#606266',
    fontWeight: '500',
  },
  listItemTimeStart1: {
    fontSize: FontSize(17),
    color: '#007AFE',
    fontWeight: '500',
  },
  centerBtns: {
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
  },
  bottomBtnsView: {
    width: Common.window.width / 2 - 50,
    height: 38,
    borderRadius: 100,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBtnsText: {
    fontSize: FontSize(16)
  },
});
