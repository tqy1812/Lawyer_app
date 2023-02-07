import Common from "../common/constants";
let React = require('react-native');
let { Platform } = React;
// iPhone X、iPhone XS
const X_WIDTH = 375;
const X_HEIGHT = 812;
// iPhone XR、iPhone XS Max
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const { height: D_HEIGHT, width: D_WIDTH } = Common.window;
export default class platform {
    static isAndroid() {
        return Platform.OS === 'android';
    }

    static isIOS() {
        return Platform.OS === 'ios';
    }

    static isiPhoneX () {
        return (
            this.isIOS() &&
          ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
            (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT)) ||
          ((D_HEIGHT === XSMAX_HEIGHT && D_WIDTH === XSMAX_WIDTH) ||
            (D_HEIGHT === XSMAX_WIDTH && D_WIDTH === XSMAX_HEIGHT))
        );
    }
}

