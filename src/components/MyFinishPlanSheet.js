import React, { Component } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  StyleSheet
} from "react-native";
import Common from '../common/constants';
import GlobalData from "../utils/GlobalData";
import platform from '../utils/platform';
class MyFinishPlanSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      animatedTranslateY: new Animated.Value(-Common.window.height),
      pan: new Animated.ValueXY({x:0, y:-Common.window.height}),
    };
    this.globalData = GlobalData.getInstance();
    this.createPanResponder(props);
  }

  setModalVisible(visible) {
    const { closeFunction, height } = this.props;
    const { animatedTranslateY, pan } = this.state;
     const STATUS_BAR_HEIGHT = platform.isIOS() ? this.globalData.getTop() :  Common.statusBarHeight 
    if (visible) {
      this.setState({ modalVisible: visible });
      Animated.timing(pan, {
        toValue: {x:0, y:0},
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(pan, {
        toValue: {x:0, y:-Common.window.height},
        duration: 400,
        useNativeDriver: false,
      }).start(() => {
        // pan.setValue({ x: 0, y: 0 });
        this.setState({
          modalVisible: visible,
          // animatedTranslateY: new Animated.Value(-Common.window.height),
        });
        if (typeof closeFunction === "function") closeFunction();
      });
    }
  }

  createPanResponder(props) {
    const { height } = props;
    const { pan, animatedTranslateY } = this.state;
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: ()=> false,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy < 0) {
          // console.log(gestureState.dy)
          Animated.event([null, { dy: pan.y }], {
            useNativeDriver: false,
          })(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        const gestureLimitArea = - height / 3;
        const gestureDistance = gestureState.dy;
        if (gestureDistance < gestureLimitArea) {
          this.setModalVisible(false);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start();
          // Animated.spring(animatedTranslateY, { toValue: -Common.window.height, useNativeDriver: false, }).start();
        }
      },
    });
  }

  show() {
    this.setModalVisible(true);
  }

  close() {
    this.setModalVisible(false);
  }

  render() {
    const {
      children,
      hasDraggableIcon,
      backgroundColor,
      sheetBackgroundColor,
      dragIconColor,
      dragIconStyle,
      draggable = true,
      onRequestClose,
      onClose = () => this.close(),
      radius,
    } = this.props;
    const { animatedTranslateY, pan, modalVisible } = this.state;
    const panStyle = {
      transform: pan.getTranslateTransform(),
    };
    // console.log(animatedTranslateY)
    return (
      <Modal transparent visible={modalVisible} onRequestClose={onRequestClose}>
        <View
          style={[
            styles.wrapper,
            { backgroundColor: backgroundColor || "#25252599", },
          ]}
        >
          <Animated.View
            {...(draggable && this.panResponder.panHandlers)}
            style={[
              panStyle,
              styles.container,
              {
                height: this.props.height,
                borderBottomRightRadius: radius || 10,
                borderBottomLeftRadius: radius || 10,
                backgroundColor: sheetBackgroundColor || "#F3F3F3",
              },
            ]}
          >
            {children}
            {hasDraggableIcon && (
              <View style={styles.draggableContainer}>
                <View
                  style={[
                    styles.draggableIcon,
                    dragIconStyle,
                    {
                      backgroundColor: dragIconColor || "#A3A3A3",
                    },
                  ]}
                />
              </View>
            )}
          </Animated.View>
          <TouchableOpacity
            style={styles.background}
            activeOpacity={1}
            onPress={onClose}
          />
        </View>
      </Modal>
    );
  }
}

export default MyFinishPlanSheet;
const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    background: {
      width: '100%',
      height: 100,
      backgroundColor: "transparent",
      // backgroundColor: '#ff0000'
    },
    container: {
      width: "100%",
      height: 0,
      overflow: "hidden",
      borderBottomRightRadius: 10,
      borderBottomLeftRadius: 10,
    },
    draggableContainer: {
      width: "100%",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    draggableIcon: {
      width: 40,
      height: 6,
      borderRadius: 3,
      margin: 10,
      marginTop: 0,
    },
  });