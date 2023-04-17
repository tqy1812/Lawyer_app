import React from 'react';
import BaseComponent from "./BaseComponent";
import PropTypes from 'prop-types';
import {
    Text,
    TouchableOpacity,
  } from 'react-native';
const timer = 90;
export class SendIdentify extends BaseComponent{
    static propTypes = {
      action:PropTypes.func,
      time:PropTypes.number,
    }
  
    static defaultProps = {
      action:function(){
        console.log('未定义方法')
      },
      time: timer
    }
    constructor(props){
      super(props);
      this.state={
        timing: this.props.time,
        disabled: false
      }
    }
    render(){
      return (
        <TouchableOpacity 
            style={{
                alignItems:'center',
                marginLeft:10,
                // backgroundColor: '#007afe',
                // borderRadius: 10,
            }}
            activeOpacity={1}
            disabled={this.state.disabled}
            onPress={this.state.timing==this.props.time?this.timeout.bind(this):null}
        >
          <Text style={{
                fontSize: 15,
                padding: 10,
                color: '#007afe',
            }}>
            {this.state.timing==this.props.time?'获取验证码':this.state.timing+'秒'}
          </Text>
        </TouchableOpacity>
      );
    }
  
    countDown(){
      if(this.state.timing == 0){
        this.setState({
            timing: timer,
            disabled: false
        })
      }else{
        this.setState({
            timing:this.state.timing-1, disabled: true
        });
        setTimeout(this.countDown.bind(this),1000); 
      }
    }
    timeout(){ƒ
        console.log('....timeout')
      try {
        if(typeof this.props.action === "function") { //是函数    其中 FunName 为函数名称
            this.props.action();
        } else { //不是函数
            console.log('action not is function');
        }
      } catch(e) {}
      this.countDown();
    }
  }