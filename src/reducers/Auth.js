import {combineReducers} from 'redux';
import {TYPE_AUTH_USER} from '../actions/actionRequest';
import actionAuth from '../actions/actionAuth';
import {logger} from '../utils/utils';

function user(state = {}, action) {
  if (action.type === TYPE_AUTH_USER) {
    logger('......action Auth.user',action.data)
    return action.data;
  }
  return state;
}

function userInfo(state = {}, action) {
  if (action.type === actionAuth.USER_INFO) {
    return action.data;
  }
  return state;
}

const Auth = combineReducers({
  user,
  userInfo
});

export default Auth;

