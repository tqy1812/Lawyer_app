import axios from "axios";
import Error from "./Error";
import {Overlay} from 'react-native';
import { destroySibling } from "../components/ShowModal";
import { logger } from "./utils";
const Toast = Overlay.Toast;

axios.defaults.withCredentials = true; // 跨域请求时是否需要使用凭证

// 最终发送的数据
let isUpdate = false;
let request = {
    /**
     * http get 请求简单封装
     * @param url 请求的URL
     * @param callback 请求成功回调
     * @param logoutCallback 
     */
    get: (url, method, headers, callback, logoutCallback, isHiddenToast) => {
        logger(url + method)
        logger(headers)
        axios({
            url:url + method,
            method:'GET',
            headers: headers,
        }).then((rs) => {
            let err = null;
            // logger(rs)
            if(rs && rs.status && rs.status == 200){
                if (rs && rs.data && rs.data.code && rs.data.code!== 0) {
                    err = new Error(Error.ERR_REQ, rs.data.code, rs.data.msg, method);
                }
            }
            if (err) {
                if(err.code === 10007){  //token过期
                    if (logoutCallback) logoutCallback()
                    destroySibling();
                    return;
                }
                if (callback) callback(null, err);
            } else {
                if (callback) callback(rs.data, err);
            }
        }).catch((error) => {
            logger(error);
            destroySibling();
            if(!isHiddenToast) {
                Toast.show("抱歉!服务器无法连接,请稍后再试!");
            }
            // failCallback(error);
        });
    },

    /**
     * http post 请求简单封装
     * @param url 请求的URL
     * @param data post的数据
     * @param headers 请求头
     * @param callback 请求成功回调
     * @param logoutCallback
     * @param updateCallback
     */
    post: (url, method, data, headers, callback, logoutCallback, updateCallback, isHiddenToast) => {
        logger(url + method)
        logger(data)
        axios({
            url: url + method,
            method: 'POST',
            headers: headers,
            data: data,
            // responseType: 'json'
        }).then((rs) => {
            let err = null;
            logger(rs)
            if(rs && rs.status && rs.status == 200){
                if (rs && rs.data && rs.data.code && rs.data.code!== 0) {
                    err = new Error(Error.ERR_REQ, rs.data.code, rs.data.msg, method);
                }
            }
            if (err) {
                if(err.code === 10007){  //token过期
                    if (logoutCallback) logoutCallback()
                    destroySibling();
                    return;
                }
                if (callback) callback(null, err);
            } else {
                if (callback) callback(rs.data, err);
            }
        }).catch((error) => {
            logger(error);
            destroySibling();
            if(!isHiddenToast) {
                Toast.show("抱歉!服务器无法连接,请稍后再试!");
            }
        });
    },
};

export default request;
