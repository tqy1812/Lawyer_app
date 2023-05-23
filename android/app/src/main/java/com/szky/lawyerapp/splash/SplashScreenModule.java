package com.szky.lawyerapp.splash;

import static android.content.Context.MODE_PRIVATE;

import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.szky.lawyerapp.MainActivity;

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
    public void hide(Callback successCallback) {
        try {
            SplashScreen.hide(getCurrentActivity());
            successCallback.invoke(MainActivity.getIsOpenFromNotify());
        } catch (IllegalViewOperationException e){

        }
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

