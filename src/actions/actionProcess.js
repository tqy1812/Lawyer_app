
import * as request from './actionRequest';
import moment from 'moment';
import {getProcessList, getFeeTimeFormat, sortList, logger} from '../utils/utils';
import Common from "../common/constants";

export default class actionProcess {

 static TYPE_PROCESS_PLAN_LIST = 'TYPE_PROCESS_PLAN_LIST'; // 计划

 static TYPE_PROCESS_FINISH_LIST = 'TYPE_PROCESS_FINISH_LIST'; // 计时

 static TYPE_DAILY_PROCESS_LIST = 'TYPE_DAILY_PROCESS_LIST'; // 每天任务

 static TYPE_PROCESS_FINISH_TOTAL_TIME = 'TYPE_PROCESS_FINISH_TOTAL_TIME'; // 每天任务
    // 列表
  static reqProcessPlanList(page, preItem, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getProcessList(page, false, (rs)=>{
          let list = rs.data && rs.data.processes ? getProcessList(rs.data.processes, preItem, 'plan') : {last: undefined, rs: []};
          let isFinish = rs.total && rs.page ?  rs.page >= Math.ceil(rs.total / Common.PAGE_SIZE)  : true; 
          if (page==1) {
            dispatch({type: actionProcess.TYPE_PROCESS_PLAN_LIST, data: list.rs});
            let todayItem = {
              date: moment(new Date()).format('YYYY-MM-DD'),
              isFestival: true,
              isShowYear: false,
              data: []
            };
            if(list.rs.length > 0) {
              if(!moment(list.rs[0].date).isSame(moment(), "day")) {
                list.rs.unshift(todayItem);
              }
            }
            else {
              list.rs = [todayItem];
            }
          }
          // logger(list)
          if(callback) callback(list, isFinish);
      }));
    };
  }

  static reqProcessFinishList(page, preItem, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getProcessList(page, true, (rs)=>{
          let list = rs.data && rs.data.processes ? getProcessList(rs.data.processes, preItem, 'finish') : {last: undefined, rs: []};
          let totalTime = rs.data && rs.data.monthly_total_fee_time ? rs.data.monthly_total_fee_time : 0;
          let isFinish = rs.total && rs.page ?  rs.page >= Math.ceil(rs.total / Common.PAGE_SIZE)  : true; 
          // logger('.....reqProcessFinishList='+ list.rs.length)
          if(callback) callback(list, totalTime, isFinish);
          if(page==1) {
            dispatch({type: actionProcess.TYPE_PROCESS_FINISH_LIST, data: list.rs});
          }
          dispatch({type: actionProcess.TYPE_PROCESS_FINISH_TOTAL_TIME, data: totalTime});
      }));
    };
  }

  static reqDailyProcessList(time, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getDailyProcessList(1, time, (rs)=>{
          let list = rs.data && rs.data.processes && rs.data.processes.length>0 ? sortList(rs.data.processes) : [];
          logger(list)
          if(callback) callback(list);
          dispatch({type: actionProcess.TYPE_DAILY_PROCESS_LIST, data: list});
      }));
    };
  }

  static reqAddTalk(content, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.addTalk(content, (rs)=>{
        if(callback) callback(rs);
      }));
    };
  }

  static reqGetProcess(id, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.getProcess(id, (rs, error)=>{
        if(callback) callback(rs, error);
      }));
    };
  }

  static reqEnableProcess(id, wakeup, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.enableProcess(id, wakeup, (rs, error)=>{
        if(callback) callback(rs, error);
      }));
    };
  }

  static reqSubmitProcess(id, wakeup, name, isEnable, caseId, start_time, end_time, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.submitProcess(id, wakeup, name, isEnable, caseId, start_time, end_time, (rs, error)=>{
        if(callback) callback(rs, error);
      }));
    };
  }

  static updateProcessTime(id, start_time, end_time, callback) {
    return (dispatch, getState) => {
      let state = getState();
      logger(start_time, end_time)
      dispatch(request.updateProcessTime(id, start_time, end_time, (rs, error)=>{
        if(callback) callback(rs, error);
      }));
    };
  }
  
  static reqDeleteProcess(id, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.deleteProcess(id, (rs, error)=>{
        if(callback) callback(rs, error);
      }));
    };
  }
  
  static reqWakeUpProcess(id, wakeup, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.wakeUpProcess(id, wakeup, (rs, error)=>{
        if(callback) callback(rs, error);
      }));
    };
  }

  static reqChangeTimesProcess(id, content, callback) {
    return (dispatch, getState) => {
      let state = getState();
      dispatch(request.changeTimesProcess(id, content, (rs, error)=>{
        if(callback) callback(rs, error);
      }));
    };
  }
  
}
