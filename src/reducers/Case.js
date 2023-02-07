import {combineReducers} from 'redux';
import actionCase from '../actions/actionCase';

function caseList(state = {}, action) {
  if (action.type === actionCase.TYPE_CASE_LIST) {
    return action.data
  }
  return state;
}

function caseListInfo(state = [], action) {
  if (action.type === actionCase.TYPE_CASE_LIST_INFO) {
    return action.data
  }
  return state;
}

const Case = combineReducers({
  caseList,
  caseListInfo
});

export default Case;
