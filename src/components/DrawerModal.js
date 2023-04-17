import React from 'react';
import {
  Text,
  Animated,
  Easing,
  PanResponder,
  TouchableOpacity,
  DeviceEventEmitter,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import BaseComponent from './BaseComponent';
import {destroySibling, showModal, showPlanModal, showFinishModal} from './ShowModal';
import Common from '../common/constants';
import platform from '../utils/platform';
import GlobalData from '../utils/GlobalData';
import { logger } from '../utils/utils';

let ref = null;
/**
  *显示弹窗方法、
  * component: 显示的组件
  * height: 组件弹出高度，不包括蒙层，蒙层默认全屏
  * showType: 弹出方式，'bottom', 'top'
  * bgHid: 点击蒙层是否隐藏
**/
export const showDrawerModal = ({component = null, height = null, showType = null, bgHid = true}) => {
  showModal(<DrawerModal
    component={component}
    ref={e => ref = e}
    height={height}
    showType={showType}
    bgHid={bgHid}
  />);
};

/**
  *	关闭弹窗
  **/
export const closeDrawerModal = () => {
  ref && ref.close && ref.close();
  ref = null;
};

export class DrawerModal extends BaseComponent {
  animated = new Animated.Value(0);

  static propTypes = {
    component: PropTypes.any,
    height: PropTypes.number,
    showType: PropTypes.oneOf(['bottom', 'top'])
  };

  static defaultProps = {
    component: <Text>测试</Text>,
    height: 200,
    showType: 'bottom'
  };
  constructor (props){
    super(props);
    this.globalData = GlobalData.getInstance();
    this.STATUS_BAR_HEIGHT =  platform.isIOS() ? this.globalData.getTop() : Common.statusBarHeight 
    this.screenHeight = this.globalData.getScreenHeight() > 0 ? this.globalData.getScreenHeight() : Common.window.height
    this.canStopPropagation = false;
    this.canStopPropagationFinishLimit = this.screenHeight - 100 - 70;
    this.canStopPropagationLimit = 170;
    this.state = {
      panPlan: new Animated.ValueXY({x:0, y: this.screenHeight}),
      panFinish: new Animated.ValueXY({x:0, y:-this.screenHeight}),
    }
    this._panResponderPlan = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => {
        if (e.nativeEvent.pageY < this.canStopPropagationLimit) this.canStopPropagation = true;
        logger('onStartShouldSetPanResponder...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+this.canStopPropagation)
        if(gestureState.dx==0 && gestureState.dy==0) {
          return false
        }
        return true
      },
      onMoveShouldSetPanResponder: (e, gestureState) => {
        logger('onMoveShouldSetPanResponder.......................'+gestureState.dy, gestureState.dx)
        if(Math.abs(gestureState.dy) > 25 && this.canStopPropagation) {
          return true;
        }
        else {
          return false;
        }
      },
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        // logger('onMoveShouldSetPanResponderCapture..........'+gestureState.dx+'.............'+gestureState.dy)
        return false
      },
      onStartShouldSetPanResponderCapture: (e, gestureState) => {
        if (e.nativeEvent.pageY < this.canStopPropagationLimit) this.canStopPropagation = true;
        return false
      },
      onPanResponderTerminationRequest:  (e, gestureState) => {
        // logger('onPanResponderTerminationRequest..........'+gestureState.dx+'.............'+gestureState.dy)
        return false
      },
      onPanResponderGrant: (evt, gs) => {},
      onPanResponderMove:(e, gestureState) => {
        if (gestureState.dy > 0) {
          logger(gestureState.dy)
          Animated.event([null, { dy: this.state.panPlan.y }], {
            useNativeDriver: false,
          })(e, gestureState);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const gestureDistance = gestureState.dy;
        this.canStopPropagation = false;
        logger('gestureDistance.......................'+gestureState.dy)
        if (gestureDistance > 50) {
          this.close('plan', this.props.close)
        } else {
          Animated.spring(this.state.panPlan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start();
        }
      },
    });

    this._panResponderFinish = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => {
        if (e.nativeEvent.pageY > this.canStopPropagationFinishLimit) this.canStopPropagation = true;
        logger('onStartShouldSetPanResponder...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+this.canStopPropagation)
        if(gestureState.dx==0 && gestureState.dy==0) {
          return false
        }
        return true
      },
      onMoveShouldSetPanResponder:  (e, gestureState) => {
        logger('onMoveShouldSetPanResponder...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+this.canStopPropagation)
        if(gestureState.dy<0 && Math.abs(gestureState.dy) > 25 && this.canStopPropagation) {
          return true;
        }
        else {
          return false;
        }
      },
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        logger('onMoveShouldSetPanResponderCapture...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+e.nativeEvent.locationY)
        return false
      },
      onStartShouldSetPanResponderCapture: (e, gestureState) => {
        if (e.nativeEvent.pageY > this.canStopPropagationFinishLimit) this.canStopPropagation = true;
        logger('onStartShouldSetPanResponder...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+this.canStopPropagation)
        return false
      },
      onPanResponderTerminationRequest:  (e, gestureState) => {
        logger('onPanResponderTerminationRequest...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+e.nativeEvent.locationY)
        return true
      },
      onPanResponderGrant: (e, gestureState) => {
        logger('onPanResponderGrant...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+e.nativeEvent.locationY)
      },
      onPanResponderMove:  (e, gestureState) => {
        logger('onPanResponderMove...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+e.nativeEvent.locationY)
        if (gestureState.dy < 0) {
          Animated.event([null, { dy: this.state.panFinish.y }], {
            useNativeDriver: false,
          })(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        logger('onPanResponderRelease...'+gestureState.dy+'...'+e.nativeEvent.pageY+'...'+e.nativeEvent.locationY)
        this.canStopPropagation = false;
        const gestureDistance = gestureState.dy;
        if (gestureDistance < -50) {
          this.close('finish', this.props.close)
        } else {
          Animated.spring(this.state.panFinish, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start();
        }
      },
    });
  }
  componentDidMount() { 
    logger('***********drawermodal componentDidMount' );
   
    // this.state.panPlan.setOffset(100)
    // Animated.timing(this.animated, {
    //   toValue: 1,
    //   duration: 2000,
    //   easing: Easing.ease,
    //   useNativeDriver: false
    // }).start();
  }

  open = (type) => {
    this.canStopPropagation = false;
    if(type==='finish') {
      Animated.timing(this.state.panFinish, {
        toValue: {x:0, y: 0},
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: false
      }).start(({finished}) => {
        if(finished){
          DeviceEventEmitter.emit('refreshProcessFinish')
        }
      });
    }
    else {
      Animated.timing(this.state.panPlan, {
        toValue: {x:0, y: 0 },
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: false
      }).start(({finished}) => {
        if(finished){
          DeviceEventEmitter.emit('refreshProcessPlan')
        }
      });
    // Animated.timing(this.animated, {
    //   toValue: 1,
    //   duration: 400,
    //   easing: Easing.ease,
    //   useNativeDriver: false
    // }).start(({finished}) => {
    //   if(finished){
    //     DeviceEventEmitter.emit(type==='finish'? 'refreshProcessFinish' : 'refreshProcessPlan')
    //   }
    // });
  }
  }

  close = (type, callback) => {
    if(type==='finish') {
      Animated.timing(this.state.panFinish, {
        toValue: {x:0, y: -this.screenHeight - this.STATUS_BAR_HEIGHT},
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false
      }).start(()=> callback && callback());
    }
    else{
      Animated.timing(this.state.panPlan, {
        toValue: {x:0, y: this.screenHeight + this.STATUS_BAR_HEIGHT },
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false
      }).start(()=> callback && callback());
    }
    // Animated.timing(this.animated, {
    //   toValue: 0,
    //   duration: 300,
    //   easing: Easing.ease,
    //   useNativeDriver: false
    // }).start(()=> callback && callback());
    // .start(() => destroySibling());
  };

  render() {
    const { panFinish, panPlan} = this.state;
    const panStyle = {
      transform: panFinish.getTranslateTransform(),
    };
    const panPlanStyle = {
      transform: panPlan.getTranslateTransform(),
    };
    // const maskTransformY = this.animated.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, 120]
    // });
    // const maskTransformY1 = this.animated.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, -120]
    // });
    // const opct = this.animated.interpolate({
    //   inputRange: [0,0.2,0.3,0.5,0.9, 1],
    //   outputRange: [0,0,0,0,0,0.4]
    // });
    logger(".............this._panY="+this.screenHeight)
    return (
      <>
        <Animated.View
           {...(this.props.showType === 'bottom' && this._panResponderPlan.panHandlers)}
           {...(this.props.showType === 'top' && this._panResponderFinish.panHandlers)}
          style={this.props.showType === 'bottom' ? [
            panPlanStyle,
            {
              width: Common.window.width,
            height:  this.screenHeight ,
            display: 'flex',
            flex: 1,
            justifyContent: "flex-end",
            position: 'absolute',
            zIndex: 7,
            flexDirection: 'column',
          } ]: [panStyle,
            {
              width: Common.window.width,
            height:  this.screenHeight,
            display: 'flex',
            flex: 1,
            justifyContent: "flex-start",
            flexDirection: 'column-reverse',
            position: 'absolute',
            zIndex: 7,
          }]}>
          <TouchableOpacity
            onPress={() => {
              // if (!this.props.bgHid) return;
              this.close(this.props.showType === 'bottom'? 'plan': 'finish',this.props.close);
            }}
            style={{
              width: Common.window.width,
              height: this.screenHeight - this.props.height,
            }}
          />
          {this.props.component}
        </Animated.View>
      </>
    );
  }
}