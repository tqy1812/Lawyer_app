package com.lawyerapp.notify;

import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.lawyerapp.MainActivity;

import javax.annotation.Nonnull;

public class NotifyOpenModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "NotifyOpen";

    private Context mContext;

    private static String[] PERMISSIONS_STORAGE = {Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.RECORD_AUDIO};
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


    @Nonnull
    @Override
    public String getName() {
        return MODULE_NAME;
    }
}