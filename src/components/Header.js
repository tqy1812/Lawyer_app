import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Keyboard
} from 'react-native';
import {connect} from 'react-redux';
import authHelper from '../helpers/authHelper';
import MyButton from './MyButton';
import IcomoonIcon from "../components/IcomoonIcon";
import AntDesign from 'react-native-vector-icons/AntDesign';


class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasLeftButton: this.props.back,
      hasRightButton: this.props.close
    };
  }

  static mapStateToProps(state) {
    let props = {};
    props.user = state.Auth.user;
    props.isLogin = authHelper.logined(state.Auth.user);
    return props;
  }

  handleGoBack() {
    Keyboard.dismiss();
    if (this.props.cancelFunc) {
      this.props.cancelFunc();
    } else {
      this.props.navigation.goBack();
    }
  }

  handleRightAction() {
    Keyboard.dismiss();
    if (this.props.bacnFunc) {
      this.props.bacnFunc();
    } 
    else if (this.props.sendFunc) {
      this.props.sendFunc();
    } else {
      this.props.navigation.goBack();
    }
  }


  render() {
    let NavigationBar = [];
    // 返回
    if (this.props.back) {
      NavigationBar.push(
        <MyButton
          key={'leftIcon'}
          activeOpacity={0.75}
          style={styles.leftIcon}
          onPress={this.handleGoBack.bind(this)}
        >   
          <IcomoonIcon size={18} name='back' color='rgba(0,0,0,0.5)'/>
        </MyButton>
      );
    } 
    

    // 标题
    if (this.props.title) {
      NavigationBar.push(
        <View key={'title'} style={styles.titleWrap}>
          <Text style={[styles.title, {}]}>{this.props.title}</Text>
        </View>
      );
    }

    if (this.props.close) {
      NavigationBar.push(
        <MyButton
          key={'closeIcon'}
          activeOpacity={0.75}
          style={styles.rightIcon}
          onPress={this.handleRightAction.bind(this)}
        >   
          <AntDesign size={30} name='close' color='rgba(0,0,0,0.5)'/>
        </MyButton>
      );
    } 

    if (this.props.send) {
      NavigationBar.push(
        <MyButton
          key={'closeIcon'}
          activeOpacity={0.75}
          style={styles.rightIcon}
          onPress={this.handleRightAction.bind(this)}
        >   
          <Text style={styles.bthText}>提交</Text>
        </MyButton>
      );
    } 


    return (
      <View style={styles.navigationBarContainer}>
        <View style={styles.navigationBar}>
          {NavigationBar}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  navigationBarContainer: {
    height: 45,
    alignItems: 'center',
    color: '#000',
    width: '100%',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    width:'100%',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: '#000',
  },
  leftIcon: {
    position: 'absolute',
    zIndex: 1,
    left: 20,
    color: '#000',
    width: 100,
    height: 45,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightIcon: {
    position: 'absolute',
    zIndex: 1,
    right: 20,
    color: '#000',
    width: 100,
    height: 45,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bthText: {
    color: '#007AFE',
    fontSize: 12
  },
});

export default connect(Header.mapStateToProps)(Header);
