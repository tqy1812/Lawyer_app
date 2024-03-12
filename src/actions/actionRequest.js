import authHelper from "../helpers/authHelper";
import request from "../utils/request";
import * as Storage from '../common/Storage';
import { Overlay } from 'react-native';
import Common from "../common/constants";
import { logger } from "../utils/utils";
import NetInfo from '@react-native-community/netinfo';
import { destroySibling } from "../components/ShowModal";
import { DeviceEventEmitter } from 'react-native';
import actionAuth from "./actionAuth";
const api = Common.apiUrl;
const Toast = Overlay.Toast;

export const TYPE_AUTH_USER = "TYPE_AUTH_USER"; // 账号
export function reqSaveUser(user, save = true, from = null, callback = null) {
    return (dispatch, getState) => {
        if (user === undefined || user === null || user === '{}') {
            user = {};
        }
        if (dispatch) {
            logger('::::::::: reqSaveUser:user', user);
            dispatch({ type: TYPE_AUTH_USER, data: user });
        }
        if ((from !== "loadRecord" || from !== "requestLoginout") && (user.token === null)) {

            logger('::::::::: reqSaveUser:user logout');
            if (authHelper.delegate) {
                authHelper.delegate.onLogout();
            }
        }
        if (from !== "loadRecord" && save) {
            authHelper.save(user);
        }
    };
}

