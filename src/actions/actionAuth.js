
import * as request from './actionRequest';
import authHelper from '../helpers/authHelper';
import { logger } from '../utils/utils';

const updateUser = (dispatch, user, from=null, save=true) => {
    dispatch(request.reqSaveUser(user, save, from, null));
  };
export default class actionAuth {

  static USER_INFO = 'USER_INFO'; //用户信息
    // 登录
  static reqLogin(user, password, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.login(user, password, callback));
    };
  }

  // 刷新token
  static loadRecord() {
    return async (dispatch, getState) => {
      let user = await authHelper.load();
      updateUser(dispatch, user, "loadRecord", false);
    };
  }

  static reqUserInfo(callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getInfo((rs, error)=>{
          if(rs) {
            logger('......reqUserInfo='+JSON.stringify(rs))
            dispatch({type: actionAuth.USER_INFO, data: rs});
          }
          if(callback) callback()
      }));
    };
  }

  static reqUpload(file, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.upload(file, callback));
    };
  }
  static reqUserUpdate(url, iosToken, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.userUpdate(url, iosToken, callback));
    };
  }
}