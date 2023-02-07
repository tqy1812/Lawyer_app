import {combineReducers} from 'redux';
import {TYPE_AUTH_USER} from '../actions/actionRequest';

function user(state = {}, action) {
  if (action.type === TYPE_AUTH_USER) {
    if (action.data.length === 0) {
    }
    return action.data;
  }
  if (state.length === 0) {
  }
  return state;
}


const Auth = combineReducers({
  user,
});

export default Auth;

