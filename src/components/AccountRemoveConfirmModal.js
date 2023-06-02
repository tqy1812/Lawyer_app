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

export default class AccountRemoveConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    logger('.......AccountRemoveConfirmModal componentDidMount')
  }
  handleSubmit = () => {
    this.props.close && this.props.close();
  }
render() {
  const { preItem, item} = this.props;
  return (
    <View style={[styles.modalContainer,{height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}>
      <View style={styles.container}>
        <View style={styles.listTitleView}>
          <Text style={styles.listItemTimeStart}>您的注销申请已提交</Text>
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
                确定
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
    paddingTop: 15,
    paddingBottom: 30,
    borderBottomWidth: 1,
    width: '100%',
    borderBottomColor: '#C7C7C7',
  },
  listItemTimeStart: {
    fontSize: FontSize(22),
    color: '#606266',
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
