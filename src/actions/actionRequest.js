import authHelper from "../helpers/authHelper";
import request from "../utils/request";
import * as Storage from '../common/Storage';
import Common from "../common/constants";
import { logger } from "../utils/utils";
const api = Common.apiUrl;

export const TYPE_AUTH_USER = "TYPE_AUTH_USER"; // 账号
export function reqSaveUser(user, save = true, from = null, callback = null) {
    return (dispatch, getState) => {
        if (user === undefined || user === null || user === {}) {
            user = {};
        } else if (user.token === null || user.token === undefined) {
            logger('::::::::: reqSaveUser:user.token为空，from:' + from);
        }
        if (dispatch) {
            // logger('::::::::: reqSaveUser:user' + user);
            dispatch({type: TYPE_AUTH_USER, data: user});
        }
        if ((from !== "loadRecord" || from !== "requestLoginout" ) && (user === null || user.access_token === null)) {
            if (authHelper.delegate) {
                authHelper.delegate.onLogout();
            }
        }
        if (from !== "loadRecord" && save) {
            authHelper.save(user);
        }
    };
}

export function login(phone, password, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let data = {};
        // 要发送的数据
        data.phone = phone;
        data.password = password;
        request_impl(api, 'login', data, (res, error) => {
            if(res) {
                let retData = res.data;
                retData.phone = phone;
                retData.password = password;
                dispatch(reqSaveUser(retData, true, "login"));
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function getInfo(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/employee/get';

        request_impl_get(api, method, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function upload(file, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/upload_oss/avatar'
        let data = new FormData();
        data.append('file', file);
        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch, { 'Content-Type': 'multipart/form-data'});
    };
}

export function userUpdate(url, iosToken, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/employee/update'
        let data = {avatar: url, ios_token: iosToken};

        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function getCase(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/case/list?page=1&per_page=1000';

        request_impl_get(api, method, (res, error) => {
            if(res) {
                let retData = res.data;
                // logger(retData)
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function addProcess(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/add'
        let data = {};

        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function getProcess(id, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/get?process_id=' + id;
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if(res) {
                let retData = res.data.process;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function submitProcess(id, wakeup, name, isEnable, caseId, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/update'
        let data = {
            id: id,
            is_wakeup: wakeup,
            name: name,
            is_enable: isEnable,
            case_id: caseId
        };

        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function enableProcess(id, wakeup, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/enable'
        let data = {
            process_id: id,
            is_wakeup: wakeup
        };

        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function wakeUpProcess(id, wakeup, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/wakeup'
        let data = {
            process_id: id,
            is_wakeup: wakeup
        };

        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function deleteProcess(id, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/delete'
        let data = {
            process_id: id
        };

        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function changeTimesProcess(id, content, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/change_process_times'
        let data = {
            process_id: id,
            ask: content
        };

        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}


export function getProcessList(page, isEnd, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/list?page='+ page + '&per_page=10' + '&is_end=' +isEnd
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}


export function getDailyProcessList(page, time, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/daily_process/list?page='+ page + '&per_page=100' + '&date=' +time
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

export function addTalk(content, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/talk'
        let data = {};
        // 要发送的数据
        data.ask = content;
        request_impl(api, method, data, (res, error) => {
            if(res) {
                let retData = res.data;
                if (callback) {
                    callback(retData, error);
                }
            }
            else {
                if (callback) {
                    callback(res, error);
                }
            }
        }, dispatch);
    };
}

function request_impl(url, method, data, callback, dispatch = null, header) {
    let headers = {};
     // 消息头
     if(header) {
        headers = header;
     }
     else{
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json, application/xml, text/play, text/html, *.*';
     }
     Storage.getUserRecord().then((user) => {
        if (user) {
            let obj = Object.assign({}, JSON.parse(user));
            headers['token'] = obj.token;
            request.post(url, method, data, headers,
                (rs, error) => {
                    logger(':::: request_impl: ' + JSON.stringify(rs));
                    if(callback) callback(rs, error);
                },
                (reqKey) => {
                    // logger('xyz:::: logout callback ' + reqKey);
                    requestLoginout(dispatch, reqKey);
                },
                () => {

                }
            );
        }    
        else{
            request.post(url, method, data, headers,
                (rs, error) => {
                    logger(':::: error: ' + error);
                    if(callback) callback(rs, error);
                },
                (reqKey) => {
                    logger('xyz:::: logout callback ' + reqKey);
                    requestLoginout(dispatch, reqKey);
                },
                () => {

                }
            ); 
        }
      });
     
}

function request_impl_get(url, method, callback, dispatch = null) {
    let headers = {};
    Storage.getUserRecord().then((user) => {
        logger("request_impl_get",  user)
        if (user) {
            let obj = Object.assign({}, JSON.parse(user));
            headers['token'] = obj.token;
            request.get(url, method, headers,
                (rs, error) => {
                    logger(':::: rs: ' + JSON.stringify(rs));
                    if(callback) callback(rs, error);
                },
                (reqKey) => {
                    logger('xyz:::: logout callback ' + reqKey);
                    // requestLoginout(dispatch, reqKey);
                }
            );
        }    
    });
}



