//
//  OpenNoticeEmitter.m
//  LawyerApp
//
//  Created by yu kuai on 2023/2/27.
//
#import "OpenNoticeEmitter.h"
#import <AVFoundation/AVFoundation.h>
#define OPEN @"openNotice"

@implementation OpenNoticeEmitter

static OpenNoticeEmitter *instance = nil;
RCT_EXPORT_MODULE(OpenNoticeEmitter)


RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getInputAudio) {
  if([[AVAudioSession sharedInstance] inputIsAvailable]){
    return @1;
  }
  return @0;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(openSetting) {
  NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
  if ([[UIApplication sharedApplication] canOpenURL:url]) {
    [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
  }
  return @0;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getRecordPermission) {
//  AVAudioSession* sharedSession = [AVAudioSession sharedInstance];
//  if ([sharedSession respondsToSelector:@selector(recordPermission)]) {
//    AVAudioSessionRecordPermission permission = [sharedSession recordPermission];
//    switch (permission) {
//      case AVAudioSessionRecordPermissionUndetermined:
//        NSLog(@"Undetermined");
//        return @0;
//        break;
//      case AVAudioSessionRecordPermissionDenied:
//        NSLog(@"Denied");
//        return @0;
//        break;
//      case AVAudioSessionRecordPermissionGranted:
//        NSLog(@"Granted");
//        return @1;
//        break;
//      default:
//        return @0;
//        break;
//    }
//  }
  AVAuthorizationStatus authStatus = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeAudio];
  if (authStatus == AVAuthorizationStatusNotDetermined) {
    //没有询问是否开启麦克风
    [[NSNotificationCenter defaultCenter] postNotificationName:@"Notification_OPEN_RECORD" object:nil];
    return @0;
  }
  else if (authStatus == AVAuthorizationStatusAuthorized) { //麦克风已开启
    return @2;
  }
  else{ //未授权
    return @1;
  }
  return @1;
}

+ (instancetype)shareInstance {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    instance = [[self alloc] init];
  });
  return instance;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[OPEN];
}

- (void)doOpenNotice {
  [self sendEventWithName:@"openNotice" body:@""];
}
@end
