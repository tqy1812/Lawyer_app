//
//  SpeechRecognizerModule.h
//  RNSpeechIFlytek
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <iflyMSC/IFlyMSC.h>

@interface SpeechRecognizerModule : RCTEventEmitter <RCTBridgeModule, IFlySpeechRecognizerDelegate> {
    BOOL hasListeners;
}

@property (nonatomic, strong) IFlySpeechRecognizer * iFlySpeechRecognizer;
@property (nonatomic) NSTimeInterval startTime;
@property (nonatomic) NSTimeInterval endTime;
@property (nonatomic, strong) NSMutableString * result;

@end

