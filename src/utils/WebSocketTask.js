
import WebSocketClient from "../utils/WebSocketClient";
module.exports = async (taskData) => {
    // do stuff
    WebSocketClient.getInstance().initWebSocket();
};