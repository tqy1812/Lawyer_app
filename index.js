/**
 * @format
 */
import 'rn-overlay';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import {LocaleConfig} from 'react-native-calendars';

// LocaleConfig.locales['zh'] = {
//   monthNames: [
//     '一月',
//     '二月',
//     '三月',
//     '四月',
//     '五月',
//     '六月',
//     '七月',
//     '八月',
//     '九月',
//     '十月',
//     '十一月',
//     '十二月'
//   ],
//   monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
//   dayNames: ['日', '一', '二', '三', '四', '五', '六'],
//   dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
//   today: "今天"
// };
// LocaleConfig.defaultLocale = 'zh';
import moment from 'moment';
// 导入中文语言包
import 'moment/locale/zh-cn';
// 设置中文
moment.locale('zh-cn', {
    week: {
        dow: 0
    }
});
AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('WebSocketConnectService', () =>
    require('./src/utils/WebSocketTask')
);