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
import {destroySibling, showModal, showPlanModal, showFinishModal} from './ShowModal';
import Common from '../common/constants';
import platform from '../utils/platform';
import GlobalData from '../utils/GlobalData';

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

export class DrawerModal extends React.Component {
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
    this.state = {
      panPlan: new Animated.ValueXY({x:0, y: Common.window.height}),
      panFinish: new Animated.ValueXY({x:0, y:-Common.window.height}),
    }
    this.STATUS_BAR_HEIGHT =  platform.isIOS() ? this.globalData.getTop() : Common.statusBarHeight 
    this._panResponderPlan = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => {
        console.log('onStartShouldSetPanResponder..........'+gestureState.dx+'.............'+gestureState.dy)
        return true
      },
      onMoveShouldSetPanResponder: (e, gestureState) => {
        console.log('onMoveShouldSetPanResponder.......................'+gestureState.dy, gestureState.dx)
        if(Math.abs(gestureState.dy) > 25) {
          return true;
        }
        else {
          return false;
        }
      },
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        // console.log('onMoveShouldSetPanResponderCapture..........'+gestureState.dx+'.............'+gestureState.dy)
        return false
      },
      onStartShouldSetPanResponderCapture: (e, gestureState) => {
        // console.log('onStartShouldSetPanResponderCapture..........'+gestureState.dx+'.............'+gestureState.dy)
        return false
      },
      onPanResponderTerminationRequest:  (e, gestureState) => {
        // console.log('onPanResponderTerminationRequest..........'+gestureState.dx+'.............'+gestureState.dy)
        return false
      },
      onPanResponderGrant: (evt, gs) => {},
      onPanResponderMove:(e, gestureState) => {
        if (gestureState.dy > 0) {
          console.log(gestureState.dy)
          Animated.event([null, { dy: this.state.panPlan.y }], {
            useNativeDriver: false,
          })(e, gestureState);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const gestureDistance = gestureState.dy;
        
        console.log('gestureDistance.......................'+gestureState.dy)
        if (gestureDistance > 50) {
          this.close('plan', this.props.close)
        } else {
          Animated.spring(this.state.panPlan, { toValue: { x: 0, y:  platform.isIOS() ?  0 : -this.STATUS_BAR_HEIGHT }, useNativeDriver: false, }).start();
        }
      },
    });

    this._panResponderFinish = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => {
        console.log('onStartShouldSetPanResponder..........'+gestureState.dx+'.............'+gestureState.dy)
        return true
      },
      onMoveShouldSetPanResponder:  (e, gestureState) => {
        console.log('onMoveShouldSetPanResponder.......................'+gestureState.dy, gestureState.dx)
        if(Math.abs(gestureState.dy) > 25) {
          return true;
        }
        else {
          return false;
        }
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt, gs) => {},
      onPanResponderMove:  (e, gestureState) => {
        if (gestureState.dy < 0) {
          // console.log(gestureState.dy)
          Animated.event([null, { dy: this.state.panFinish.y }], {
            useNativeDriver: false,
          })(e, gestureState);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const gestureDistance = gestureState.dy;
        if (gestureDistance < -50) {
          this.close('finish', this.props.close)
        } else {
          Animated.spring(this.state.panFinish, { toValue: { x: 0, y: platform.isIOS() ? this.globalData.getTop() : 0 }, useNativeDriver: false, }).start();
        }
      },
    });
  }
  componentDidMount() { 
    console.log('***********drawermodal componentDidMount' );
   
    // this.state.panPlan.setOffset(100)
    // Animated.timing(this.animated, {
    //   toValue: 1,
    //   duration: 2000,
    //   easing: Easing.ease,
    //   useNativeDriver: false
    // }).start();
  }

  open = (type) => {
    if(type==='finish') {
      Animated.timing(this.state.panFinish, {
        toValue: {x:0, y: platform.isIOS() ? this.globalData.getTop() : 0},
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
        toValue: {x:0, y: platform.isIOS() ? 0 : -this.STATUS_BAR_HEIGHT},
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
        toValue: {x:0, y:-Common.window.height},
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false
      }).start(()=> callback && callback());
    }
    else{
      Animated.timing(this.state.panPlan, {
        toValue: {x:0, y: Common.window.height},
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
    // console.log(this.props.showType)
    const { panFinish, panPlan} = this.state;
    const panStyle = {
      transform: panFinish.getTranslateTransform(),
    };
    // panPlan.setValueY({x:0, y: panPlan.getV})
    const panPlanStyle = {
      transform: panPlan.getTranslateTransform(),
    };
    // const height = this.animated.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, this.props.height]
    // });
    // const transformY = this.animated.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, -this.props.height]
    // });
    const maskTransformY = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 120]
    });
    const maskTransformY1 = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -120]
    });
    const opct = this.animated.interpolate({
      inputRange: [0,0.2,0.3,0.5,0.9, 1],
      outputRange: [0,0,0,0,0,0.4]
    });
    
    // console.log(".............this._panY="+this._panY)
    return (
      <>
        {/* <Animated.View
          style={{
          //   this.props.showType === 'bottom' ? {
          //   height: 120,
          //   position: 'absolute',
          //   top: -120,
          //   zIndex: 6,
          //   opacity: opct,
          //   transform: [{
          //     translateY: maskTransformY
          //   }]
          // } : {
            height: Common.window.height,
            position: 'absolute',
            // bottom: -120,
            top: 0,
            left: 0,
            zIndex: 6,
            // opacity: opct,
            // transform: [{
            //   translateY: maskTransformY1
            // }]
          }
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              // if (!this.props.bgHid) return;
              this.close(this.props.close);
            }}
            style={{
              width: Common.window.width,
              backgroundColor: '#000',
              height: Common.window.height
            }}
          />
        </Animated.View> */}
        <Animated.View
           {...(this.props.showType === 'bottom' && this._panResponderPlan.panHandlers)}
           {...(this.props.showType === 'top' && this._panResponderFinish.panHandlers)}
          style={this.props.showType === 'bottom' ? [
            panPlanStyle,
            {
              width: Common.window.width,
            height: Common.window.height,
            display: 'flex',
            flex: 1,
            justifyContent: "flex-end",
            position: 'absolute',
            // bottom: -this.props.height,
            zIndex: 7,
            flexDirection: 'column',
            // transform: [{
            //   translateY:  transformY
            // }]
          } ]: [panStyle,
            {
              width: Common.window.width,
            height: Common.window.height,
            display: 'flex',
            flex: 1,
            justifyContent: "flex-start",
            flexDirection: 'column-reverse',
            position: 'absolute',
            // top:  - this.props.height - STATUS_BAR_HEIGHT,
            zIndex: 7,
            // transform: [{
            //   translateY: height
            // }]
          }]}>
          <TouchableOpacity
            onPress={() => {
              // if (!this.props.bgHid) return;
              this.close(this.props.showType === 'bottom'? 'plan': 'finish',this.props.close);
            }}
            style={{
              width: Common.window.width,
              height: Common.window.height - this.props.height,
            }}
          />
          {this.props.component}
        </Animated.View>
      </>
      // <>
      //   <Animated.View
      //     style={this.props.showType === 'bottom' ? {
      //       height: Common.window.height,
      //       position: 'absolute',
      //       bottom: -Common.window.height,
      //       zIndex: 6,
      //       transform: [{
      //         translateY:  transformY
      //       }]
      //     } : {
      //       height: Common.window.height,
      //       position: 'absolute',
      //       top: -Common.window.height - Common.statusBarHeight,
      //       zIndex: 6,
      //       transform: [{
      //         translateY: height
      //       }]
      //     }}>
      //        <Animated.View
      //         style={{
      //           position: 'absolute',
      //           opacity: opct,
      //           flex: 1,
      //           top: 0,
      //           zIndex: 7
      //         }}
      //       >
      //       <TouchableOpacity
      //         activeOpacity={0.4}
      //         onPress={() => {
      //           // if (!this.props.bgHid) return;
      //           this.close();
      //         }}
      //         style={{
      //           width: Common.window.width,
      //           backgroundColor: '#000',
      //           height: Common.window.height,
      //         }}
      //       />
      //       </Animated.View>
      //       <Animated.View style={this.props.showType === 'bottom' ? {
      //         height: Common.window.height - 100,
      //         position: 'absolute',
      //         bottom: 0,
      //         zIndex: 8
      //       } : {
      //         height: Common.window.height - 100,
      //         position: 'absolute',
      //         top: 0,
      //         zIndex: 8,
      //       }}>
      //         {this.props.component}
      //       </Animated.View>
      //   </Animated.View>
      // </>
    );
  }
}