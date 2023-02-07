import { DeviceEventEmitter } from 'react-native';
import { Client, Message } from '@stomp/stompjs';
const url = 'ws://192.168.30.79:15674/ws';
const name = 'root';
const password = '123456';
const host = 'demo_vhost';

export default class WebSocketClient {
  static myInstance = null;
  static ws = null;
  static subscription = null;
  constructor() {
      this.stompConfig = {
        connectHeaders: {
            login: name,
            passcode: password,
            host: host,
        },
        brokerURL: url,
        debug: function (str) {
            console.log('STOMP: ' + str);
        },
        reconnectDelay: 200,
        onConnect: function (frame) {
            console.log('############connected'+WebSocketClient.ws.connected)
            // if(!WebSocketClient.subscription) {
              WebSocketClient.subscription = WebSocketClient.ws.subscribe("/exchange/alarm-clock/employee_id.1", function (message) {
                console.log('############'+message.body);
                DeviceEventEmitter.emit('noticeMsg', message.body);
             });
            // }
            
        },
        onStompError:  (frame) => {
            console.log('Additional details: ' + frame.body);
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

  initWebSocket() {
    if (!WebSocketClient.ws) {
      WebSocketClient.ws = new Client(this.stompConfig);  
    }
    console.log('############'+WebSocketClient.ws.connected)
    if(!WebSocketClient.ws.connected) {
      WebSocketClient.ws.activate();
    }
  }

  onDisconnectWS() {
    WebSocketClient.ws && WebSocketClient.ws.forceDisconnect();
  }
}