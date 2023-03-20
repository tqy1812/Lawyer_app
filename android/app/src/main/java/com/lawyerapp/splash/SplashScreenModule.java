package com.lawyerapp.splash;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SplashScreenModule extends ReactContextBaseJavaModule {
    public SplashScreenModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "SplashScreen";
    }

    /**
     * 打开启动屏
     */
    @ReactMethod
    public void show() {
        SplashScreen.show(getCurrentActivity());
    }

    /**
     * 关闭启动屏
     */
    @ReactMethod
    public void hide() {

        Log.i("MainActivity", "22hide*************");
        SplashScreen.hide(getCurrentActivity());
    }

    /**
     * 退出程序
     */
    @ReactMethod
    public void exit() {
        if (getCurrentActivity() != null)
            getCurrentActivity().finish();
        System.exit(0);
    }

}

