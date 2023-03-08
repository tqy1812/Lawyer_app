let isCalled = false, timer;
import { Overlay } from "react-native";
import { logger } from "./utils";
const Toast = Overlay.Toast;
/**
 * @param functionTobeCalled method 对调函数体
 * @param interval  定时器
 */
export default function HandlerOnceTap(functionTobeCalled, interval = 900) {
  if (!isCalled) {
    isCalled = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      isCalled = false;
    }, interval);
    return functionTobeCalled();
  }
  else {
    logger('点击太快');
    // Toast.info('点击太快', 1);
  }
};
