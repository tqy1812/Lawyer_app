import React, {Component} from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  Modal,
} from 'react-native';
import Common from '../common/constants';

/**
 * 通用弹出框，包括居中弹出框和底部弹出框
 * @param {Boolean} isVisible 控制是否可见
 * @param {?Boolean} isBottomView 可选，控制是否为底部弹出框样式，默认为居中弹出框
 * @param {?Boolean} isTouchMaskToClose 可选，控制是否点击阴影关闭弹窗，默认开启
 * @param {?String} title 可选，标题，默认为`提示`,只对居中弹窗生效
 * @param {?String} confirmText 可选，居中框的确认按钮描述，默认为`确 认`
 * @param {?JSX} customTitleView 可选，自定义title样式（包括居中和底部弹框），若该属性有值，会覆盖默认样式，当需要自定义按钮点击功能时可以用这个，
 * @param {?JSX} customBottomView 可选，自定义底部样式（包括居中和底部弹框），若该属性有值，会覆盖默认样式，当需要自定义按钮点击功能时可以用这个，
 *
 * eg:` <MyModal
 *         isVisible={this.state.isVisible}
 *      >
 *          <Text>测试弹窗</Text>
 *      </MyModal>`
 */
export default class MyModal extends Component {
  constructor(props) {
    super(props);
    this.title = props.title || "提示";
    this.confirmText = props.confirmText || "确 认";
    this.customTitleView = props.customTitleView
      ? props.customTitleView
      : false;
    this.customTitleViewShow = props.customTitleViewShow
      ? props.customTitleViewShow
      : false;
    this.customBottomView = props.customBottomView
    ? props.customBottomView
    : false;
    this.isBottomView = !!JSON.stringify(props.isBottomView)
      ? this.props.isBottomView
      : false;
    this.isTouchMaskToClose = !!JSON.stringify(props.isTouchMaskToClose)
      ? this.props.isTouchMaskToClose
      : true;
    this.cancelShow= props.cancelShow ? props.cancelShow : false;
    this.state = {
      isVisible: this.props.isVisible || false
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

  render() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.isVisible}
        onRequestClose={() => {
          this.setModalVisiable(false);
        }}
      >
        {this.isBottomView ? (
          <View style={styles.bottomModalContainer}>
            <TouchableOpacity
              style={styles.bottomMask}
              onPress={() => {
                this.setModalVisiable(false);
              }}
            />
            <View style={styles.bottomContent}>{this.props.children}</View>
            {this.customBottomView ? (
              this.customBottomView
            ) : (
              <View style={styles.bottomBtns}>
                <TouchableOpacity
                  onPress={() => {
                    this.setModalVisiable(false);
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
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {this.props.send && this.props.send() }}>
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
                      {this.confirmText}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback
              onPress={() => {
                this.isTouchMaskToClose ? this.setModalVisiable(false) : null;
              }}
            >
              <View style={styles.mask} />
            </TouchableWithoutFeedback>
            <View style={styles.container}>
              { this.customTitleViewShow ? this.customTitleView ? (
                this.customTitleView
              ) : (
                <Text style={styles.title}>{this.title}</Text>
              ) : null}
              {this.props.children}
              {/* <View
                style={{
                  height: 0.5,
                  width: Common.window.width - 42,
                  backgroundColor: "#E5E5E5"
                }}
              /> */}
              {this.customBottomView ? (
                this.customBottomView
              ) : (
                <View style={styles.centerBtns}>
                  { this.cancelShow  && <TouchableOpacity
                    onPress={() => {
                      this.setModalVisiable(false);
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
                  </TouchableOpacity>
                  }
                  <TouchableOpacity onPress={() => {this.props.send && this.props.send() }}>
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
                        {this.confirmText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                // <TouchableOpacity onPress={() => this.props.send && this.props.send()}>
                //   <Text style={styles.confirmBtn}>{this.confirmText}</Text>
                // </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: Common.window.width,
    height: Common.window.height
  },
  mask: {
    width: Common.window.width,
    height: Common.window.height,
    backgroundColor: "#000",
    opacity: 0.4,
    position: "absolute",
    left: 0,
    top: 0
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
  title: {
    textAlign: "center",
    fontFamily: "PingFangSC-Semibold",
    fontSize: 16,
    color: "#333",
    marginTop: 18
  },
  confirmBtn: {
    color: "#417EFF",
    fontSize: 17,
    fontFamily: "PingFangSC-Semibold",
    marginBottom: 18,
    marginTop: 14.2,
    width: Common.window.width - 42,
    textAlign: "center"
  },

  bottomModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: Common.window.width,
    height: Common.window.height
  },
  bottomMask: {
    flex: 1,
    width: Common.window.width,
    marginBottom: -9,
    backgroundColor: "#000",
    opacity: 0.4,
  },
  content: {
    width: Common.window.width,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    paddingTop: 15
  },
  bottomBtns: {
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    marginBottom: 0,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -9 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10
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
  bottomModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: Common.window.width,
    height: Common.window.height
  },
  bottomMask: {
    flex: 1,
    width: Common.window.width,
    backgroundColor: "#333333",
    opacity: 0.3,
    marginBottom: -9
  },
  bottomContent: {
    width: Common.window.width,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    paddingTop: 15
  }
});