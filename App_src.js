import React,{useState, useEffect} from 'react';
import type {Node} from 'react';
import {
  Platform,
  SafeAreaView,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  Overlay,
  NativeEventEmitter,
  AppState
} from 'react-native';
import {
  WebView
} from 'react-native-webview';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { Recognizer } from 'react-native-speech-iflytek';
// import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, {Importance} from 'react-native-push-notification';
import MainPage from './src/page/MainPage';
import Main from './src/page/main';
const {width: windowWidth,height: windowHeight} = Dimensions.get('window')
const Toast = Overlay.Toast;


const App: () => Node = () => {
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastId, setLastId] = useState(0);
  const wv = React.useRef(null);
  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    Recognizer.init("ed00abad");
     const recognizerEventEmitter = new NativeEventEmitter(Recognizer);
     recognizerEventEmitter.addListener('onRecognizerResult', onRecognizerResult);
     recognizerEventEmitter.addListener('onRecognizerError', onRecognizerError);
     PushNotification.getChannels(function(channels) {
       console.log(channels);
     });
     PushNotification.createChannel(
      {
        channelId: 'NEW_NOTIFICATION', // (required)
        channelName: `任务通知`, // (required)
        channelDescription: "任务提醒通知", // (optional) default: undefined.
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel '任务通知' returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
      return () => {
        AppState.removeEventListener('change', handleAppStateChange);
        recognizerEventEmitter.removeAllListeners('onRecognizerResult');
        recognizerEventEmitter.removeAllListeners('onRecognizerError');
      };},
   [wv.current]);


  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  
  const handleAppStateChange = (nextAppState) => {
    // console.log('****************nextAppState=='+nextAppState);
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('****************show');
        wv && wv.current && wv.current.reload();
    }
    else if (appState === 'active' && nextAppState.match(/inactive|background/)){
      console.log('***************hidden', wv);
      wv && wv.current && wv.current.injectJavaScript(`receiveMessage("stop");true;`);
    }
    setAppState(nextAppState);
  };
  const sendRecording = (value) => {
    return fetch('https://speak.kykyai.cn/make_talk', {
      method:  'POST',
      headers: {
          'content-type':'application/x-www-form-urlencoded'
      },
      // mode: 'cors', // no-cors， cors， same-origin
      // redirect: 'follow', // manual, follow，error
      // referrer: 'no-referrer', // client或no-refer
      // cache: 'no-cache', // default, no-cache, reload, force-cache, 或者 only-if-cached
      // credentials: 'same-origin', // emit，same-origin， include
      body: 'question='+value
    })
    .then((response) => {
        /*  返回数据格式  */
        // alert(JSON.stringify(response))
        if (response.ok) {
          return response.text();
        }
      throw new Error('Network response was not ok.');
    })
    .then((responseData) => {
        /* 请求成功，获取到数据对象responseData  */
        // alert(responseData+'  '+value)
        if(value!='stop_recording' && value!='recording') {
          Toast.show('发送成功')
        }
    })
    .catch((error) => {
      /* 请求失败 */
      Toast.show('发送失败')
      // alert(error.toString()+'  '+value)
    })
  }

  const startRecord = () => {
    sendRecording('recording')
    Recognizer.start();
  }

  const stopRecord = () => {
    Recognizer.stop();
  }

  const onRecognizerResult = (e) => {
    if (!e.isLast) {
        return;
    }
    if(e.result==''){
      Toast.show('不好意思，没听清楚');
      sendRecording('stop_recording');
      return;
    }
    sendRecording(e.result);
  }
 
  const onRecognizerError= (result) => {
    if (result.errorCode !== 0) {
      // alert(JSON.stringify(result));
    }
  }

  const INJECTEDJAVASCRIPT = `
  const meta = document.createElement('meta'); 
  meta.setAttribute('content', 'initial-scale=1, maximum-scale=1, user-scalable=0'); 
  meta.setAttribute('name', 'viewport'); 
  document.getElementsByTagName('head')[0].appendChild(meta);`

  // const onRegister = (token) => {
  //   console.log("token===="+token)
  // }

  // const onNotif = (notif) => {
  //   console.log(notif.title, notif.message);
  //   // notif.finish(PushNotificationIOS.FetchResult.NoData);
  // }

  const scheduleNotfication=(content) =>{ 
    console.log('5555555555555555555555555===='+content);
    PushNotification.localNotification({ 
      channelId: 'NEW_NOTIFICATION',
      title: "任务提醒",
      message: content, 
      id: lastId,
    }); 
    setLastId(lastId+1);
  }

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Main />
        {/* <WebView 
          ref={wv}
          source={{ uri: 'https://human.kykyai.cn' }} 
          scalesPageToFit={false} 
          bounces={false}
          style={{width:windowWidth,height:windowHeight}} 
          javaScriptEnabled={true}
          injectedJavaScript={ INJECTEDJAVASCRIPT }
          onMessage={(event) => {scheduleNotfication(event.nativeEvent.data)}}
          mediaPlaybackRequiresUserAction={((Platform.OS !== 'android') || (Platform.Version >= 17)) ? false : undefined}
          userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
        />
        <View style={styles.content}>
          <View style={styles.pressView}>
            <TouchableOpacity style={styles.pressBtn} onLongPress={startRecord} onPressOut={stopRecord}>
              <Text style={styles.pressBtnTxt}>长按提问</Text>
            </TouchableOpacity>
          </View>
        </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  content: {
    position: 'absolute',
    height: windowHeight,
    width: windowWidth,
    zIndex: 99998
  },
  pressView: {
    position: 'absolute',
    height: 230,
    width: '100%',
    bottom: 50,
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    zIndex: 99999
  },
  pressBtn: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: '#4C5164',
    opacity: 0.6,
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
  },
  pressBtnTxt: {
    fontSize: 16,
    color: '#fff',
  },
});

export default App;
