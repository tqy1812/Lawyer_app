
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
      dispatch(request.getCase((rs)=>{
          let list = rs.data && rs.data.cases ? rs.data.cases : [];
          let caseList = new Map();
          for (let i=0; i < list.length; i++) {
            caseList[list[i]['id']] = Common.color[i]
            // console.log(caseList)
          }
          // console.log(caseList)
          dispatch({type: actionCase.TYPE_CASE_LIST_INFO, data: list});
          let newData = {};
          Storage.getCaseList().then((list) => {
            // console.log(list)
            if (list) {
              newData = Object.assign({}, JSON.parse(list));
              let len =  Object.keys(newData).length
              // console.log(caseList)
              let i = 0;
              for (let key in caseList) {
                // console.log(!newData[key])
                if(!newData[key]) {
                  // newData.set(key, caseList[key]);
                  newData[key] = Common.color[len+i];
                  i = i + 1;
                }
              }
              // console.log(newData)
              Storage.setCaseList(JSON.stringify(newData));   
              dispatch({type: actionCase.TYPE_CASE_LIST, data: newData});
              if(callback) callback()
            }
            else{
              Storage.setCaseList(JSON.stringify(caseList));   
              dispatch({type: actionCase.TYPE_CASE_LIST, data: caseList});
              if(callback) callback()
            }     
          });
      }));
    };
  }
}