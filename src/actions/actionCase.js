
import * as request from './actionRequest';
import Common from "../common/constants";
import * as Storage from '../common/Storage';
import { logger, isSameColor, filterSameColor } from '../utils/utils';
export default class actionCase {

 static TYPE_CASE_LIST = 'TYPE_CASE_LIST'; // 任务列表
 static TYPE_CASE_LIST_INFO = 'TYPE_CASE_LIST_INFO'; // 任务列表
 static COLOR_LENGTH = 54;
    // 项目
  static reqCaseList(callback) {
    return (dispatch, getState) => {
      let state = getState();
      let user = state.Auth && state.Auth.user;
      dispatch(request.getCase((rs)=>{
          let infoList = rs.data && rs.data.cases ? rs.data.cases : [];
          let caseList = new Map();
          for (let i=0; i < infoList.length; i++) {
            caseList[infoList[i]['id']] = Common.color[parseInt(infoList[i]['id'])%actionCase.COLOR_LENGTH+1] ? Common.color[parseInt(infoList[i]['id'])%actionCase.COLOR_LENGTH+1] : Common.color[actionCase.COLOR_LENGTH];
          } 
          
          dispatch({type: actionCase.TYPE_CASE_LIST_INFO, data: infoList});
          let newData = {};
          Storage.getCaseList(user.phone).then((list) => {
            if (list) {
              newData = Object.assign({}, JSON.parse(list));
              for (let key in caseList) {
                if(!newData[key+'']) {
                  if(infoList.length <= actionCase.COLOR_LENGTH) {
                    let isSame = isSameColor(newData, caseList[key]);
                    if(isSame) {
                      newData[key] = filterSameColor(newData)
                    }
                    else {
                      newData[key] = caseList[key] ? caseList[key] : Common.color[actionCase.COLOR_LENGTH];
                    }
                  }
                  else{
                    newData[key] = caseList[key] ? caseList[key] : Common.color[actionCase.COLOR_LENGTH];
                  }
                }
              }
            
              Storage.setCaseList(user.phone,JSON.stringify(newData));   
              dispatch({type: actionCase.TYPE_CASE_LIST, data: newData});
              if(callback) callback(newData, infoList)
            }
            else{
              Storage.setCaseList(user.phone,JSON.stringify(caseList));    
              dispatch({type: actionCase.TYPE_CASE_LIST, data: caseList});
              if(callback) callback(caseList, infoList)
            }     
          });
      }));
    };
  }
}