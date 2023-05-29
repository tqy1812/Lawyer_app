
import * as request from './actionRequest';
import authHelper from '../helpers/authHelper';
import { logger } from '../utils/utils';

const updateUser = (dispatch, user, from=null, save=true) => {
    dispatch(request.reqSaveUser(user, save, from, null));
  };
export default class actionAuth {

  static USER_INFO = 'USER_INFO'; //用户信息
    // 登录
  static reqLogin(user, password, device_id, device_type, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.login(user, password, device_id, device_type, callback));
    };
  }

  // 刷新token
  static loadRecord() {
    return async (dispatch, getState) => {
      let user = await authHelper.load();
      updateUser(dispatch, user, "loadRecord", false);
    };
  }

  static logoutRecord() {
    return async (dispatch, getState) => {
      authHelper.save({});
    };
  }

  static loadUser(user) {
    return async (dispatch, getState) => {
      updateUser(dispatch, user, "loadRecord", false);
    };
  }

  static reqUserInfo(callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getInfo((rs, error)=>{
          if(rs) {
            // logger('......reqUserInfo='+JSON.stringify(rs))
            dispatch({type: actionAuth.USER_INFO, data: rs});
          }
          if(callback) callback()
      }));
    };
  }

  static refreshUserInfo(rs) {
    return (dispatch, getState) => {
      dispatch({type: actionAuth.USER_INFO, data: rs});
    };
  }

  static reqUpload(file, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.upload(file, callback));
    };
  }
  static reqUserUpdate(url, iosToken, voiceType, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.userUpdate(url, iosToken, voiceType, callback));
    };
  }
  
  static reqAddFeedback(title, content, contact, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.addFeedback(title, content, contact, callback));
    };
  }

  static reqVersion(callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getAppVersion(callback));
    };
  }

  static reqAndroidVersion(callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getAndroidAppVersion(callback));
    };
  }

  static reqDeviceToken(type, deviceToken, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.userDeviceToken(type, deviceToken, callback));
    };
  }

  static reqGetVerifyPic(callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getVerifyPic(callback));
    };
  }

  static reqSendVerifySms(phone, imageCode, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.sendVerifySms(phone, imageCode, callback));
    };
  }
  
  static reqRegister(name, phone, password, smsCode, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.register(name, phone, password, smsCode, callback));
    };
  }

  static reqSendVerifyCode(callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.sendVerifyCode(callback));
    };
  }

  static reqModifyPassword(password, verifyCode, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.modifyPassword(password, verifyCode, callback));
    };
  }
}