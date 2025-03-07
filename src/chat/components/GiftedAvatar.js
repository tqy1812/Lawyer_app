/*
**  This component will be published in a separate package
*/
import React from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
// TODO
// 3 words name initials
// handle only alpha numeric chars

export default class GiftedAvatar extends React.Component {
  setAvatarColor() {
    const userName = this.props.user.name || '';
    const name = userName.toUpperCase().split(' ');
    if (name.length === 1) {
      this.avatarName = `${name[0].charAt(0)}`;
    } else if (name.length > 1) {
      this.avatarName = `${name[0].charAt(0)}${name[1].charAt(0)}`;
    } else {
      this.avatarName = '';
    }

    let sumChars = 0;
    for(let i = 0; i < userName.length; i++) {
      sumChars += userName.charCodeAt(i);
    }

    // inspired by https://github.com/wbinnssmith/react-user-avatar
    // colors from https://flatuicolors.com/
    const colors = [
      '#e67e22', // carrot
      '#2ecc71', // emerald
      '#3498db', // peter river
      '#8e44ad', // wisteria
      '#e74c3c', // alizarin
      '#1abc9c', // turquoise
      '#2c3e50', // midnight blue
    ];

    this.avatarColor = colors[sumChars % colors.length];
  }

  renderAvatar() {
    if (typeof this.props.user.avatar === 'function') {
      return this.props.user.avatar();
    } else if (typeof this.props.user.avatar === 'string') {
      return (
        <Image
          resizeMode="contain"
          source={ this.props.user.avatar ?  {uri: this.props.user.avatar} : require('./Images/default.png')}
          style={[defaultStyles.avatarStyle, this.props.avatarStyle]}
        />
      );
    }
    return null;
  }

  renderInitials() {
    return (
      <Text style={[defaultStyles.textStyle, this.props.textStyle]}>
        {this.avatarName}
      </Text>
    );
  }

  render() {
      if (!this.props.user.name && !this.props.user.avatar) {
          // render placeholder
          return (
              <TouchableOpacity
                  disabled={this.props.onPress ? false : true}
                  onPress={() => {
                          const {onPress, ...other} = this.props;
                          this.props.onPress && this.props.onPress(other);
                      }}>
                  <Image
                      source={require('./Images/default.png')}
                      style={[defaultStyles.avatarStyle, this.props.avatarStyle]}
                  />
              </TouchableOpacity>
          );
         
      }
    if (this.props.user.name) {
      return (
        <TouchableOpacity
          disabled={this.props.onPress ? false : true}
          onPress={() => {
            const {onPress, ...other} = this.props;
            this.props.onPress && this.props.onPress(other);
          }}
        >
          {this.renderAvatar()}
        </TouchableOpacity>
      );
    }

    if (!this.avatarColor) {
      this.setAvatarColor();
    }

    return (
      <TouchableOpacity
        disabled={this.props.onPress ? false : true}
        onPress={() => {
          const {onPress, ...other} = this.props;
          this.props.onPress && this.props.onPress(other);
        }}
        style={[
          defaultStyles.avatarStyle,
          {backgroundColor: this.avatarColor},
          this.props.avatarStyle,
        ]}
      >
        {this.renderInitials()}
      </TouchableOpacity>
    );
  }
}

const defaultStyles = {
  avatarStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    //borderRadius: 20,
  },
  textStyle: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
    fontWeight: '100',
  },
};

GiftedAvatar.defaultProps = {
  user: {
    name: null,
    avatar: null,
  },
  onPress: null,
  avatarStyle: {},
  textStyle: {},
};

GiftedAvatar.propTypes = {
  user: PropTypes.object,
  onPress: PropTypes.func,
  avatarStyle: PropTypes.object,
  textStyle: PropTypes.object,
};
