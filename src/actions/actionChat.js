import * as request from './actionRequest';
import moment from 'moment';
import { logger, formatMessageText} from '../utils/utils';
import Common from "../common/constants";
export default class actionChat {

    static CHAT_LIST = 'CHAT_LIST'; // 对话列表
   
    static CHAT_MESSAGE_LIST = 'CHAT_MESSAGE_LIST'; // 对话MESSAGE列表
   
    // 获取可对话的客户列表
    static getConversableClientList(page, per_page, keywords, callback = null) {
       return (dispatch, getState) => {
         let state = getState();
            dispatch(request.getConversableClientList(page, per_page, keywords, (rs)=>{
                let list = rs
                dispatch({type: actionChat.CHAT_LIST, data: list});
                if(callback) callback(list);
         }));
        };
    }

    // 获取对应客户聊天记录
    static getClientChatList(page, per_page, id, callback = null) {
        return (dispatch, getState) => {
          let state = getState();
          let userInfo = state.Auth && state.Auth.userInfo;
            console.log(userInfo)
          dispatch(request.getClientChatList(page, per_page, id, (rs)=>{
                let list = rs.data
                console.log(list)
                let newList = []
                for(let i=0; i<list.length; i++) {
                    console.log(parseInt(list[i].speaker_id), parseInt(userInfo.id))
                  let isRight = parseInt(list[i]['speaker_id']) == parseInt(userInfo.id)
                  let newItem = formatMessageText(isRight, list[i], i + (page-1) * per_page)
                  newList.push(newItem)
                }
                if(page == 1) {
                  dispatch({type: actionChat.CHAT_MESSAGE_LIST, data: newList});
                }
                rs.data = newList;
                if(callback) callback(rs);
          }));
         };
     }

     // 给客户发送消息
    static sendClientMessage(id, content, type, callback = null) {
        return (dispatch, getState) => {
            let state = getState();
            let chatMessageList = state.Chat && state.Chat.chatMessageList;
             dispatch(request.sendClientMessage(id, content, type, (rs)=>{
                 if(callback) callback(rs);
          }));
         };
     }

     

     // 获取可对话的律师列表
    static getConversableEmployeeList(page, per_page, keywords, callback = null) {
        return (dispatch, getState) => {
          let state = getState();
             dispatch(request.getConversableEmployeeList(page, per_page, keywords, (rs)=>{
                 let list = rs
                 dispatch({type: actionChat.CHAT_LIST, data: list});
                 if(callback) callback(list);
          }));
         };
     }
 
     // 获取对应律师聊天记录
     static getEmployeeChatList(page, per_page, id, callback = null) {
         return (dispatch, getState) => {
           let state = getState();
           let userInfo = state.Auth && state.Auth.userInfo;
             console.log(userInfo)
              dispatch(request.getEmployeeChatList(page, per_page, id, (rs)=>{
                  let list = rs.data
                  let newList = []
                  for(let i=0; i<list.length; i++) {
                    let isRight = parseInt(list[i]['speaker_id']) == parseInt(userInfo.id)
                    let newItem = formatMessageText(isRight, list[i], i + (page-1) * per_page)
                    newList.push(newItem)
                  }
                  if(page == 1) {
                    dispatch({type: actionChat.CHAT_MESSAGE_LIST, data: newList});
                  }
                  rs.data = newList;
                  if(callback) callback(rs);
           }));
          };
      }
 
      // 给律师发送消息
     static sendEmployeeMessage(id, content, type, callback = null) {
         return (dispatch, getState) => {
             let state = getState();
              dispatch(request.sendEmployeeMessage(id, content, type, (rs)=>{
                  if(callback) callback(rs);
           }));
          };
      }

}
