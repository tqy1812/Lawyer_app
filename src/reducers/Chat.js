import {combineReducers} from 'redux';
import actionChat from '../actions/actionChat';
import {logger} from "../utils/utils"

function chatList(state = [], action) {
  if (action.type === actionChat.CHAT_MESSAGE_LIST) {
    // logger(action.data)
    return action.data
  }
  return state;
}

function chatMessageList(state = [], action) {
  if (action.type === actionChat.CHAT_MESSAGE_LIST) {
    // logger(action.data)
    return action.data
  }
  return state;
}

function chatMessageListImdex(state = 0, action) {
  if (action.type === actionChat.CHAT_MESSAGE_LIST_CURRENT_INDEX) {
    return action.data
  }
  return state;
}


const Chat = combineReducers({
  chatList,
  chatMessageList,
  chatMessageListImdex
});

export default Chat;
