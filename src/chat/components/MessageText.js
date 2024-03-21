import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,Image
} from 'react-native';
import ParsedText from 'react-native-parsed-text';
import PropTypes from 'prop-types';

export default class MessageText extends React.Component {
  constructor(props) {
    super(props);
    this.onUrlPress = this.onUrlPress.bind(this);
    this.onPhonePress = this.onPhonePress.bind(this);
    this.onEmailPress = this.onEmailPress.bind(this);
  }

  onUrlPress(url) {
    typeof this.props.onUrlPress === "function" && this.props.onUrlPress(url);
  }

  onPhonePress(phone) {
      typeof this.props.onPhonePress === "function" && this.props.onPhonePress(phone);
  }

  onEmailPress(email) {
      typeof this.props.onEmailPress === "function" && this.props.onEmailPress(email);
  }

  render() {
    return (
      <View style={[styles[this.props.position].container, this.props.containerStyle[this.props.position]]}>
        {this.props.currentMessage.statue === 'send_going' ?  <Image style={{alignSelf:"center", width:100, height:10}}
                               source={require('./Images/loading.gif')}>
                        </Image>  : 
        <ParsedText
          style={[styles[this.props.position].text, this.props.textStyle[this.props.position]]}
          parse={[
            {type: 'url', style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]), onPress: this.onUrlPress},
            {type: 'phone', style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]), onPress: this.onPhonePress},
            {type: 'email', style: StyleSheet.flatten([styles[this.props.position].link, this.props.linkStyle[this.props.position]]), onPress: this.onEmailPress},
          ]}
        >
          {this.props.currentMessage.text}
        </ParsedText>
      }
      </View>
    );
  }
}

const textStyle = {
  fontSize: 16,
  lineHeight: 20,
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 10,
  marginRight: 10,
};

const styles = {
  left: StyleSheet.create({
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    text: {
      color: 'black',
      ...textStyle,
    },
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
  right: StyleSheet.create({
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    text: {
      color: 'white',
      ...textStyle,
    },
    link: {
      color: 'white',
      textDecorationLine: 'underline',
    },
  }),
};

MessageText.contextTypes = {

};

MessageText.defaultProps = {
  position: 'left',
  currentMessage: {
    text: '',
  },
  containerStyle: {},
  textStyle: {},
  linkStyle: {},
};

MessageText.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: PropTypes.object,
    right: PropTypes.object,
  }),
  textStyle: PropTypes.shape({
    left: PropTypes.object,
    right: PropTypes.object,
  }),
  linkStyle: PropTypes.shape({
    left: PropTypes.object,
    right: PropTypes.object,
  }),
};
