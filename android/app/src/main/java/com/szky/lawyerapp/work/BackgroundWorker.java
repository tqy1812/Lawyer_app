package com.szky.lawyerapp.work;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.szky.lawyerapp.task.WebSocketTaskService;

public class BackgroundWorker extends Worker {
    private final Context context;

    public BackgroundWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
        this.context = context;
    }
    @NonNull
    @Override
    public Result doWork() {

        // background work will take place here
        Log.e("com.szky.lawyerapp", "BackgroundWorker do work");
//        Bundle extras = new Bundle();
        Intent service = new Intent(this.context, WebSocketTaskService.class);
//        service.putExtras(extras);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            this.context.startForegroundService(service);
        } else {
            this.context.startService(service);
        }
        return Result.success();
    }
}