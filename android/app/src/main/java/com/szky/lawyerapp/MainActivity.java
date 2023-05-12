package com.szky.lawyerapp;

import android.Manifest;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.hihonor.push.sdk.HonorPushCallback;
import com.hihonor.push.sdk.HonorPushClient;
import com.huawei.hms.aaid.HmsInstanceId;
import com.huawei.hms.common.ApiException;
import com.huawei.hms.utils.Util;
import com.szky.lawyerapp.R;
import com.szky.lawyerapp.common.BrandUtils;
import com.szky.lawyerapp.splash.SplashScreen;

public class MainActivity extends ReactActivity {
  private static String[] PERMISSIONS_STORAGE = {Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.RECORD_AUDIO};
  private static int REQUEST_PERMISSION_CODE = 1;
  private static final String TAG_HUNG_UP = "HUNG_UP";
  private static final String ACTION_FROM_NOTIFICATION = BuildConfig.APPLICATION_ID + ".ACTION_FROM_NOTIFICATION";
  Intent intent;
  private static MainActivity context;
  public static Activity getActivity() {
    return context;
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "LawyerApp";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }

  @Override
  protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    if (outState != null) { outState.clear(); }
  }
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this,true);//显示Dialog
    super.onCreate(savedInstanceState);
    intent = getIntent();

    Log.i("MainActivity", "******************************onCreate===="+android.os.Build.BRAND);
    context = this;
    MainApplication.getInstance().createNotificationChannel();
//    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP) {
//      if (ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
//        ActivityCompat.requestPermissions(this, PERMISSIONS_STORAGE, REQUEST_PERMISSION_CODE);
//      }
//      if (ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
//        ActivityCompat.requestPermissions(this, PERMISSIONS_STORAGE, REQUEST_PERMISSION_CODE);
//      }
//      if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
//        ActivityCompat.requestPermissions(this, PERMISSIONS_STORAGE, REQUEST_PERMISSION_CODE);
//      }
//    }
    registerReceiver();
