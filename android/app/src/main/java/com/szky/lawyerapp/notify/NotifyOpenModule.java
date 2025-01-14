package com.szky.lawyerapp.notify;

import static android.content.Context.MODE_PRIVATE;

import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.szky.lawyerapp.MainActivity;

import javax.annotation.Nonnull;

public class NotifyOpenModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "NotifyOpen";

    private Context mContext;

    private static String[] PERMISSIONS_STORAGE = {Manifest.permission.RECORD_AUDIO};
    private static String[] PERMISSIONS_CAMERA = {Manifest.permission.CAMERA};
    private static String[] PERMISSIONS_MEDIA = {Manifest.permission.WRITE_EXTERNAL_STORAGE};
    private static String[] PERMISSIONS_MEDIA1 = {Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_MEDIA_IMAGES};
    private static int REQUEST_PERMISSION_CODE = 1;
    NotifyOpenModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @ReactMethod
    public void open() {
        Intent intent = new Intent();
        if (Build.VERSION.SDK_INT >= 26) {
            // android 8.0引导
            intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
            intent.putExtra("android.provider.extra.APP_PACKAGE", mContext.getPackageName());
        } else if (Build.VERSION.SDK_INT >= 21) {
            // android 5.0-7.0
            intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
            intent.putExtra("app_package", mContext.getPackageName());
            intent.putExtra("app_uid", mContext.getApplicationInfo().uid);
        } else {
            // 其他
            intent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
            intent.setData(Uri.fromParts("package", mContext.getPackageName(), null));
        }
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        mContext.startActivity(intent);
    }

    @ReactMethod
    public void openPermission() {
        Intent intent = new Intent();
        intent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
        intent.setData(Uri.fromParts("package", mContext.getPackageName(), null));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        mContext.startActivity(intent);
    }

    @ReactMethod
    public void getRecordPermission(final Promise promise) {
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP) {
            if (ActivityCompat.checkSelfPermission(mContext, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                Log.i("getRecordPermission", "shouldShowRequestPermissionRationale="+ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.getActivity(), android.Manifest.permission.RECORD_AUDIO));
                if(ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.getActivity(), android.Manifest.permission.RECORD_AUDIO)) {
                    promise.resolve(1);
                } else {
                    promise.resolve(0);
                    if (MainActivity.getActivity() != null) {
                        ActivityCompat.requestPermissions(MainActivity.getActivity(), PERMISSIONS_STORAGE, REQUEST_PERMISSION_CODE);
                    }
                }
            }
            else{
                Log.i("getRecordPermission", "111");
                promise.resolve(2);
            }
        }
    }

    @ReactMethod
    public void getRecordCamera(final Promise promise) {
        Log.i("getRecordCamera", "getRecordCamera");
            if (ActivityCompat.checkSelfPermission(mContext, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                Log.i("getRecordCamera", "shouldShowRequestPermissionRationale="+ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.getActivity(), android.Manifest.permission.CAMERA));
                if(ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.getActivity(), android.Manifest.permission.CAMERA)) {
                    promise.resolve(1);
                } else {
                    promise.resolve(0);
                    if (MainActivity.getActivity() != null) {
                        ActivityCompat.requestPermissions(MainActivity.getActivity(), PERMISSIONS_CAMERA, REQUEST_PERMISSION_CODE);
                    }
                }
            }
            else{
                Log.i("getRecordCamera", "111");
                promise.resolve(2);
            }

    }
    @ReactMethod
    public void getMediaPermission(final Promise promise) {
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP && Build.VERSION.SDK_INT <= Build.VERSION_CODES.TIRAMISU ) {
            if (ActivityCompat.checkSelfPermission(mContext, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                Log.i("getRecordPermission", "shouldShowRequestPermissionRationale="+ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.getActivity(), android.Manifest.permission.WRITE_EXTERNAL_STORAGE));
                if(ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.getActivity(), android.Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
                    promise.resolve(1);
                } else {
                    promise.resolve(0);
                    if (MainActivity.getActivity() != null) {
                        ActivityCompat.requestPermissions(MainActivity.getActivity(), PERMISSIONS_MEDIA, REQUEST_PERMISSION_CODE);
                    }
                }
            }
            else{
                Log.i("getMediaPermission", "111");
                promise.resolve(2);
            }
        }
        else if (Build.VERSION.SDK_INT > Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(mContext, Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                Log.i("getRecordPermission", "shouldShowRequestPermissionRationale="+ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.getActivity(), android.Manifest.permission.READ_MEDIA_IMAGES));
                if(ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.getActivity(), android.Manifest.permission.READ_MEDIA_IMAGES)) {
                    promise.resolve(1);
                } else {
                    promise.resolve(0);
                    if (MainActivity.getActivity() != null) {
                        ActivityCompat.requestPermissions(MainActivity.getActivity(), PERMISSIONS_MEDIA1, REQUEST_PERMISSION_CODE);
                    }
                }
            }
            else{
                Log.i("getMediaPermission", "111");
                promise.resolve(2);
            }
        }
    }

    @ReactMethod
    public void getDeviceType(Callback successCallback) {
        try {
            String type = android.os.Build.BRAND;
            if(type != null){
                successCallback.invoke(type.toUpperCase());
            }else {
                successCallback.invoke("");
            }
        } catch (IllegalViewOperationException e){

        }
    }

    @ReactMethod
    public void getDeviceToken(Callback successCallback) {
        try {
            SharedPreferences shared = MainActivity.getActivity().getSharedPreferences("notifyData", MODE_PRIVATE);
            String token = shared.getString("deviceToken", "");
            if(token != null){
                successCallback.invoke(token);
            }else {
                successCallback.invoke("");
            }
        } catch (IllegalViewOperationException e){

        }
    }
    @Nonnull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void getAudioDir(Callback successCallback) {
        try {
            successCallback.invoke(MainActivity.getWavFilePath());
        } catch (IllegalViewOperationException e){

        }
    }
}
