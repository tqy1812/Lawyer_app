package com.szky.lawyerapp.service;

import android.content.SharedPreferences;
import android.text.TextUtils;

import com.hihonor.push.sdk.HonorMessageService;
import com.hihonor.push.sdk.HonorPushDataMsg;
import com.szky.lawyerapp.MainActivity;

public class MyHonorMsgService extends HonorMessageService {
    //Token发生变化时，会以onNewToken方法返回
    @Override
    public void onNewToken(String pushToken) {
        // TODO: 处理收到的新PushToken。
        if (!TextUtils.isEmpty(pushToken)) {
            SharedPreferences shared = MainActivity.getActivity().getSharedPreferences("notifyData", MODE_PRIVATE);
            SharedPreferences.Editor editor = shared.edit();
            editor.putString("deviceToken", pushToken);
            editor.commit();
        }
    }

    @Override
    public void onMessageReceived(HonorPushDataMsg msg) {
        // TODO: 处理收到的透传消息。
    }
}
