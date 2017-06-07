package com.mutual;


import android.content.ComponentName;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.SpeechRecognizer;

//import com.baidu.voicerecognition.android.ui.BaiduASRDigitalDialog;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
//import com.baidu.speech.VoiceRecognitionService;
import com.iflytek.cloud.ui.RecognizerDialog;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import static android.speech.SpeechRecognizer.RESULTS_RECOGNITION;


public class Speak extends ReactContextBaseJavaModule {

    private static final String API_KEY = "i4YOatGVruj07V1ZkPCz1asX";
    private static final String SECRET_KEY = "dcc7776ab44b513cc1a7cbbf12eb5f04";


    Speak(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Override
    public String getName() {
        return "Speak";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("API_KEY", API_KEY);
        constants.put("SECRET_KEY", SECRET_KEY);
        return constants;
    }


    @ReactMethod
    public Void go() {
//        RecognizerDialog mDialog = new RecognizerDialog(this, mInitListener);
//
////若要将 RecognizerDialog 用于语义理解，必须添加以下参数设置，设置之后 onResult 回调返回将是语义理解的结果
//// mDialog.setParameter("asr_sch", "1");
//// mDialog.setParameter("nlp_version", "3.0");
//
////3.设置回调接口
//        mDialog.setListener( mRecognizerDialogListener );
//
////4.显示 dialog，接收语音输入
//        mDialog.show();
        return null;
    }
}

