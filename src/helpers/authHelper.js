
import * as Storage from '../common/Storage';
import {logger} from  "../utils/utils"
export default class  authHelper {
    static delegate = null;
    // 检测是否已登录
    static logined(user) {
      logger('logined......', user)
      if (user && user.token){
        return user.token.length > 0;
      }
      return false;
    }


    // 检测登录是否超时
    static loginTimeout(user) {
      if (user && user.timeout) {
        return user.timeout <= new Date().getTime();
      }
      return true;
    }

    // 存档用户信息
    static save(user) {
      try {
        if (user.token) {
          Storage.setUserRecord(JSON.stringify(user));
        } else {
          logger("退出登录");
          let newUser = {};
          Storage.getUserRecord().then((userRecord) => {
            if (userRecord) {
              newUser = Object.assign({}, JSON.parse(userRecord));
            }
            newUser.token = null;
            Storage.setUserRecord(JSON.stringify(newUser));
          });
        }
      } catch (e) {
        logger('E:' + e.message);
      }
    }

    static async load() {
        let userRecord = await Storage.getUserRecord();
        if (userRecord) {
            return Object.assign({}, JSON.parse(userRecord));
        }
        return {};
    }

}
