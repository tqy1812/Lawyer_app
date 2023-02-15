
import * as request from './actionRequest';
import Common from "../common/constants";
import * as Storage from '../common/Storage';
export default class actionCase {

 static TYPE_CASE_LIST = 'TYPE_CASE_LIST'; // 任务列表
 static TYPE_CASE_LIST_INFO = 'TYPE_CASE_LIST_INFO'; // 任务列表
    // 项目
  static reqCaseList(callback) {
    return (dispatch, getState) => {
      let state = getState();
      let user = state.Auth && state.Auth.user;
      console.log ('reqCaseList....user........'+ JSON.stringify(user))
      dispatch(request.getCase((rs)=>{
          let list = rs.data && rs.data.cases ? rs.data.cases : [];
          let caseList = new Map();
          let caseListUserColor = [];
          for (let i=0; i < list.length; i++) {
            caseList[list[i]['id']] = Common.color[i+1];
            caseListUserColor.push(i+1);
            // console.log(caseList)
          }
          // console.log(caseList)
          dispatch({type: actionCase.TYPE_CASE_LIST_INFO, data: list});
          let newData = {};
          Storage.getCaseList(user.phone).then((list) => {
            // console.log(list)
            if (list) {
              newData = Object.assign({}, JSON.parse(list));
              let len =  Object.keys(newData).length;
              let i = 1;
              let newUserColor = [];
              Storage.getCaseListUserColor(user.phone).then((userColor)=>{
                if(userColor){
                  newUserColor = userColor.split(',');
                  for (let key in caseList) {
                    // console.log(!newData[key])
                    if(!newData[key]) {
                      if(newUserColor.indexOf(len+i)<0) {
                        newData[key] = Common.color[len+i];
                        newUserColor.push(len+i);
                        i = i + 1;
                      }
                      else {
                        for(let k=len+i+1; k<102; k++) {
                          if(newUserColor.indexOf(k)<0) {
                            newData[key] = Common.color[k];
                            newUserColor.push(k);
                            i = k + 1;
                            break;
                          }
                        }
                      }
                    }
                  }
                }
                else {
                  for (let key in caseList) {
                    // console.log(!newData[key])
                    if(!newData[key]) {
                      // newData.set(key, caseList[key]);
                      newData[key] = Common.color[len+i];
                      newUserColor.push(len+i);
                      i = i + 1;
                    }
                  }
                  // console.log(newData)
                }
                Storage.setCaseList(user.phone,JSON.stringify(newData));   
                Storage.setCaseListUserColor(user.phone,JSON.stringify(newUserColor));   
                dispatch({type: actionCase.TYPE_CASE_LIST, data: newData});
                if(callback) callback()
              }); 
            }
            else{
              Storage.setCaseList(user.phone,JSON.stringify(caseList));   
              Storage.setCaseListUserColor(user.phone,JSON.stringify(caseListUserColor));   
              dispatch({type: actionCase.TYPE_CASE_LIST, data: caseList});
              if(callback) callback()
            }     
          });
      }));
    };
  }
}