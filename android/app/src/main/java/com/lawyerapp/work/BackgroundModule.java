package com.lawyerapp.work;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.lawyerapp.task.WebSocketTaskService;

import java.util.concurrent.TimeUnit;

import javax.annotation.Nonnull;

public class BackgroundModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "WebSocketWorkManager";

    private Context mContext;
    private PeriodicWorkRequest workRequest;
    Intent service;
    BackgroundModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
//        workRequest = new PeriodicWorkRequest.Builder(BackgroundWorker.class, 2, TimeUnit.SECONDS).build();
    }

    @ReactMethod
    public void startBackgroundWork() {
        Log.e("com.lawyerapp", "BackgroundModule do work");
//        WorkManager.getInstance(mContext).enqueueUniquePeriodicWork("testWork", ExistingPeriodicWorkPolicy.KEEP,workRequest);

        service = new Intent(mContext, WebSocketTaskService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            mContext.startForegroundService(service);
        } else {
            mContext.startService(service);
        }
        HeadlessJsTaskService.acquireWakeLockNow(mContext);
    }

    @ReactMethod
    public void stopBackgroundWork() {
//        WorkManager.getInstance(mContext).cancelUniqueWork("testWork");
        mContext.stopService(service);
    }

    @Nonnull
    @Override
    public String getName() {
        return MODULE_NAME;
    }
}