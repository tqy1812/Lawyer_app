package com.szky.lawyerapp.screen;
import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.WindowManager;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.szky.lawyerapp.MainActivity;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationManagerCompat;

import java.lang.reflect.Method;
public class ScreenAdaptation extends ReactContextBaseJavaModule{

    DisplayMetrics metrics = new DisplayMetrics();

    public ScreenAdaptation(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "ScreenAdaptation";
    }
    //小米全屏高度
    @ReactMethod
    public void getHeight(final Promise promise) {
        int height = metrics.heightPixels;
        Activity activty = MainActivity.getActivity();
        if (isXiaoMi(getReactApplicationContext())) {
            height += getNavigationBarHeight(activty);
        }else {
            height=0 ;
        }
        promise.resolve(height);
    }


    /**
     * 获取底部虚拟按键高度
     * @param context
     * @return
     */
    public static int getNavigationBarHeight(Context context) {
        WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        Display display = windowManager.getDefaultDisplay();
        DisplayMetrics dm = new DisplayMetrics();
        try {
            @SuppressWarnings("rawtypes")
            Class c = Class.forName("android.view.Display");
            @SuppressWarnings("unchecked")
            Method method = c.getMethod("getRealMetrics", DisplayMetrics.class);
            method.invoke(display, dm);
            return dm.heightPixels - display.getHeight();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }


    /**
     * 获取版本号
     * @param successCallback
     * @return
     */
    @ReactMethod
    public void getAppVersion(Callback successCallback) {
        try {
            PackageInfo info = getPackageInfo();
            if(info != null){
                successCallback.invoke(info.versionName);
            }else {
                successCallback.invoke("");
            }
        } catch (IllegalViewOperationException e){

        }
    }

    //测试远程推送通知打开传值
    @ReactMethod
    public void testMessageOpen(Callback callback) {
        callback.invoke(MainActivity.getTextMessageOpen());
    }
    //测试远程推送通知打开传值
    @ReactMethod
    public void testMessage(Callback callback) {
        callback.invoke(MainActivity.getTextMessage());
    }
    //第一次打开app开启通知设置判断
    @ReactMethod
    public void isOpenNotify(Callback callback) {
        callback.invoke(MainActivity.isOpenNotifySetting());
    }
    //是否第一次打开app值保存
    @ReactMethod
    public void saveSetting() {
        MainActivity.saveSetting();
    }
    //退出关闭app
    @ReactMethod
    public void exitApp() {
        MainActivity.exitApp();
    }

    //打开通知设置
    @ReactMethod
    public void openNotify() {
        MainActivity.open();
    }
    //获取 APP 信息
    private PackageInfo getPackageInfo(){
        PackageManager manager = getReactApplicationContext().getPackageManager();
        PackageInfo info = null;
        try{
            info = manager.getPackageInfo(getReactApplicationContext().getPackageName(),0);
            return info;
        }catch (Exception e){
            e.printStackTrace();
        }finally {

            return info;
        }
    }
    /**
     * 判断是否是小米手机 并且是否开启全面屏
     *
     * @return
     */
    public static boolean isXiaoMi(Context context) {
        if (Build.MANUFACTURER.equals("Xiaomi")) {
            return Settings.Global.getInt(context.getContentResolver(), "force_fsg_nav_bar", 0) != 0;
        }
        return false;
    }

    @Override
    public void initialize() {
        if(MainActivity.getActivity()!=null) {
            MainActivity.getActivity().getWindowManager().getDefaultDisplay().getMetrics(metrics);
        }
    }

    @Override
    public boolean canOverrideExistingModule() {
        return false;
    }

    @Override
    public void onCatalystInstanceDestroy() {

    }
}
