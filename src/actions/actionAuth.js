
import * as request from './actionRequest';
import authHelper from '../helpers/authHelper';

const updateUser = (dispatch, user, from=null, save=true) => {
    dispatch(request.reqSaveUser(user, save, from, null));
  };
  
export default class actionAuth {

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

  
}