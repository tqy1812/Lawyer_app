import React from 'react';
import {
  Image,
  StyleSheet,
  View,Platform
} from 'react-native';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image'
const maxWidth = 100
const maxHeight = 200
export default class MessageImage extends React.Component {
 
  render() {
    const {extend} = this.props.currentMessage;
    const {imageHeight,imageWidth} = extend;
    const getImageSize = () => {
      const size = {
        width: 0,
        height: 0
      }
      if(imageHeight * maxWidth / imageWidth > maxHeight) {
        size.height = maxHeight
        size.width =  imageWidth * maxHeight / imageHeight
      } else {
        size.width = maxWidth
        size.height = imageHeight * maxWidth / imageWidth
      }
      console.log(size, imageHeight, imageWidth)
      return size
    }
    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <FastImage
            resizeMode={FastImage.resizeMode.contain}
            style={[styles.image, this.props.imageStyle, getImageSize()]}
            source={{uri: extend.thumbPath, priority: FastImage.priority.normal}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    // display: 'flex',
    // justifyContent: 'flex-start',
    // alignItems: 'flex-start'
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