//    HeadlessJsTaskService.acquireWakeLockNow(getApplicationContext());
//    Intent service = new Intent(this, WebSocketTaskService.class);
//    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//      startForegroundService(service);
//    } else {
//      startService(service);
//    }
    if(android.os.Build.BRAND.equalsIgnoreCase(BrandUtils.PHONE_HUAWEI)) {
      getHuaweiToken();
    } else if(android.os.Build.BRAND.equalsIgnoreCase(BrandUtils.PHONE_HONOR)) {
      getHonorToken();
    } else if(android.os.Build.BRAND.equalsIgnoreCase(BrandUtils.PHONE_XIAOMI)) {
      getOtherToken();
    } else if(android.os.Build.BRAND.equalsIgnoreCase(BrandUtils.PHONE_MEIZU)) {
      getOtherToken();
    } else if(android.os.Build.BRAND.equalsIgnoreCase(BrandUtils.PHONE_OPPO)) {
      getOtherToken();
    } else {
      getOtherToken();
    }
  }

  private void getHuaweiToken() {
    new Thread() {
      @Override
      public void run() {
        try {
          // read from agconnect-services.json
          String appId = "108249733";
          String token = HmsInstanceId.getInstance(MainActivity.this).getToken(appId, "HCM");
          Log.i("MainActivity", "get token:" + token);
          SharedPreferences shared = MainActivity.getActivity().getSharedPreferences("notifyData", MODE_PRIVATE);
          SharedPreferences.Editor editor = shared.edit();
          editor.putString("deviceToken", token);
          editor.commit();
        } catch (ApiException e) {
          Log.i("MainActivity", "get token failed, "+e);
        }
      }
    }.start();
  }
  private void getHonorToken() {
    boolean isSupport = HonorPushClient.getInstance().checkSupportHonorPush(getApplicationContext());
    Log.i("MainActivity", "getHonorToken isSupport: "+isSupport);
    if (isSupport) {
      HonorPushClient.getInstance().init(getApplicationContext(), true);
      Log.i("MainActivity", "getHonorToken sdk init success: ");
      // TODO: 使用荣耀推送服务能力
      HonorPushClient.getInstance().getPushToken(new HonorPushCallback<String>() {
        @Override
        public void onSuccess(String pushToken) {
          Log.i("MainActivity", "getHonorToken: "+pushToken);
          // TODO: 新Token处理
          SharedPreferences shared = MainActivity.getActivity().getSharedPreferences("notifyData", MODE_PRIVATE);
          SharedPreferences.Editor editor = shared.edit();
          editor.putString("deviceToken", pushToken);
          editor.commit();
        }

        @Override
        public void onFailure(int errorCode, String errorString) {
          // TODO: 错误处理
        }
      });
    }
  }

  private void getOtherToken() {
    SharedPreferences shared = MainActivity.getActivity().getSharedPreferences("notifyData", MODE_PRIVATE);
    SharedPreferences.Editor editor = shared.edit();
    editor.putString("deviceToken", "0");
    editor.commit();
  }
  public static boolean isOpenNotifySetting() {
    NotificationManagerCompat notification = NotificationManagerCompat.from(context);
    boolean isEnabled = notification.areNotificationsEnabled();
    SharedPreferences shared = context.getSharedPreferences("notifyData", MODE_PRIVATE);
    boolean isFirstOpen = shared.getBoolean("isFirst", true);
    return !isEnabled && isFirstOpen;
  }

  public static void saveSetting() {
    SharedPreferences shared = context.getSharedPreferences("notifyData", MODE_PRIVATE);
    SharedPreferences.Editor editor = shared.edit();
    editor.putBoolean("isFirst", false);
    editor.commit();
  }

  public static void open() {
    boolean isEnabled = isOpenNotifySetting();
    if (isEnabled) {
      Log.i("MainActivity", "通知权限为没有打开");
      openNotify(context);
      SharedPreferences shared = context.getSharedPreferences("notifyData", MODE_PRIVATE);
      SharedPreferences.Editor editor = shared.edit();
      editor.putBoolean("isFirst", false);
      editor.commit();
    } else {
      Log.i("MainActivity", "通知权限已经开启");
    }
  }
  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    if (requestCode == REQUEST_PERMISSION_CODE) {
      for (int i = 0; i < permissions.length; i++) {
        Log.i("MainActivity", "申请的权限为：" + permissions[i] + ",申请结果：" + grantResults[i]);
      }
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
//    setIntent(intent);
    Log.i("MainActivity", "******************************onNewIntent");
    Bundle bundle = intent.getBundleExtra("notification");
    if(bundle!=null){
      Log.i("MainActivity", "MainActivity="+bundle.getBoolean("foreground"));
      getReactInstanceManager().getCurrentReactContext()
              .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
              .emit("noticeOpen", null);
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
  }

  @Override
  public void invokeDefaultOnBackPressed() {
   PackageManager pm = getPackageManager();
   ResolveInfo homeInfo = pm.resolveActivity(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME), 0);
   ActivityInfo ai = homeInfo.activityInfo;
   Intent startIntent = new Intent(Intent.ACTION_MAIN);
   startIntent.addCategory(Intent.CATEGORY_LAUNCHER);
   startIntent.setComponent(new ComponentName(ai.packageName, ai.name));
   startActivity(startIntent);
  }

  @Override
  protected void onPause() {
    super.onPause();

//    PackageManager pm = getPackageManager();
//    ResolveInfo homeInfo = pm.resolveActivity(new Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME), 0);
//    ActivityInfo ai = homeInfo.activityInfo;
//    Intent startIntent = new Intent(Intent.ACTION_MAIN);
//    startIntent.addCategory(Intent.CATEGORY_LAUNCHER);
//    startIntent.setComponent(new ComponentName(ai.packageName, ai.name));
//    startActivity(startIntent);
//    Data inputData = new Data.Builder()
//            .putString("message", "1")
//            .build();
//    WorkRequest headlessJsTaskWorkRequest =
//            new OneTimeWorkRequest.Builder(WebSocketTask.class)
//                    .setInputData(inputData)
//                    .build();
//    WorkManager
//            .getInstance(this)
//            .enqueue(headlessJsTaskWorkRequest);
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    unregisterReceiver(mReceiver);
  }

  private static void openNotify(Context context) {

    Intent intent = new Intent();
    if (Build.VERSION.SDK_INT >= 26) {
      // android 8.0引导
      intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
      intent.putExtra("android.provider.extra.APP_PACKAGE", context.getPackageName());
    } else if (Build.VERSION.SDK_INT >= 21) {
      // android 5.0-7.0
      intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
      intent.putExtra("app_package", context.getPackageName());
      intent.putExtra("app_uid", context.getApplicationInfo().uid);
    } else {
      // 其他
      intent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
      intent.setData(Uri.fromParts("package", context.getPackageName(), null));
    }
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(intent);
  }

  public void startNotice(Context mContext, String title, String content) {
    NotificationManager notificationMgr = ContextCompat.getSystemService(mContext,NotificationManager.class);
    NotificationCompat.Builder builder = new NotificationCompat.Builder(mContext,MainApplication.NOTIFICATION_CHANNEL_ID);
    builder.setAutoCancel(true);
    builder.setSmallIcon(R.drawable.icon_notification);
//    builder.setContentIntent(createPendingIntent(mContext));
    builder.setWhen(System.currentTimeMillis());
    builder.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
    builder.setDefaults(NotificationCompat.DEFAULT_LIGHTS);
    builder.setContentTitle(title);
    builder.setContentText(content);
    builder.setPriority(NotificationCompat.PRIORITY_MAX);
    Notification notification = builder.build();
    notification.defaults = Notification.DEFAULT_SOUND;
    int id = 1123;
    Log.i("MainActivity", "notificationId===="+id);
    notificationMgr.notify(id, notification);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
      return;
    }
//    builder.setFullScreenIntent(notification.contentIntent,false);
    notificationMgr.notify(TAG_HUNG_UP,id, builder.build());
//    notificationMgr.cancel(TAG_HUNG_UP,id);
  }
  private PendingIntent createPendingIntent(Context mContext){
    Intent intent =  new Intent(ACTION_FROM_NOTIFICATION);
    intent.setClass(mContext, MainActivity.class);
    return PendingIntent.getActivity(mContext, 1,intent, PendingIntent.FLAG_UPDATE_CURRENT);
  }

  public void registerReceiver() {
    IntentFilter intentFilter = new IntentFilter();
    intentFilter.addAction("com.alive.ticket");
    registerReceiver(mReceiver, intentFilter);
  }

  private BroadcastReceiver mReceiver = new BroadcastReceiver() {

    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      if(action.equals("com.alive.ticket")){
        String eventName = intent.getStringExtra("eventName");
        getReactInstanceManager().getCurrentReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, null);
      }
    }
  };
}