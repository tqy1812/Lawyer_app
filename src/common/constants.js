import {Dimensions,NativeModules, Platform} from 'react-native';
const { StatusBarManager } = NativeModules;

const {width,height} = Dimensions.get('window')
const wh = height/width
let window = {
    width: width,
    height: Platform.OS === 'ios'? height : wh  > 1.8 ? height + StatusBarManager.HEIGHT : height,
};
let statusBarHeight = StatusBarManager.HEIGHT;
let color = [
    ['rgba(144,3,255,.3)', 'rgb(144,3,255)', '#9003FF'], 
    ['rgba(255,206,31,.3)', 'rgb(255,206,31)', '#FFCE1F'], 
    ['rgba(255,3,109,.3)', 'rgb(255,3,109)', '#FF036D'], 
    ['rgba(0,188,154,.3)', 'rgb(0,188,154)', '#00BC9A'], 
    ['rgba(34,175,255,.3)', 'rgb(34,175,255)', '#22AFFF'], 
    ['rgba(127, 255, 212,.3)', 'rgb(127, 255, 212)', '#7FFFD4'], 
    ['rgba(255, 0, 255,.3)', 'rgb(255, 0, 255)', '#FF00FF'], 
    ['rgba(148, 0, 211,.3)', 'rgb(148, 0, 211)', '#9400D3'], 
    ['rgba(138, 43, 226,.3)', 'rgb(138, 43, 226)', '#8A2BE2'], 
    ['rgba(34, 139, 34,.3)', 'rgb(34, 139, 34)', '#228B22'], 
    ['rgba(173,255,47,.3)', 'rgb(173,255,47)', '#ADFF2F'], 
    ['rgba(0,250,154,.3)', 'rgb(0,250,154)', '#00FA9A'], 
    ['rgba(65,105,225,.3)', 'rgb(65,105,225)', '#4169E1'], 
    ['rgba(184,134,11,.3)', 'rgb(184,134,11)', '#B8860B'], 
    ['rgba(255,99,71,.3)', 'rgb(255,99,71)', '#FF6347'], 
    ['rgba(255,69,0,.3)', 'rgb(255,69,0)', '#FF4500']
]
export default {
    window: window,
    color,
    statusBarHeight,
};
