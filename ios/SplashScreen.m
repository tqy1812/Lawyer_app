//
//  SplashScreen.m
//  LawyerApp
//
//  Created by yu kuai on 2023/3/17.
//

#import "SplashScreen.h"
@implementation SplashScreen

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(close){
  [[NSNotificationCenter defaultCenter] postNotificationName:@"Notification_CLOSE_SPLASH_SCREEN" object:nil];
}
@end
