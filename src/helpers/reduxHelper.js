let deepCopy = (obj) => {
    let o = obj.constructor === Array ? [] : {};
    for(let i in obj){
      if(Object.prototype.hasOwnProperty.call(obj, i)){
        o[i] = typeof obj[i] === "object" ? deepCopy(obj[i]) : obj[i];
      }
    }
    return o;
  };
  
  // Redux的state的帮助类
  export default class reduxHelper {
  
    static deepCopy (obj) {
      let o = obj.constructor === Array ? [] : {};
      for(let i in obj){
        if(Object.prototype.hasOwnProperty.call(obj, i)){
          o[i] = typeof obj[i] === "object" ? deepCopy(obj[i]) : obj[i];
        }
      }
      return o;
    }
  
    // 获得发送结口的最终数据
    // requires 必传参数列表
    // options 选传参数列表
    static getSendData(requires, options) {
      let sendData = {};
      if (requires) {
        sendData = Object.assign({}, requires);
      }
      if (options) {
        for (let k in options) {
          sendData[k] = options[k];
        }
      }
      return sendData;
    }
  
    // 查询类的查询结果Action
    static getResultAction(dispatch, res, err, type, callback) {
      if (res) dispatch({type:type, data:res});
      if (callback) callback(res, err);
    }
  
    // 查询类的数据清空Action
    static getQueryClearAction(action_type) {
      return {type:action_type + '_CLEAR'};
    }
  
    // 查询类的Reducer的初始化
    static getQueryReducerInit() {
      return {
        count:0,
        data:[],
      };
    }
  
    // 查询类的Reducer逻辑
    static getQueryReducer(state, action, type) {
      if (action.type === type) {
        let retState = {};
        retState.count = action.data.count;
        retState.data = Object.assign([], state.data);
        retState.data = retState.data.concat(action.data.data ? action.data.data : []);
        return retState;
      } else if (action.type === (type + '_CLEAR')) {
        return this.getQueryReducerInit();
      }
      return state;
    }
  
    /**
      带key查询类型的redux帮助函数
      1. querySendDataForKey：发送查询结果action
      2. querySendClearForKey：发送清空reudex中key对应的数据的action
      3. queryReducerForKey：将请求的结果存入Reducer中的key
      4. queryReducerClearForKey：清空Reducer中key对应的数据
      5. getQueryDataForKey：获取key对应的数据
    */
    static querySendDataForKey(key, dispatch, type, data, err, callback) {
      if (data) dispatch({key:key, type:type, data:data});
      if (callback) callback(data, err);
    }
  
    static querySendClearForKey(key, dispatch, action_type) {
      dispatch({type:action_type + '_CLEAR', key:key});
    }
  
    static queryReducerForKey(state, action, type) {
      if (action.type === type) {
        let retState = deepCopy(state);
        let item = retState[action.key];
        if (item == null) {
          item = {count:0, data:[], t:{}};
          retState[action.key] = item;
        }
        item.t = action.data.t ? action.data.t : {};
        item.count = action.data.count;
        item.data = item.data.concat(action.data.data ? action.data.data : []);
        return retState;
      } else if (action.type === (type + '_CLEAR')) {
        return this.queryReducerClearForKey(action.key, state);
      }
      return state;
    }
  
    static queryReducerClearForKey(key, state) {
      let retState = deepCopy(state);
      delete retState[key];
      return retState;
    }
  
    static getQueryDataForKey(key, state) {
      let ret = state[key];
      if (ret == null) {
        return {count:0, data:[]};
      }
      return ret;
    }
  
    /**
      带key数据类型的redux帮助函数
      1. dataSendDataForKey：发送查询结果action
      2. dataSendClearForKey：发送清空reudex中key对应的数据的action
      3. dataReducerForKey：将请求的结果存入Reducer中的key
      4. dataReducerClearForKey：清空Reducer中key对应的数据
    */
    static dataSendDataForKey(key, dispatch, type, data, err, callback) {
      if (data) dispatch({key:key, type:type, data:data});
      if (callback) callback(data, err);
    }
  
    static dataSendClearForKey(key, dispatch, action_type) {
      dispatch({type:action_type + '_CLEAR', key:key});
    }
  
    static dataReducerForKey(state, action, type) {
      if (action.type === type) {
        let retState = deepCopy(state);
        retState[action.key] = action.data;
        return retState;
      } else if (action.type === (type + '_CLEAR')) {
        return this.dataReducerClearForKey(action.key, state);
      }
      return state;
    }
  
    static dataReducerClearForKey(key, state) {
      let retState = deepCopy(state);
      delete retState[key];
      return retState;
    }
  
  }
  