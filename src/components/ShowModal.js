import React from 'react';
import {View, Text, StyleSheet,ActivityIndicator} from 'react-native';
import Common from '../common/constants';
import Wave from './Wave';
import GlobalData from "../utils/GlobalData";
import platform from "../utils/platform";
import RootSiblings from 'react-native-root-siblings';  //全局弹框组件
import { logger } from '../utils/utils';
let sibling = null;
let planSibling = null;
let finishSibling = null;
let confirmModal = null;
let elements = [];
const globalData = GlobalData.getInstance();
export const showModal = (component) => {
    sibling && sibling.destroy()
    sibling = new RootSiblings(component);
    elements.push(sibling);
};
export const showConfirmModal = (component) => {
    confirmModal && confirmModal.destroy();
    confirmModal = new RootSiblings(component);
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

export const destroyConfirmSibling = () =>  {
    confirmModal && confirmModal.destroy();
}

export const update = (index, component) => sibling && sibling.update(<View>{component}</View>)
export const showLoading = () => {
    sibling && sibling.destroy()
    sibling = new RootSiblings(<View style={[styles.maskStyle, {height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}>
        <View style={styles.backViewStyle}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </View>);
      elements.push(sibling);
};
export const showRecoding = () => {
    sibling = new RootSiblings(<View style={[styles.isRecoding, { height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}><Wave height={50} lineColor={'#fff'}></Wave></View>);
      elements.push(sibling);
};

export const showToast = (value) => {
    sibling = new RootSiblings(<View style={[styles.toastStyle,{height: globalData.getScreenHeight() > 0 ? globalData.getScreenHeight() : Common.window.height,}]}><View style={styles.toastViewStyle}>
        <Text style={styles.toastFontStyle}>{value}</Text>
      </View></View>);
      elements.push(sibling);
    setTimeout(destroySibling,1000)
};

const headHeight = platform.isIOS() ? globalData.getTop() : Common.statusBarHeight;
const styles = StyleSheet.create({
    maskStyle: {
        position: 'absolute',
        width: Common.window.width,
        backgroundColor: 'rgba(0,0,0,0.3)',
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
      width: Common.window.width,
      zIndex: 5,
      backgroundColor: "#000",
      opacity: 0.5,
      top: 0,
    },
    toastStyle: {
        position: 'absolute',
        width: Common.window.width,
        opacity: 1,      
        top: 0,
        zIndex: 99,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    toastViewStyle: {
        backgroundColor: '#000000e0',
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        minWidth: 32,
    },
    toastFontStyle: {
        fontSize: 13,
        color: '#fff'
    },
})