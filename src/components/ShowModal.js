import React from 'react';
import {View, StyleSheet,ActivityIndicator} from 'react-native';
import Common from '../common/constants';
import Wave from './Wave';
import GlobalData from "../utils/GlobalData";
import platform from "../utils/platform";
import RootSiblings from 'react-native-root-siblings';  //全局弹框组件
let sibling = null;
let planSibling = null;
let finishSibling = null;
let elements = [];
const globalData = GlobalData.getInstance();
export const showModal = (component) => {
    sibling && sibling.destroy()
    sibling = new RootSiblings(component);
    elements.push(sibling);
};

export const showPlanModal = (component) => {
    planSibling && planSibling.destroy();
    planSibling = new RootSiblings(component);
};

export const showFinishModal = (component) => {
    finishSibling && finishSibling.destroy()
    finishSibling = new RootSiblings(component);
};

export const destroySibling = () =>  {
    let lastSibling = elements.pop();
    lastSibling && lastSibling.destroy();
}

export const destroyAllSibling = () =>  {
    finishSibling && finishSibling.destroy();
    planSibling && planSibling.destroy();
}

export const update = (index, component) => sibling && sibling.update(<View>{component}</View>)
export const showLoading = () => {
    sibling && sibling.destroy()
    sibling = new RootSiblings(<View style={styles.maskStyle}>
        <View style={styles.backViewStyle}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </View>);
      elements.push(sibling);
};
export const showRecoding = () => {
    sibling = new RootSiblings(<View style={styles.isRecoding}><Wave height={50} lineColor={'#fff'}></Wave></View>);
      elements.push(sibling);
};

const headHeight = platform.isIOS() ? globalData.getTop() : Common.statusBarHeight;
const styles = StyleSheet.create({
    maskStyle: {
        position: 'absolute',
        width: Common.window.width,
        backgroundColor: 'rgba(0,0,0,0.3)',
        height: Common.window.height,
        top: 0,
        zIndex: 99,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    backViewStyle: {
        backgroundColor: '#000',
        opacity: 0.6,
        width: 100,
        height: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    isRecoding: {
      position: 'absolute',
      height: Common.window.height,
      width: Common.window.width,
      zIndex: 5,
      backgroundColor: "#000",
      opacity: 0.5,
      top: 0,
    },
})