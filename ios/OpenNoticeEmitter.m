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
  AVAudioSession* sharedSession = [AVAudioSession sharedInstance];
  if ([sharedSession respondsToSelector:@selector(recordPermission)]) {
    AVAudioSessionRecordPermission permission = [sharedSession recordPermission];
    switch (permission) {
      case AVAudioSessionRecordPermissionUndetermined:
        NSLog(@"Undetermined");
        return @0;
        break;
      case AVAudioSessionRecordPermissionDenied:
        NSLog(@"Denied");
        return @0;
        break;
      case AVAudioSessionRecordPermissionGranted:
        NSLog(@"Granted");
        return @1;
        break;
      default:
        return @0;
        break;
    }
  }
  return @0;
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
