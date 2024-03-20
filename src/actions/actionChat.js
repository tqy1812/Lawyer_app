import * as request from './actionRequest';
import moment from 'moment';
import { logger, formatMessage} from '../utils/utils';
import Common from "../common/constants";
export default class actionChat {

    static CHAT_LIST = 'CHAT_LIST'; // 对话列表
    static LAW_CHAT_LIST = 'LAW_CHAT_LIST'; //法律大模型
   
    static CHAT_MESSAGE_LIST = 'CHAT_MESSAGE_LIST'; // 对话MESSAGE列表
    static CHAT_MESSAGE_LIST_CURRENT_INDEX = 'CHAT_MESSAGE_LIST_CURRENT_INDEX'; 
   
    // 获取可对话的客户列表
    static getConversableClientList(page, per_page, keywords, callback = null) {
       return (dispatch, getState) => {
         let state = getState();
            dispatch(request.getConversableClientList(page, per_page, keywords, (rs, error)=>{
              if(error) {
                if(callback) callback(rs, error);
              }
              else {
                let list = rs
                dispatch({type: actionChat.CHAT_LIST, data: list});
                if(callback) callback(list, error);
              }
         }));
        };
    }

    static getLawClientList(callback = null) {
      return (dispatch, getState) => {
        let state = getState();
           dispatch(request.getLawClientList((rs, error)=>{
             if(error) {
               if(callback) callback(rs, error);
             }
             else {
               let list = rs.expands
               dispatch({type: actionChat.CHAT_LIST, data: list});
               if(callback) callback(list, error);
             }
        }));
       };
    }

    // 获取对应客户聊天记录
    static getClientChatList(page, per_page, id, localFileList, callback = null) {
        return (dispatch, getState) => {
          let state = getState();
          let userInfo = state.Auth && state.Auth.userInfo;
          let chatMessageListImdex = state.Chat && state.Chat.chatMessageListImdex;
            console.log('chatMessageListImdex',chatMessageListImdex, userInfo)
          dispatch(request.getClientChatList(page, per_page, id, (rs, error)=>{
            if(error) {
              if(callback) callback(rs, error);
            }
            else {
                let list = rs.data
                console.log(list)
                let newList = []
                for(let i=0; i<list.length; i++) {
                    console.log(parseInt(list[i].speaker_id), parseInt(userInfo.id))
                  let isRight = parseInt(list[i]['speaker_id']) == parseInt(userInfo.id)
                  let newItem = formatMessage(isRight, list[i], chatMessageListImdex + i, localFileList)
                  newList.push(newItem)
                }
                dispatch({type: actionChat.CHAT_MESSAGE_LIST_CURRENT_INDEX, data: chatMessageListImdex + newList.length});
                if(page == 1) {
                  dispatch({type: actionChat.CHAT_MESSAGE_LIST, data: newList});
                }
                rs.data = newList;
                if(callback) callback(rs, error);
              }
          }));
         };
     }

     // 给客户发送消息
    static sendClientMessage(id, content, type, meta, callback = null) {
        return (dispatch, getState) => {
            let state = getState();
            let chatMessageList = state.Chat && state.Chat.chatMessageList;
             dispatch(request.sendClientMessage(id, content, type, meta, callback));
         };
    }
    //给客户发送文件  
    static reqClientFileUpload(file, callback) {
      return (dispatch, getState) => {
        let state = getState();
        dispatch(request.clientFileUpload(file, callback));
      };
    }
     

     // 获取可对话的律师列表
    static getConversableEmployeeList(page, per_page, keywords, callback = null) {
        return (dispatch, getState) => {
          let state = getState();
             dispatch(request.getConversableEmployeeList(page, per_page, keywords, (rs, error)=>{
              if(error) {
                if(callback) callback(rs, error);
              }
              else {
                 let list = rs
                 dispatch({type: actionChat.CHAT_LIST, data: list});
                 if(callback) callback(list);
              }
          }));
         };
    }

    static getLawEmployeeList(callback = null) {
      return (dispatch, getState) => {
        let state = getState();
           dispatch(request.getLawEmployeeList((rs, error)=>{
             if(error) {
               if(callback) callback(rs, error);
             }
             else {
               let list = rs.expands
               dispatch({type: actionChat.CHAT_LIST, data: list});
               if(callback) callback(list, error);
             }
        }));
       };
    }
 
     // 获取对应律师聊天记录
    static getEmployeeChatList(page, per_page, id, localFileList, callback = null) {
         return (dispatch, getState) => {
           let state = getState();
           let userInfo = state.Auth && state.Auth.userInfo;
           let chatMessageListImdex = state.Chat && state.Chat.chatMessageListImdex;
             console.log('chatMessageListImdex',chatMessageListImdex, userInfo)
              dispatch(request.getEmployeeChatList(page, per_page, id, (rs, error)=>{
                if(error) {
                  if(callback) callback(rs, error);
                }
                else {
                  let list = rs.data
                  let newList = []
                  for(let i=0; i<list.length; i++) {
                    let isRight = parseInt(list[i]['speaker_id']) == parseInt(userInfo.id)
                    let newItem = formatMessage(isRight, list[i], i + chatMessageListImdex, localFileList)
                    newList.push(newItem)
                  }
                  dispatch({type: actionChat.CHAT_MESSAGE_LIST_CURRENT_INDEX, data: chatMessageListImdex + newList.length});
                  if(page == 1) {
                    dispatch({type: actionChat.CHAT_MESSAGE_LIST, data: newList});
                  }
                  rs.data = newList;
                  if(callback) callback(rs, error);
                }
           }));
          };
      }
 
      // 给律师发送消息
    static sendEmployeeMessage(id, content, type, meta, callback = null) {
         return (dispatch, getState) => {
             let state = getState();
              dispatch(request.sendEmployeeMessage(id, content, type, meta, callback));
          };
    }
    //给律师发送文件
    static reqEmployeeFileUpload(file, callback) {
        return (dispatch, getState) => {
          let state = getState();
          dispatch(request.employeeFileUpload(file, callback));
        };
    }
    //大模型提问api
    static sendLawApi(url, method, headers, params, content, callback) {
      return (dispatch, getState) => {
        let state = getState();
        dispatch(request.sendLawApi(url, method, headers, params, content, callback));
      };
  }
}
