package com.szky.lawyerapp.task;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.work.Data;
import androidx.work.WorkerParameters;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import io.github.wjaykim.rnheadlesstaskworker.HeadlessJsTaskWorker;

public class WebSocketTask extends HeadlessJsTaskWorker {
    public WebSocketTask(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @androidx.annotation.Nullable
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Data data) {
        if (data != null) {
            return new HeadlessJsTaskConfig(
                    "WebSocketConnect",
                    Arguments.makeNativeMap(data.getKeyValueMap()),
                    5000, // timeout for the task
                    true
                    // optional: defines whether or not  the task is allowed in foreground. Default is false
            );
        }
        return null;
    }

}
