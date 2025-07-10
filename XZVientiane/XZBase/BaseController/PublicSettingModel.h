//
//  PublicSettingModel.h
//  XiangZhanBase
//
//  Created by yiliu on 16/5/4.
//  Copyright © 2016年 TuWeiA. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "XZFunctionDefine.h"

@interface PublicSettingModel : NSObject

AS_SINGLETON(PublicSettingModel)

//判断是响见还是客户打包
@property (nonatomic, assign) BOOL isXiangJian;

//appstore请求地址
@property (nonatomic, strong) NSString *appStoreID;
@property (nonatomic, strong) NSString *appStoreAddress;

//友盟分析
@property (nonatomic, strong) NSString *umeng_appkey;

//微博授权
@property (nonatomic, strong) NSString *weiBo_AppKey;
@property (nonatomic, strong) NSString *weiBo_AppSecret;
@property (nonatomic, strong) NSString *weiBo_URL;

//微信授权
@property (nonatomic, strong) NSString *weiXin_AppID;
@property (nonatomic, strong) NSString *weiXin_AppSecret;
@property (nonatomic, strong) NSString *weiXin_Key;      //微信支付key
@property (nonatomic, strong) NSString *weiXin_Partnerid;   //微信支付商户id
@property (nonatomic, strong) NSString *weiXin_URL;

//qq授权
@property (nonatomic, strong) NSString *qq_AppId;
@property (nonatomic, strong) NSString *qq_AppKey;
@property (nonatomic, strong) NSString *qq_URL;

//应用回调scheme
@property (nonatomic, strong) NSString *app_Scheme;
@property (nonatomic, copy) NSString *AppSiteId;

@end
