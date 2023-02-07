import React, {Component} from "react";
import * as _ from "lodash";
import {
  View,
  StyleSheet,
  Easing,
  Animated,
  Text,
  InteractionManager,
} from 'react-native';


export default class Wave extends Component {
  
  constructor(props) {
    super(props);
    this.ani = new Animated.Value(3);
    this.ani1 = new Animated.Value(props.height * 0.8);
    this.ani2 = new Animated.Value(props.height * 0.5);
    this.ani3 = new Animated.Value(props.height * 0.3);
    this.ani4 = new Animated.Value(props.height);
    this.ani5 = new Animated.Value(props.height * 0.1);
    this.width = props.width ? props.width : 10;
  }

  
  componentDidMount () {
    this.startAnimateSlider(this.ani, 474);
    this.startAnimateSlider1(this.ani1, 433);
    this.startAnimateSlider1(this.ani2, 407);
    this.startAnimateSlider(this.ani3, 458);
    this.startAnimateSlider1(this.ani4, 400);
    this.startAnimateSlider(this.ani5, 427);
  }
  componentWillUnmount () {

  }
  startAnimateSlider = (obj, duration) => {
    const animateSlider = Animated.sequence([
      Animated.timing(obj, {
        toValue: this.props.height,
        duration: duration,
        easing: Easing.ease,
        useNativeDriver: false
      }),
      Animated.timing(obj, {
        toValue: 3,
        duration: duration,
        easing: Easing.ease,
        useNativeDriver: false
      }),
    ]);
    Animated.loop(animateSlider).start();
  }
  
  startAnimateSlider1 = (obj, duration) => {
    const animateSlider = Animated.sequence([
      Animated.timing(obj, {
        toValue: 3,
        duration: duration,
        easing: Easing.ease,
        useNativeDriver: false
      }),
      Animated.timing(obj, {
        toValue: this.props.height,
        duration: duration,
        easing: Easing.ease,
        useNativeDriver: false
      }),
    ]);
    Animated.loop(animateSlider).start();
  }
  render() {
    return (
        <View style={styles.container}>
          <Animated.View
            style={{ 
              backgroundColor: this.props.lineColor,
              height: this.ani,
              width: this.width,
              marginLeft: 4,
              marginRight: 4,
              borderRadius: 5,
            }}
          ></Animated.View>
          <Animated.View
            style={{ 
              backgroundColor: this.props.lineColor,
              height: this.ani1,
              width: this.width,
              marginLeft: 4,
              marginRight: 4,
              borderRadius: 5,
            }}
          />
          <Animated.View
            style={{ 
              backgroundColor: this.props.lineColor,
              height: this.ani2,
              width: this.width,
              marginLeft: 4,
              marginRight: 4,
              borderRadius: 5,
            }}
          />
          <Animated.View
            style={{ 
              backgroundColor: this.props.lineColor,
              height: this.ani3,
              width: this.width,
              marginLeft: 4,
              marginRight: 4,
              borderRadius: 5,
            }}
          />
          <Animated.View
            style={{ 
              backgroundColor: this.props.lineColor,
              height: this.ani4,
              width: this.width,
              marginLeft: 4,
              marginRight: 4,
              borderRadius: 5,
            }}
          />
          <Animated.View
            style={{ 
              backgroundColor: this.props.lineColor,
              height: this.ani5,
              width: this.width,
              marginLeft: 4,
              marginRight: 4,
              borderRadius: 5,
            }}
          />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
});