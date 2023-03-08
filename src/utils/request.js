import axios from "axios";
import Error from "./Error";
import {Overlay} from 'react-native';
import { showToast } from "../components/ShowModal";
const Toast = Overlay.Toast;

axios.defaults.withCredentials = true; // 跨域请求时是否需要使用凭证

// 最终发送的数据
let isUpdate = false;
let request = {
    /**
     * http get 请求简单封装
     * @param url 请求的URL
     * @param callback 请求成功回调
     * @param failCallback 请求失败回调
     */
    get: (url, method, headers, callback, failCallback) => {
        console.log(url + method)
        console.log(headers)
        axios({
            url:url + method,
            method:'GET',
            headers: headers,
        }).then((rs) => {
            let err = null;
            if(rs && rs.status && rs.status == 200){
                if (rs && rs.data && rs.data.code && rs.data.code!== 0) {
                    err = new Error(Error.ERR_REQ, rs.code, rs.msg, method);
                }
            }
            if (err) {
                if (callback) callback(null, err);
            } else {
                if (callback) callback(rs.data, err);
            }
        }).catch((error) => {
            console.log(error);
            Toast.show("网络错误");
            failCallback(error);
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
    post: (url, method, data, headers, callback, logoutCallback, updateCallback) => {
        console.log(url + method)
        console.log(data)
        axios({
            url: url + method,
            method: 'POST',
            headers: headers,
            data: data,
            // responseType: 'json'
        }).then((rs) => {
            let err = null;
            // console.log(rs)
            if(rs && rs.status && rs.status == 200){
                if (rs && rs.data && rs.data.code && rs.data.code!== 0) {
                    err = new Error(Error.ERR_REQ, rs.data.code, rs.data.data && rs.data.data.msg ?  rs.data.data.msg : rs.data.msg, method);
                }
            }
            if (err) {
                if (callback) callback(null, err);
            } else {
                if (callback) callback(rs.data, err);
            }
        }).catch((error) => {
            console.log(error);
            Toast.show("网络错误");
        });
    },
};

export default request;
