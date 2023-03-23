import { DeviceEventEmitter } from 'react-native';
import { Client, Message } from '@stomp/stompjs';
import BackgroundTimer from 'react-native-background-timer';
import NetInfo from '@react-native-community/netinfo';
import { logger } from './utils';
import * as Storage from '../common/Storage';
// const url = 'ws://192.168.30.96:15674/ws';
// const url = 'ws://59.52.103.97:15674/ws';
const url = 'wss://ws.kykyai.cn/ws';
const name = 'ky_root';
const password = 'KYlawyer2023';
const host = 'lawyer_vhost';

export default class WebSocketClient {
  static myInstance = null;
  static ws = null;
  static subscription = null;
  static userId = 1;
  isBackground = false;
  keepSocket= null;
  constructor() {
      this.stompConfig = {
        connectHeaders: {
            login: name,
            passcode: password,
            host: host,
        },
        brokerURL: url,
        debug: function (str) {
            logger('debug STOMP: ' + str);
            if(str=='Issuing close on the websocket') {
            Storage.getAutoLogin().then((login) => {
              logger("debug STOMP login: ", login);
              if (login=='1') {
                  WebSocketClient.myInstance.initWebSocket(WebSocketClient.userId);
              }
            });
          }
        },
        reconnectDelay: 5000,
        onConnect: function (frame) {
          logger('############connected'+WebSocketClient.ws.connected, WebSocketClient.ws.active)
            // if(!WebSocketClient.subscription) {
          DeviceEventEmitter.emit('wsBind', WebSocketClient.userId);
            // }
 
        },
        onDisconnect: function (frame) {
          logger('STOMP onDisconnect details: ' + frame.body);
        },
        onStompError:  (frame) => {
          logger('STOMP onStompError details: ' + frame.body);
        },
        onWebSocketClose:  (evn) => {
          logger('STOMP onWebSocketClose details: ', this.isBackground);
          Storage.getAutoLogin().then((login) => {
            logger("debug STOMP login: ", login);
            if (login=='1') {
            WebSocketClient.myInstance.initWebSocket(WebSocketClient.userId); }
          });
          // if(this.isBackground)  {
          //   this.keepSocket = BackgroundTimer.setInterval(() => {
          //     logger('.....state', WebSocketClient.ws.webSocket.readyState)
          //     if (WebSocketClient.ws.webSocket.readyState === 1) {
          //       WebSocketClient.ws.webSocket.send('\x0A');
          //       logger('>>> PING');
          //     }
          //   }, 5000);
          // }
        },
        onChangeState:  (state) => {
          logger('STOMP onChangeState details: ', state);
        },
        onWebSocketError:  (evn) => {
          logger('STOMP onWebSocketError details: ');
        },
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        heartbeatIncoming: 5000,
        heartbeatOutgoing: 5000,
    }
  }

  /**
   * 获取WebSocket单例
   * @returns {WebSocketClient}
   */
  static getInstance() {
      if (!WebSocketClient.myInstance) {
        WebSocketClient.myInstance = new WebSocketClient();
      }
      return WebSocketClient.myInstance;
  }

  initWebSocket(id) {
    NetInfo.fetch().then(state => {
      logger("Is connected?", state.isConnected);
      if(state.isConnected) {
        if(!WebSocketClient.ws) {
          logger('############', WebSocketClient.ws)
          WebSocketClient.ws = new Client(this.stompConfig);  
          WebSocketClient.ws.activate();
        }
        // if (!WebSocketClient.ws || !WebSocketClient.ws.webSocket) {
        //   WebSocketClient.ws = new Client(this.stompConfig);  
        // }
        // logger('############'+WebSocketClient.ws.connected + "" + WebSocketClient.ws.active + '.....id' + id)
        // if(!WebSocketClient.ws.connected) {
        //   WebSocketClient.ws.activate();
        // } else if (WebSocketClient.ws.webSocket && WebSocketClient.ws.webSocket.readyState!==1){
        //   logger('############'+WebSocketClient.ws.webSocket.readyState)
        //   WebSocketClient.ws = new Client(this.stompConfig);  
        //   WebSocketClient.ws.activate();
        // }
      }
    });
    WebSocketClient.userId = id;
  }

  onDisconnectWS() {
    logger('############onDisconnectWS')
    if(WebSocketClient.subscription) WebSocketClient.subscription.unsubscribe();
    // WebSocketClient.ws && WebSocketClient.ws.deactivate();
  }

  onSubscription(id) {
    if(WebSocketClient.subscription) WebSocketClient.subscription.unsubscribe();

    WebSocketClient.subscription = WebSocketClient.ws.subscribe("/exchange/alarm-clock/employee_id."+id, function (message) {
      logger('############'+message.body);
      DeviceEventEmitter.emit('noticeMsg', message.body);
   });
  }

  setIsBackground(value) {
    this.isBackground = value;
  }

  getKeepSocket() {
    return this.keepSocket;
  }

  backTimer () {
       this.keepSocket = BackgroundTimer.setInterval(() => {
        logger('.....state', WebSocketClient.ws.webSocket.readyState)
              if (WebSocketClient.ws.webSocket.readyState === 1) {
                WebSocketClient.ws.webSocket.send('\x0A');
                logger('>>> PING');
              }
            }, 5000);
  }

  keepAlive () {
    logger('.....keepAlive')
    NetInfo.fetch().then(state => {
      logger("keepAlive Is connected?", state.isConnected);
      // logger('.....state', WebSocketClient.ws.webSocket.readyState)
      // logger( WebSocketClient.ws);
      if(state.isConnected) {
        if (this.isBackground && WebSocketClient.ws && WebSocketClient.ws.webSocket && WebSocketClient.ws.webSocket.readyState === 1) {
          WebSocketClient.ws.webSocket.send('\x0A');
          logger('>>> PING');
        } 
        // else {
        //   WebSocketClient.ws = new Client(this.stompConfig);  
        //   WebSocketClient.ws.activate();
        // }
      }
  });
  }
}
