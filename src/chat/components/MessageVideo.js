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
export default class MessageVideo extends React.Component {
 
  render() {
    const {extend} = this.props.currentMessage;
    const {height, width, duration, coverPath, coverWidth, coverHeight} = extend;
    const getImageSize = () => {
      const size = {
        width: 0,
        height: 0
      }
      if(coverHeight * maxWidth / coverWidth > maxHeight) {
        size.height = maxHeight
        size.width =  coverWidth * maxHeight / coverHeight
      } else {
        size.width = maxWidth
        size.height = coverHeight * maxWidth / coverWidth
      }
      return size
    }
    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <FastImage
            resizeMode={FastImage.resizeMode.contain}
            style={[styles.image, this.props.imageStyle, getImageSize()]}
            source={{uri: coverPath, priority: FastImage.priority.normal}}
        />
        <View style={styles.playContainer}>
          <Image
            ImageComponent={FastImage}
            source={require('./Images/play.png')}
            style={{
              width: styles.playContainer.width,
              height: styles.playContainer.height,
            }}
          />
        </View>
        <View style={styles.duration}>
          <Text style={styles.durationText}>
            {Math.ceil(duration/1000) + 's'}
          </Text>
        </View>
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
  playContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  duration: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  durationText: {
    fontSize: 12,
    color: 'white',
  },
  iconDownload: {
    width: 30,
    height: 30,
    position: 'absolute',
    bottom: 40,
    right: 10,
  },
});

MessageVideo.defaultProps = {
  currentMessage: {
    image: null,
  },
  containerStyle: {},
  imageStyle: {},
};

MessageVideo.propTypes = {
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.object,
  imageStyle: PropTypes.object,
};
