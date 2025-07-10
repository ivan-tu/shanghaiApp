//
//  SettingModel.m
//  TuWeiAApp
//
//  Created by CFJ on 15/12/21.
//  Copyright © 2015年 hans. All rights reserved.
//

#import "ClientSettingModel.h"

@interface ClientSettingModel ()

@property (nonatomic, strong) NSDictionary *settingDic;

@end

@implementation ClientSettingModel

DEF_SINGLETON(ClientSettingModel)

- (instancetype) init {
    if (self = [super init]) {
        NSString *plistPath = [[NSBundle mainBundle] pathForResource:@"ClientSetting" ofType:@"plist"];
        self.settingDic = [[NSMutableDictionary alloc] initWithContentsOfFile:plistPath];
    }
    return self;
}

- (NSString *)isDebug {
    return [self.settingDic objectForKey:@"kIsDebug"];
}

- (NSString *)mainWebSiteId {
    if (!_mainWebSiteId) {
        _mainWebSiteId = [self.settingDic objectForKey:@"WebSiteId"];
    }
    return _mainWebSiteId;
}
- (NSString *)AppSiteId {
    if (!_AppSiteId) {
        if (ISIPAD) {
            _AppSiteId = [self.settingDic objectForKey:@"PadAppId"];
        }
        else {
            _AppSiteId = [self.settingDic objectForKey:@"PhoneAppId"];
        }
    }
    return _AppSiteId;
}

- (NSString *)domain {
    NSString *domain = nil;
    if ([[self isDebug] intValue] == 1) {
        domain = [self.settingDic objectForKey:@"Domain"];
        NSLog(@"ClientSettingModel - domain (debug): %@", domain);
    } else {
        domain = [self.settingDic objectForKey:@"formalDomain"];
        NSLog(@"ClientSettingModel - domain (formal): %@", domain);
    }
    return domain;
}

//响站请求id
- (NSString *)appId {
    if ([[self isDebug] intValue] == 1) {
        return [self.settingDic objectForKey:@"AppId"];
    }
    else {
        return [self.settingDic objectForKey:@"formalAppId"];
    }
}
//app配置参数id
- (NSString *)appSeparateId {
    if ([[self isDebug] intValue] == 1) {
        return [self.settingDic objectForKey:@"AppSeparateId"];
    }
    else {
        return [self.settingDic objectForKey:@"formalAppSeparateId"];
    }
}
- (NSString *)appSecret {
    if ([[self isDebug] intValue] == 1) {
        return [self.settingDic objectForKey:@"AppSecret"];
    }
    else {
        return [self.settingDic objectForKey:@"formalAppSecret"];
    }
}

- (NSString *)appH5Version {
    if ([[self isDebug] intValue] == 1) {
        return [self.settingDic objectForKey:@"AppH5Version"];
    }
    else {
        return [self.settingDic objectForKey:@"formalAppH5Version"];
    }
}

- (NSString *)mainDomain {
    if ([[self isDebug] intValue] == 1) {
        return [self.settingDic objectForKey:@"MainDomain"];
    }
    else {
        return [self.settingDic objectForKey:@"formalMainDomain"];
    }
}
- (NSString *)appMainDomain{
    if ([[self isDebug] intValue] == 1) {
        return [self.settingDic objectForKey:@"AppMainDomain"];
    }
    else {
        return [self.settingDic objectForKey:@"formalAppMainDomain"];
    }
}

@end
