import { DeviceEventEmitter } from 'react-native';
import { Client, Message } from '@stomp/stompjs';
import BackgroundTimer from 'react-native-background-timer';
const url = 'ws://192.168.30.96:15674/ws';
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
            console.log('debug STOMP: ' + str);
        },
        reconnectDelay: 200,
        onConnect: function (frame) {
          console.log('############connected'+WebSocketClient.ws.connected, WebSocketClient.ws.webSocket, WebSocketClient.ws.active)
            // if(!WebSocketClient.subscription) {
          DeviceEventEmitter.emit('wsBind', WebSocketClient.userId);
            // }
 
        },
        onDisconnect: function (frame) {
            console.log('STOMP onDisconnect details: ' + frame.body);
        },
        onStompError:  (frame) => {
            console.log('STOMP onStompError details: ' + frame.body);
        },
        onWebSocketClose:  (evn) => {
          console.log('STOMP onWebSocketClose details: ', this.isBackground);
          WebSocketClient.myInstance.initWebSocket(WebSocketClient.userId);
          if(this.isBackground)  {
            this.keepSocket = BackgroundTimer.setInterval(() => {
              console.log('.....state', WebSocketClient.ws.webSocket.readyState)
              if (WebSocketClient.ws.webSocket.readyState === 1) {
                WebSocketClient.ws.webSocket.send('\x0A');
                console.log('>>> PING');
              }
            }, 5000);
          }
        },
        onWebSocketError:  (evn) => {
          console.log('STOMP onWebSocketError details: ');
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
      if (!WebSocketClient.ws) {
        WebSocketClient.myInstance = new WebSocketClient();
      }
      return WebSocketClient.myInstance;
  }

  initWebSocket(id) {
    if (!WebSocketClient.ws || !WebSocketClient.ws.webSocket) {
      WebSocketClient.ws = new Client(this.stompConfig);  
    }
    console.log('############'+WebSocketClient.ws.connected + '.....id' + id)
    if(!WebSocketClient.ws.connected) {
      WebSocketClient.ws.activate();
    }
    WebSocketClient.userId = id;
  }

  onDisconnectWS() {
    WebSocketClient.ws && WebSocketClient.ws.forceDisconnect();
  }

  onSubscription(id) {
     WebSocketClient.subscription = WebSocketClient.ws.subscribe("/exchange/alarm-clock/employee_id."+id, function (message) {
      console.log('############'+message.body);
      DeviceEventEmitter.emit('noticeMsg', message.body);
   });
  }

  setIsBackground(value) {
    this.isBackground = value;
  }

  getKeepSocket() {
    return this.keepSocket;
  }
}
