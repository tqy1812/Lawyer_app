import React from 'react';
import {
  Image,
  StyleSheet,
  View,Platform,Text
} from 'react-native';
import {getFileName, getFileType} from '../../utils/utils'
import Common from "../../common/constants";
import PropTypes from 'prop-types';
const { width: windowWidth, height: windowHeight } = Common.window;
export default class MessageFile extends React.Component {
  render() {
    const {extend} = this.props.currentMessage;
    const {imageHeight,imageWidth} = extend;
    return (
      <View style={[styles.container, this.props.containerStyle, {width:windowWidth * 0.7,height: 90}]}>
        <View style={styles.titleView}><Text style={styles.title} ellipsizeMode={'tail'}> {getFileName(extend.thumbPath)}</Text></View>
        <Image
            resizeMode={"contain"}
            style={[styles.image, this.props.imageStyle,]}
            source={getFileType(extend.thumbPath)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 0.5, 
    borderColor: "#999",
    borderRadius: 5,
  },
  image: {
    width: 50,
    height: 50,
  },
  titleView: {
    width: windowWidth * 0.7 - 50 - 30,
    height: 70,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    lineHeight: 18,
  }
});

MessageFile.defaultProps = {
  currentMessage: {
    image: null,
  },
  containerStyle: {},
};

MessageFile.propTypes = {
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.object,
};
