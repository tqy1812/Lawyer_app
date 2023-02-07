import AsyncStorage from '@react-native-community/async-storage';
const userRecord = 'userRecord';
const autoLogin = 'autoLogin';
const caseList = 'caseList';
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
              // console.log("::::getUserRecord"+ error);
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
              // console.log("::::getAutoLogin"+ error);
              return '0';
          });
  };
  
  export const setAutoLogin = async (login) => {
    await AsyncStorage.setItem(autoLogin, login, null);
  };
  
  export const getCaseList = async () => {
    return await AsyncStorage.getItem(caseList)
          .then((item) => {
              if (item) {
                  return item;
              } else {
                  return null;
              }
          })
          .catch(error => {
              // console.log("::::getUserRecord"+ error);
              return null;
          });
  };
  
  export const setCaseList = async (list) => {
    await AsyncStorage.setItem(caseList, list,null);
  };