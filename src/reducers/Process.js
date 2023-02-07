import {combineReducers} from 'redux';
import actionProcess from '../actions/actionProcess';

function planList(state = [], action) {
  if (action.type === actionProcess.TYPE_PROCESS_PLAN_LIST) {
    // console.log(action.data)
    return action.data
  }
  return state;
}

function finishList(state = [], action) {
  if (action.type === actionProcess.TYPE_PROCESS_FINISH_LIST) {
    // console.log(action.data)
    return action.data
  }
  return state;
}



function dailyList(state = [], action) {
  if (action.type === actionProcess.TYPE_DAILY_PROCESS_LIST) {
    // console.log(action.data)
    return action.data
  }
  return state;
}

const Process = combineReducers({
  planList,
  finishList,
  dailyList,
});

export default Process;
