//
//  PublicSettingModel.m
//  XiangZhanBase
//
//  Created by yiliu on 16/5/4.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import "PublicSettingModel.h"

@interface PublicSettingModel ()

@property (nonatomic, strong) NSMutableDictionary *settingDic;
@property (nonatomic, strong) NSString *plistPath;
@end

@implementation PublicSettingModel

DEF_SINGLETON(PublicSettingModel)

- (instancetype) init {
    if (self = [super init]) {
        self.plistPath = [[NSBundle mainBundle] pathForResource:@"PublicSetting" ofType:@"plist"];
        self.settingDic = [[NSMutableDictionary alloc] initWithContentsOfFile:self.plistPath];
    }
    return self;
}

- (NSString *)app_Scheme{
    if (!_app_Scheme) {
        _app_Scheme = [self.settingDic objectForKey:@"appScheme"];
    }
    return _app_Scheme;
}

- (BOOL)isXiangJian {
    NSString *isXiangJian = [self.settingDic objectForKey:@"appPackage"];
    if ([isXiangJian isEqualToString:@"xiangjian"]) {
        return YES;
    } else {
        return NO;
    }
}

- (NSString *)umeng_appkey {
    if (!_umeng_appkey) {
        _umeng_appkey = [self.settingDic objectForKey:@"UMeng_AppKey"];
    }
    return _umeng_appkey;
}

- (NSString *)weiBo_AppKey {
    if (!_weiBo_AppKey) {
        _weiBo_AppKey = [self.settingDic objectForKey:@"WeiBo_AppKey"];
    }
    return _weiBo_AppKey;
}

- (NSString *)weiBo_AppSecret {
    if (!_weiBo_AppSecret) {
        _weiBo_AppSecret = [self.settingDic objectForKey:@"WeiBo_AppSecret"];
    }
    return _weiBo_AppSecret;
}

- (NSString *)weiBo_URL {
    if (!_weiBo_URL) {
        _weiBo_URL = [self.settingDic objectForKey:@"WeiBo_URL"];
    }
    return _weiBo_URL;
}

- (NSString *)weiXin_AppID {
    if (!_weiXin_AppID) {
        _weiXin_AppID = [self.settingDic objectForKey:@"WeiXin_AppId"];
    }
    return _weiXin_AppID;
}

- (NSString *)weiXin_AppSecret {
    if (!_weiXin_AppSecret) {
        _weiXin_AppSecret = [self.settingDic objectForKey:@"WeiXin_AppSecret"];
    }
    return _weiXin_AppSecret;
}

- (NSString *)weiXin_Key {
    if (!_weiXin_Key) {
        _weiXin_Key = [self.settingDic objectForKey:@"WeiXin_Key"];
    }
    return _weiXin_Key;
}

- (NSString *)weiXin_Partnerid {
    if (!_weiXin_Partnerid) {
        _weiXin_Partnerid = [self.settingDic objectForKey:@"WeiXin_Partnerid"];
    }
    return _weiXin_Partnerid;
}

- (NSString *)weiXin_URL {
    if (!_weiXin_URL) {
        _weiXin_URL = [self.settingDic objectForKey:@"WeiXin_URL"];
    }
    return _weiXin_URL;
}

- (NSString *)qq_AppId {
    if (!_qq_AppId) {
        _qq_AppId = [self.settingDic objectForKey:@"QQ_AppId"];
    }
    return _qq_AppId;
}

- (NSString *)qq_AppKey {
    if (!_qq_AppKey) {
        _qq_AppKey = [self.settingDic objectForKey:@"QQ_AppKey"];
    }
    return _qq_AppKey;
}

- (NSString *)qq_URL {
    if (!_qq_URL) {
        _qq_URL = [self.settingDic objectForKey:@"QQ_URL"];
    }
    return _qq_URL;
}
@end
