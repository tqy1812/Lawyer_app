import React from 'react';
import {TouchableOpacity} from 'react-native';
import HandlerOnceTap from '../utils/HandlerOnceTap';

class MyButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: true
    };
    this.lastClickTime=0;
  }

  onPress () {
    const clickTime = Date.now();
    if (!this.lastClickTime || Math.abs(this.lastClickTime - clickTime) > 350) {  //350的时间可以延长，根据需要改变
      this.lastClickTime = clickTime;
      if(this.props.onPress){
        HandlerOnceTap(()=>this.props.onPress(), 300);
      }else{
        return '';
      }

    }
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.onPress.bind(this)}
        activeOpacity={this.props.activeOpacity || 0.75}
        style={this.props.style}
        disabled={this.props.disabled}
      >
        {this.props.children}
      </TouchableOpacity>)
  }
}

export default MyButton;
