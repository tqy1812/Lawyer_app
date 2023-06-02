//
//  SplashScreen.m
//  LawyerApp
//
//  Created by yu kuai on 2023/3/17.
//

#import "SplashScreen.h"
#import "IQKeyboardManager.h"
@implementation SplashScreen

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(close){
  [[NSNotificationCenter defaultCenter] postNotificationName:@"Notification_CLOSE_SPLASH_SCREEN" object:nil];
}
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getAppVersion) {
  NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
  NSString *applocalversion = [infoDictionary objectForKey:@"CFBundleShortVersionString"];
  return applocalversion;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getStatusHeight) {
  if(@available(iOS 13.0, *)){
    NSSet *set = [UIApplication sharedApplication].connectedScenes;
    UIWindowScene *windowScene = [set anyObject];
    UIStatusBarManager *statusBarManager = windowScene.statusBarManager;
    CGFloat height = statusBarManager.statusBarFrame.size.height;
    int num = (int) height;
    NSString *stringFloat = [NSString stringWithFormat:@"%d",num];
    return stringFloat;
  }
  else{
    CGFloat height = [UIApplication sharedApplication].statusBarFrame.size.height;
    int num = (int) height;
    NSString *stringFloat = [NSString stringWithFormat:@"%d",num];
    return stringFloat;
  }
}
RCT_EXPORT_METHOD(IqKeyboardDisable){
  [[IQKeyboardManager sharedManager] setEnable:NO];
}
RCT_EXPORT_METHOD(IqKeyboardEnable){
  [[IQKeyboardManager sharedManager] setEnable:YES];
}
@end
