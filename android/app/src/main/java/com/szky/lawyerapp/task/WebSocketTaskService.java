package com.szky.lawyerapp.task;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Data;
import androidx.work.WorkerParameters;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceEventListener;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.facebook.react.jstasks.HeadlessJsTaskEventListener;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.annotation.Nullable;

import io.github.wjaykim.rnheadlesstaskworker.HeadlessJsTaskWorker;
import android.app.Notification.Builder;
import android.net.Uri;

import java.util.concurrent.atomic.AtomicBoolean;

public class WebSocketTaskService extends Service {

    private Handler handler;
    private Runnable runnable;
    private PowerManager powerManager;
    private PowerManager.WakeLock wakeLock;
    private NotificationManager notificationManager;
    private final LifecycleEventListener listener = new LifecycleEventListener(){
        @Override
        public void onHostResume() {}

        @Override
        public void onHostPause() {}

        @Override
        public void onHostDestroy() {
            if (wakeLock.isHeld()) wakeLock.release();
        }
    };
    private void createNotification() {
        notificationManager = (NotificationManager)this.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (notificationManager.getNotificationChannel("PUSH_TRANSIENT_NTC_ID") == null) {
                NotificationChannel channel = new NotificationChannel("PUSH_TRANSIENT_NTC_ID", this.getClass().getSimpleName(), NotificationManager.IMPORTANCE_HIGH);
                channel.enableLights(false);
                channel.enableVibration(false);
                channel.setSound((Uri)null, (AudioAttributes)null);
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                notificationManager.createNotificationChannel(channel);
            }

            Notification notification = (new Builder(this, "PUSH_TRANSIENT_NTC_ID")).setContentTitle(WebSocketTaskService.class.getSimpleName()).build();
            this.startForeground(2147483646, notification);
        }
    }
    @Override
    public void onCreate() {
        super.onCreate();

    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotification();
        this.startTimer();
        return super.onStartCommand(intent, flags, startId);
    }

    public void startTimer() {
        final ReactInstanceManager reactInstanceManager = this.getReactNativeHost().getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
        if (reactContext == null) {
            reactInstanceManager.addReactInstanceEventListener(new ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext reactContext) {
                    invokeStartTimer(reactContext);
                    reactInstanceManager.removeReactInstanceEventListener(this);
                }
            });
            reactInstanceManager.createReactContextInBackground();
        } else {
            invokeStartTimer(reactContext);
        }
    }


    protected ReactNativeHost getReactNativeHost() {
        return ((ReactApplication)this.getApplication()).getReactNativeHost();
    }

    @SuppressLint("InvalidWakeLockTag")
    public void invokeStartTimer (ReactContext reactContext) {
        powerManager = (PowerManager) Assertions.assertNotNull((PowerManager)this.getSystemService(Context.POWER_SERVICE));
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK|PowerManager.ON_AFTER_RELEASE, "bg_wakelock");
        reactContext.addLifecycleEventListener(listener);
        if (!wakeLock.isHeld()) wakeLock.acquire();
        if (handler == null) {
            handler = new Handler();
            runnable = new Runnable() {
                @Override
                public void run() {
                    if (reactContext.hasActiveCatalystInstance()) {
                        sendEvent(reactContext, "keepTimer");
                    }
                    handler.postDelayed(this, 5000);
                }
            };
            handler.postDelayed(runnable, (long) 5000);
        }
    }

    @Override
    public void onDestroy() {
        Log.e("com.szky.lawyerapp", "WebSocketTaskService onDestroy");
//        if (wakeLock.isHeld()) wakeLock.release();
//        if (handler != null) handler.removeCallbacks(runnable);
        Intent service = new Intent(this, WebSocketTaskService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(service);
        } else {
            startService(service);
        }
//        stopForeground(true);
        super.onDestroy();
    }

    @androidx.annotation.Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void sendEvent(ReactContext reactContext, String eventName) {
        Log.e("com.szky.lawyerapp", "WebSocketTaskService sendEvent "+ eventName);
        Intent intent = new Intent("com.alive.ticket");
        intent.putExtra("eventName", eventName);
        this.sendBroadcast(intent);
//        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, null);
    }
}
