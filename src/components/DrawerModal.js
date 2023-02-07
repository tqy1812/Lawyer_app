import React from 'react';
import {
  Text,
  Animated,
  Easing,
  PanResponder,
  TouchableOpacity,
  DeviceEventEmitter
} from 'react-native';
import PropTypes from 'prop-types';
import {destroySibling, showModal, showPlanModal, showFinishModal} from './ShowModal';
import Common from '../common/constants';
import platform from '../utils/platform';

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
    this._panY= 0;
    this._panX= 0;
    // this._panResponder = PanResponder.create({
    //   onStartShouldSetPanResponder: () => true,
    //   onMoveShouldSetPanResponder: () => true,
    //   onPanResponderGrant: (evt, gs) => {
    //       console.log('drawermodal开始移动：' + evt.timeStamp + ' X轴：' + gs.dx + '，Y轴：' + gs.dy);
    //   },
    //   onPanResponderMove: Animated.event([
    //     null,                // raw event arg ignored
    //     {dy: this._panY, dx: this._panX}],    // gestureState arg
    //   {listener: (event, gestureState) => console.log(event, gestureState)}, // Optional async listener
    //   ),
    //   onPanResponderRelease: (evt, gs) => {
    //     console.log('drawermodal结束移动：X轴移动了：' + gs.dx + '，Y轴移动了：' + gs.dy);
    //   },
    // });
  }
  componentDidMount() { 
    console.log('***********drawermodal componentDidMount' );
   
    // Animated.timing(this.animated, {
    //   toValue: 1,
    //   duration: 2000,
    //   easing: Easing.ease,
    //   useNativeDriver: false
    // }).start();
  }

  open = (type) => {
    Animated.timing(this.animated, {
      toValue: 1,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: false
    }).start(({finished}) => {
      if(finished){
        DeviceEventEmitter.emit(type==='finish'? 'refreshProcessFinish' : 'refreshProcessPlan')
      }
    });
  }

  close = (callback) => {
    // console.log('model close')
    Animated.timing(this.animated, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false
    }).start(()=> callback && callback());
    // .start(() => destroySibling());
  };

  render() {
    // console.log(this.props.showType)
    const height = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [0, this.props.height]
    });
    const transformY = this.animated.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -this.props.height]
    });
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
    
    const STATUS_BAR_HEIGHT = platform.isIOS() ? (platform.isiPhoneX() ? 34 : 20) : Common.statusBarHeight 
    console.log(".............this._panY="+this._panY)
    return (
      <>
        <Animated.View
          style={this.props.showType === 'bottom' ? {
            height: 120,
            position: 'absolute',
            top: -120,
            zIndex: 6,
            opacity: opct,
            transform: [{
              translateY: maskTransformY
            }]
          } : {
            height: 120,
            position: 'absolute',
            bottom: -120,
            zIndex: 6,
            opacity: opct,
            transform: [{
              translateY: maskTransformY1
            }]
          }}
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
              height: 120
            }}
          />
        </Animated.View>
        <Animated.View
          style={this.props.showType === 'bottom' ? {
            height: this.props.height,
            position: 'absolute',
            bottom: -this.props.height,
            zIndex: 7,
            transform: [{
              translateY:  transformY
            }]
          } : {
            height: this.props.height,
            position: 'absolute',
            // top: - this.props.height - 20,
            top:  - this.props.height - STATUS_BAR_HEIGHT,
            zIndex: 7,
            transform: [{
              translateY: height
            }]
          }}>
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