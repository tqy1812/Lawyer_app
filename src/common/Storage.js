import AsyncStorage from '@react-native-community/async-storage';
import {logger} from '../utils/utils'
const userRecord = 'userRecord';
const autoLogin = 'autoLogin';
const caseList = 'caseList_';
const caseListUseColor = 'caseListUseColor_';
const version = 'version';
const isFirstOpen = 'isFirstOpen';
const isFirstGuide = 'isFirstGuide';
export const getUserRecord = async () => {
    return await AsyncStorage.getItem(userRecord)
          .then((user) => {
              if (user) {
                  return user;
              } else {
                  return null;
              }
          })
          .catch(error => {
              // logger("::::getUserRecord"+ error);
              return null;
          });
  };

  export const setUserRecord = async (user) => {
    await AsyncStorage.setItem(userRecord, user,null);
  };

  export const getAutoLogin = async () => {
    return await AsyncStorage.getItem(autoLogin)
          .then((login) => {
              if (login) {
                  return login;
              } else {
                  return '0';
              }
          })
          .catch(error => {
              // logger("::::getAutoLogin"+ error);
              return '0';
          });
  };

  export const setAutoLogin = async (login) => {
    await AsyncStorage.setItem(autoLogin, login, null);
  };

  export const getCaseList = async (phone) => {
    return await AsyncStorage.getItem(caseList + phone)
          .then((item) => {
              if (item) {
                  return item;
              } else {
                  return null;
              }
          })
          .catch(error => {
              // logger("::::getUserRecord"+ error);
              return null;
          });
  };

  export const setCaseList = async (phone,list) => {
    await AsyncStorage.setItem(caseList+phone, list,null);
  };

  export const getCaseListUserColor = async (phone) => {
    return await AsyncStorage.getItem(caseListUseColor+phone)
          .then((item) => {
              if (item) {
                  return item;
              } else {
                  return null;
              }
          })
          .catch(error => {
              // logger("::::getUserRecord"+ error);
              return null;
          });
  };

  export const setCaseListUserColor = async (phone,list) => {
    await AsyncStorage.setItem(caseListUseColor+phone, list.toString(),null);
  };


  export const getVersion= async () => {
    return await AsyncStorage.getItem(version)
          .then((v) => {
              if (v) {
                  return v;
              } else {
                  return '';
              }
          })
          .catch(error => {
              // logger("::::getAutoLogin"+ error);
              return '';
          });
  };

  export const setVersion = async (v) => {
    await AsyncStorage.setItem(version, v, null);
  };

  export const getIsFirshOpen = async () => {
    return await AsyncStorage.getItem(isFirstOpen)
          .then((v) => {
              if (v) {
                  return v;
              } else {
                  return '0';
              }
          })
          .catch(error => {
              // logger("::::getAutoLogin"+ error);
              return '0';
          });
  };
  // 0：第一次打开  1：非第一次打开
  export const setIsFirshOpen = async (v) => {
    await AsyncStorage.setItem(isFirstOpen, v, null);
  };

  export const getIsFirshGuide = async () => {
    return await AsyncStorage.getItem(isFirstGuide)
          .then((v) => {
              if (v) {
                  return v;
              } else {
                  return '0';
              }
          })
          .catch(error => {
              // logger("::::getAutoLogin"+ error);
              return '0';
          });
  };
  // 0：第一次向导  1：非第一次向导
  export const setIsFirshGuide = async (v) => {
    await AsyncStorage.setItem(isFirstGuide, v, null);
  };
