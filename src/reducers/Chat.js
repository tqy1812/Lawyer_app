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


const Chat = combineReducers({
  chatList,
  chatMessageList
});

export default Chat;
