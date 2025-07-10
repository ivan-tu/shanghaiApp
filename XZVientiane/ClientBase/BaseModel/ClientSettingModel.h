//
//  SettingModel.h
//  TuWeiAApp
//
//  Created by CFJ on 15/12/21.
//  Copyright © 2015年 hans. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ClientSettingModel : NSObject

@property (nonatomic, strong) NSString *mainWebSiteId;
@property (nonatomic, strong) NSString *AppSiteId;

AS_SINGLETON(ClientSettingModel)

- (NSString *)isDebug;

- (NSString *)mainWebSiteId;
//请求appid
- (NSString *)AppSiteId;

- (NSString *)domain;

//响站请求id
- (NSString *)appId;
//app配置参数id
- (NSString *)appSeparateId;

- (NSString *)appSecret;

- (NSString *)appH5Version;

- (NSString *)mainDomain;

- (NSString *)appMainDomain;

@end
