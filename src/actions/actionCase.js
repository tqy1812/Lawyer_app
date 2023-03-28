
import * as request from './actionRequest';
import Common from "../common/constants";
import * as Storage from '../common/Storage';
import { logger } from '../utils/utils';
export default class actionCase {

 static TYPE_CASE_LIST = 'TYPE_CASE_LIST'; // 任务列表
 static TYPE_CASE_LIST_INFO = 'TYPE_CASE_LIST_INFO'; // 任务列表
    // 项目
  static reqCaseList(callback) {
    return (dispatch, getState) => {
      let state = getState();
      let user = state.Auth && state.Auth.user;
      dispatch(request.getCase((rs)=>{
        logger('reqCaseList....user........'+ JSON.stringify(rs))
          let infoList = rs.data && rs.data.cases ? rs.data.cases : [];
          let caseList = new Map();
          // let caseListUserColor = [];
          for (let i=0; i < infoList.length; i++) {
            caseList[infoList[i]['id']] = Common.color[i%103+1] ? Common.color[i%103+1] : Common.color[103];
            // caseListUserColor.push(i+1);
            // logger(caseList)
          } 
          dispatch({type: actionCase.TYPE_CASE_LIST_INFO, data: infoList});
          let newData = {};
          Storage.getCaseList(user.phone).then((list) => {
            // logger(list)
            if (list) {
              newData = Object.assign({}, JSON.parse(list));
              // let len =  Object.keys(newData).length;
              // let i = 1;
              // let newUserColor = [];
              // Storage.getCaseListUserColor(user.phone).then((userColor)=>{
                // logger(userColor)
                // if(userColor){
                  // newUserColor = userColor.split(',');
                  for (let key in caseList) {
                    if(!newData[key]) {
                      // if(newUserColor.indexOf(len+i)<0) {
                        newData[key] = Common.color[i%103+1] ? Common.color[i%103+1] : Common.color[103];
                        // newUserColor.push(Common.color[len+i] ? len+i : 103);
                        // i = i + 1;
                      // }
                      // else {
                      //   for(let k=len+i+1; k<102; k++) {
                      //     if(newUserColor.indexOf(k)<0) {
                      //       newData[key] = Common.color[k] ? Common.color[k] : Common.color[103];
                      //       // newUserColor.push(Common.color[k] ? k : 103);
                      //       i = k + 1;
                      //       break;
                      //     }
                      //   }
                      // }
                    }
                  }
                // }
                // else {
                //   for (let key in caseList) {
                //     // logger(!newData[key])
                //     if(!newData[key]) {
                //       // newData.set(key, caseList[key]);
                //       newData[key] = Common.color[len+i] ? Common.color[len+i] : Common.color[103];
                //       // newUserColor.push(Common.color[len+i] ? len+i : 103);
                //       i = i + 1;
                //     }
                //   }
                //   // logger(newData)
                // }
               
                Storage.setCaseList(user.phone,JSON.stringify(newData));   
                // Storage.setCaseListUserColor(user.phone,newUserColor && newUserColor.length>0 ? newUserColor.toString() : '');   
                dispatch({type: actionCase.TYPE_CASE_LIST, data: newData});
                if(callback) callback(newData, infoList)
              // }); 
            }
            else{
              Storage.setCaseList(user.phone,JSON.stringify(caseList));   
              // Storage.setCaseListUserColor(user.phone, caseListUserColor && caseListUserColor.length>0 ? caseListUserColor.toString(): '');   
              dispatch({type: actionCase.TYPE_CASE_LIST, data: caseList});
              if(callback) callback(caseList, infoList)
            }     
          });
      }));
    };
  }
}