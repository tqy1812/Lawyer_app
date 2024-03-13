import React from 'react';
import {
  Image,
  StyleSheet,
  View,Platform
} from 'react-native';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image'
export default class MessageImage extends React.Component {
  render() {
    const {extend} = this.props.currentMessage;
    const {imageHeight,imageWidth} = extend;
    return (
      <View style={[styles.container, this.props.containerStyle, {width:100,height:100*(imageHeight/imageWidth)}]}>
        <FastImage
            resizeMode={FastImage.resizeMode.contain}
            style={[styles.image, this.props.imageStyle,{width:'100%',height:100*(imageHeight/imageWidth)}]}
            source={{uri: extend.thumbPath, priority: FastImage.priority.normal}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  image: {
    borderRadius:5,
  },
});

MessageImage.defaultProps = {
  currentMessage: {
    image: null,
  },
  containerStyle: {},
  imageStyle: {},
};

MessageImage.propTypes = {
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.object,
  imageStyle: PropTypes.object,
};