export function login(phone, password, device_id, device_type, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let data = {};
        // 要发送的数据
        data.phone = phone;
        data.password = password;
        data.device_id = device_id;
        data.device_type = device_type;
        request_impl(api, 'login', data, (res, error) => {
            if (res) {
                let retData = res.data;
                retData.phone = phone;
                retData.password = password;
                retData.type = 1;
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

export function clientLogin(phone, password, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client/login';
        let data = {};
        // 要发送的数据
        data.phone = phone;
        data.password = password;
        request_impl(api, method, data, (res, error) => {
            if (res) {
                let retData = res.data;
                retData.phone = phone;
                retData.password = password;
                retData.type = 2;
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


export function getAppVersion(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let headers = {};
        headers['Content-Type'] = 'application/json';
        let data = {};
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                request.post('https://itunes.apple.com/cn/lookup?id=6446157793', '', data, headers,
                    (res, error) => {
                        if (res) {
                            if (res.resultCount > 0) {
                                let retData = res.results && res.results[0] && res.results[0].version;
                                logger('app store version===' + retData)
                                if (callback) {
                                    callback(retData, error);
                                }
                            }
                            else {
                                if (callback) {
                                    callback('', error);
                                }
                            }
                        }
                    },
                    (reqKey) => {
                    },
                    () => {

                    },
                    true
                );
            }
            else {
                Toast.show("网络已经离线");
            }
        });
    };
}

export function getAndroidAppVersion(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'app_update_log/latest';
        let headers = {};

        request_impl_get_system(api, method, (res, error) => {
            if (res) {
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
export function getInfo(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/employee/get';

        request_impl_get(api, method, (res, error) => {
            if (res) {
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

export function getClientInfo(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/client/info';

        request_impl_get(api, method, (res, error) => {
            if (res) {
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
export function clientComment(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/comment/list';
        let data = {};
        request_impl_get(api, method, (res, error) => {
            if (res) {
                let list = res.data && res.data.data ? res.data.data : [];
                dispatch({ type: actionAuth.CLIENT_COMMENT_LIST, data: list });
                if (callback) {
                    callback(list, error);
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
            if (res) {
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
        }, dispatch, { 'Content-Type': 'multipart/form-data' });
    };
}
export function clientUpload(file, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/upload_oss/avatar'
        let data = new FormData();
        data.append('file', file);
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
        }, dispatch, { 'Content-Type': 'multipart/form-data' });
    };
}
export function userUpdate(url, iosToken, voiceType, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/employee/update'
        let data = {};
        if (url) {
            data.avatar = url;
        }
        if (iosToken) {
            data.ios_token = iosToken;
        }
        if (voiceType) {
            data.voice_type = voiceType;
        }
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
export function clientUserUpdate(url, voiceType, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/client/update'
        let data = {};
        if (url) {
            data.avatar = url;
        }
        if (voiceType) {
            data.voice_type = voiceType;
        }
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
export function userDeviceToken(type, deviceToken, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/employee/update_device'
        let data = {};
        data.device_type = type;
        data.device_id = deviceToken;
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
export function getVerifyPic(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'get_verify_pic';

        request_impl_get_system(api, method, (res, error) => {
            if (res) {
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

export function sendVerifySms(phone, imageCode, callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'send_verify_sms'
        let data = {};
        data.phone = phone;
        data.image_code = imageCode;
        request_impl(api, method, data, (res, error) => {
            if (res) {
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

export function sendVerifyCode(callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/employee/send_verify_code'
        let data = {};
        request_impl(api, method, data, (res, error) => {
            if (res) {
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

export function sendClientVerifyCode(callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/client/send_verify_code'
        let data = {};
        request_impl(api, method, data, (res, error) => {
            if (res) {
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

export function modifyPassword(password, verifyCode, callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/employee/modify_password'
        let data = {};
        data.new_pass = password;
        data.verify_code = verifyCode;
        request_impl(api, method, data, (res, error) => {
            if (res) {
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

export function clientModifyPassword(password, verifyCode, callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/client/modify_password'
        let data = {};
        data.new_pass = password;
        data.verify_code = verifyCode;
        request_impl(api, method, data, (res, error) => {
            if (res) {
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

export function register(name, phone, password, smsCode, callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'individual/signup'
        let data = {};
        data.name = name;
        data.phone = phone;
        data.password = password;
        data.sms_code = smsCode;
        request_impl(api, method, data, (res, error) => {
            if (res) {
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

export function clientRegister(phone, password, verifyCode, inviteCode, callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client/signup'
        let data = {};
        data.password = password;
        data.phone = phone;
        data.sms_code = verifyCode;
        data.invite_code = inviteCode;
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
export function removeAccount(verifyCode, callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/employee/logout'
        let data = {};
        data.verify_code = verifyCode;
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
export function removeClientAccount(verifyCode, callback) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/client/logout'
        let data = {};
        data.verify_code = verifyCode;
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
            if (res) {
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

export function getClientCase(callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/case/list?page=1&per_page=1000';

        request_impl_get(api, method, (res, error) => {
            if (res) {
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
            if (res) {
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
            if (res) {
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

export function submitProcess(id, wakeup, name, isEnable, caseId, start_time, end_time, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/update'
        let data = {
            id: id,
            is_wakeup: wakeup,
            name: name,
            is_enable: isEnable,
            case_id: caseId,
            start_time: start_time,
            end_time: end_time
        };

        request_impl(api, method, data, (res, error) => {
            if (res) {
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

export function updateProcessTime(id, start_time, end_time, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/process/update'
        let data = {
            id: id,
            start_time: start_time,
            end_time: end_time
        };

        request_impl(api, method, data, (res, error) => {
            if (res) {
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
            if (res) {
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
            if (res) {
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
            if (res) {
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
            if (res) {
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
        let method = 'api/process/list?page=' + page + '&per_page=' + Common.PAGE_SIZE + '&is_end=' + isEnd
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if (res) {
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
        let method = 'api/daily_process/list?page=' + page + '&per_page=100' + '&date=' + time
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if (res) {
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
            if (res) {
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

export function addFeedback(title, content, contact, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/feedback/add'
        let data = {
            title: title,
            content: content,
            contact: contact
        };

        request_impl(api, method, data, (res, error) => {
            if (res) {
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

// 获取可对话的客户列表
export function getConversableClientList(page, per_page, keywords, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/im/client/list?page=' + page + '&per_page=' + per_page + '&keywords=' + keywords;
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if (res) {
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

// 获取对应客户聊天记录，每页代表一天的聊天记录
export function getClientChatList(page, per_page, id, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/im/message/list?page=' + page + '&per_page=' + per_page + '&client_id=' + id;
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if (res) {
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
// 给客户发送消息,content_type有 “text” 和 “file”两种类型
export function sendClientMessage(id, content, type, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/im/message/send'
        let data = {
            client_id: id,
            content_type: type,
            content: content,
        };

        request_impl(api, method, data, (res, error) => {
            if (res) {
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
//给客户发送文件
export function clientFileUpload(file, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'api/upload_oss/file'
        let data = new FormData();
        data.append('file', file);
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
        }, dispatch, { 'Content-Type': 'multipart/form-data' });
    };
}
// 获取可对话的律师列表
export function getConversableEmployeeList(page, per_page, keywords, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/im/employee/list?page=' + page + '&per_page=' + per_page + '&keywords=' + keywords;
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if (res) {
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

// 客户获取对应律师聊天记录，每页代表一天的聊天记录
export function getEmployeeChatList(page, per_page, id, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/im/message/list?page=' + page + '&per_page=' + per_page + '&employee_id=' + id;
        let data = {};

        request_impl_get(api, method, (res, error) => {
            if (res) {
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
// 给员工发送消息,content_type有 “text” 和 “file”两种类型
export function sendEmployeeMessage(id, content, type, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/im/message/send'
        let data = {
            employee_id: id,
            content_type: type,
            content: content,
        };

        request_impl(api, method, data, (res, error) => {
            if (res) {
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
//给员工发送文件
export function employeeFileUpload(file, callback = null) {
    return (dispatch, getState) => {
        let state = getState();
        let method = 'client_api/upload_oss/file'
        let data = new FormData();
        data.append('file', file);
        request_impl(api, method, data, (res, error) => {
            if (res) {
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
        }, dispatch, { 'Content-Type': 'multipart/form-data' });
    };
}

function request_impl(url, method, data, callback, dispatch = null, header) {
    let headers = {};
    NetInfo.fetch().then(state => {
        if (state.isConnected) {
            // 消息头
            if (header) {
                headers = header;
            }
            else {
                headers['Content-Type'] = 'application/json';
                headers['Accept'] = 'application/json, application/xml, text/play, text/html, *.*';
            }
            Storage.getUserRecord().then((user) => {
                if (user) {
                    let obj = Object.assign({}, JSON.parse(user));
                    headers['token'] = obj.token;
                    request.post(url, method, data, headers,
                        (rs, error) => {
                            // logger(':::: request_impl: ' + JSON.stringify(rs));
                            if (callback) callback(rs, error);
                        },
                        () => {
                            // logger('xyz:::: logout callback ' + reqKey);
                            requestLoginout(dispatch);
                        },
                        () => {

                        }
                    );
                }
                else {
                    request.post(url, method, data, headers,
                        (rs, error) => {
                            logger(':::: error: ' + error);
                            if (callback) callback(rs, error);
                        },
                        () => {
                            logger('xyz:::: logout callback ' + reqKey);
                            requestLoginout(dispatch);
                        },
                        () => {

                        }
                    );
                }
            });
        }
        else {
            destroySibling();
            Toast.show("网络已经离线");
        }
    });
}

function request_impl_get(url, method, callback, dispatch = null) {
    let headers = {};
    NetInfo.fetch().then(state => {
        if (state.isConnected) {
            Storage.getUserRecord().then((user) => {
                logger("request_impl_get", user)
                if (user) {
                    let obj = Object.assign({}, JSON.parse(user));
                    headers['token'] = obj.token;
                    request.get(url, method, headers,
                        (rs, error) => {
                            // logger(':::: rs: ' + JSON.stringify(rs));
                            if (callback) callback(rs, error);
                        },
                        () => {
                            requestLoginout(dispatch);
                        }
                    );
                }
            });
        }
        else {
            destroySibling();
            Toast.show("网络已经离线");
        }
    });

}

function request_impl_get_system(url, method, callback, dispatch = null) {
    let headers = {};
    request.get(url, method, headers,
        (rs, error) => {
            // logger(':::: rs: ' + JSON.stringify(rs));
            if (callback) callback(rs, error);
        },
        () => {
            requestLoginout(dispatch);
        },
        true,
    );
}

function requestLoginout(dispatch = null) {
    DeviceEventEmitter.emit('requestLoginout')
}

